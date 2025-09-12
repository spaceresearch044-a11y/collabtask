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
    try {
      // Fetch projects where user is creator or member
      const { data: userProjects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(role),
          team_codes(code)
        `)
        .or(`created_by.eq.${user.id},project_members.user_id.eq.${user.id}`)

      if (projectsError) throw projectsError

      dispatch(setProjects(userProjects || []))
    } catch (error: any) {
      dispatch(setError(error.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const createProject = async (projectData: {
    name: string
    description?: string
    project_type: 'individual' | 'team'
    deadline?: string | null
    priority: 'low' | 'medium' | 'high'
  }) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
          color: getRandomColor(),
        })
        .select()
        .single()

      if (projectError) throw projectError

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
      if (projectData.project_type === 'team') {
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_team_code')

        if (codeError) throw codeError

        const { error: teamCodeError } = await supabase
          .from('team_codes')
          .insert({
            code: codeData,
            project_id: project.id,
            created_by: user.id,
          })

        if (teamCodeError) throw teamCodeError
        teamCode = codeData
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          project_id: project.id,
          activity_type: 'created_project',
          description: `Created project "${project.name}"`,
        })

      dispatch(addProject(project))
      return { project, teamCode }
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const joinProject = async (teamCode: string) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    try {
      // Find project by team code
      const { data: codeData, error: codeError } = await supabase
        .from('team_codes')
        .select('project_id, projects(*)')
        .eq('code', teamCode)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (codeError) throw new Error('Invalid or expired team code')

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', codeData.project_id)
        .eq('user_id', user.id)
        .single()

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
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          project_id: codeData.project_id,
          activity_type: 'joined_project',
          description: `Joined project "${codeData.projects.name}"`,
        })

      dispatch(addProject(codeData.projects))
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
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()

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