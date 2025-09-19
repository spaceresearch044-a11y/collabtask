import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'
import {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading,
  setError,
} from '../store/slices/projectsSlice'

export const useProjects = () => {
  const dispatch = useDispatch()
  const { projects, currentProject, loading, error } = useSelector(
    (state: RootState) => state.projects
  )
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      // First check if user profile exists and has ever created projects
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_ever_created_project')
        .eq('id', user.id)
        .maybeSingle()

      // Fetch user's own projects and projects they're members of
      const { data: ownProjects, error: ownError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)

      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          projects (*)
        `)
        .eq('user_id', user.id)

      if (ownError && profile?.has_ever_created_project) {
        // Only show error if user has created projects before
        console.error('Error fetching own projects:', ownError)
        dispatch(setError('Failed to load your projects. Please try again.'))
        return
      }

      if (memberError && profile?.has_ever_created_project) {
        // Only show error if user has joined projects before
        console.error('Error fetching member projects:', memberError)
        dispatch(setError('Failed to load your projects. Please try again.'))
        return
      }

      // Combine own projects and member projects
      const allProjects = [
        ...(ownProjects || []).map(p => ({ ...p, user_role: 'owner' })),
        ...(memberProjects || []).map(mp => ({ 
          ...mp.projects, 
          user_role: mp.role 
        }))
      ]

      // Always set projects array, even if empty
      dispatch(setProjects(allProjects))

    } catch (error: any) {
      console.error('Error fetching projects:', error)
      // Only show error if user has created/joined projects before
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_ever_created_project')
        .eq('id', user.id)
        .maybeSingle()
      
      if (profile?.has_ever_created_project) {
        dispatch(setError('Failed to load your projects. Please try again.'))
      }
    } finally {
      dispatch(setLoading(false))
    }
  }

  const createProject = async (projectData: {
    name: string
    description?: string
    project_type?: 'individual' | 'team'
    deadline?: string | null
    color?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      // Ensure user profile exists before creating project
      await supabase.rpc('ensure_user_profile_exists', { user_id: user.id })
      
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          project_type: projectData.project_type || 'individual',
          deadline: projectData.deadline,
          created_by: user.id,
          color: projectData.color || getRandomColor(),
          status: 'active'
        })
        .select()
        .maybeSingle()

      if (projectError || !project) {
        throw new Error(projectError?.message || 'Failed to create project')
      }

      // Add creator as project member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'lead',
        })

      if (memberError) throw memberError

      let teamCode = null

      // Generate team code for team projects
      if ((projectData.project_type || 'individual') === 'team') {
        try {
          const { data: generatedCode, error: codeError } = await supabase
            .rpc('generate_team_code')

          if (codeError) {
            console.warn('Team code generation failed:', codeError)
            // Continue without team code for now
          } else {
            const { error: teamCodeError } = await supabase
              .from('team_codes')
              .insert({
                code: generatedCode,
                project_id: project.id,
                created_by: user.id,
              })

            if (!teamCodeError) {
              teamCode = generatedCode
            }
          }
        } catch (codeError) {
          console.warn('Team code creation failed:', codeError)
          // Continue without team code
        }
      }

      // Log activity
      try {
        await supabase.rpc('log_activity', {
          p_user_id: user.id,
          p_action: 'created_project',
          p_description: `Created project "${project.name}"`,
          p_project_id: project.id,
          p_target_id: project.id,
          p_target_type: 'project'
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
        // Continue without logging
      }

      // Update user's project creation flag
      try {
        await supabase
          .from('profiles')
          .update({ has_ever_created_project: true })
          .eq('id', user.id)
      } catch (updateError) {
        console.warn('Profile update failed:', updateError)
      }

      // Add project to local state with team code
      const projectWithCode = {
        ...project,
        team_code: teamCode,
        user_role: 'lead'
      }
      dispatch(addProject(projectWithCode))
      
      // Refetch to ensure consistency
      setTimeout(() => fetchProjects(), 100)
      
      return { project, teamCode }
    } catch (error: any) {
      console.error('Create project error:', error)
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const joinProject = async (teamCode: string) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      // Ensure user profile exists
      await supabase.rpc('ensure_user_profile_exists', { user_id: user.id })
      
      // Find project by team code
      const { data: codeData, error: codeError } = await supabase
        .from('team_codes')
        .select(`
          project_id,
          projects(*)
        `)
        .eq('code', teamCode)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (codeError || !codeData) {
        throw new Error('Invalid or expired team code')
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', codeData.project_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMember) {
        throw new Error('You are already a member of this project')
      }

      // Add user as project member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: codeData.project_id,
          user_id: user.id,
          role: 'member',
        })

      if (memberError) throw memberError

      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            project_id: codeData.project_id,
            activity_type: 'joined_project',
            description: `Joined project "${codeData.projects.name}"`,
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      dispatch(addProject(codeData.projects))
      
      // Refetch to ensure consistency
      setTimeout(() => fetchProjects(), 100)
      
      return codeData.projects
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const updateProjectData = async (
    projectId: string,
    updates: Partial<{
      name: string
      description: string
      status: string
      deadline: string
      priority: string
    }>
  ) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .maybeSingle()

      if (error) throw error

      dispatch(updateProject(data))
      return data
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const deleteProjectData = async (projectId: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      dispatch(deleteProject(projectId))
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    joinProject,
    updateProject: updateProjectData,
    deleteProject: deleteProjectData,
    setCurrentProject: (project: any) => dispatch(setCurrentProject(project)),
    fetchProjects,
  }
}

const getRandomColor = () => {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#f97316', // orange
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}