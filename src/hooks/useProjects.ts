import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useActivityLogs } from './useActivityLogs'

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  created_by: string
  created_at: string
  updated_at: string
  project_type: 'individual' | 'team'
  deadline?: string
  status: string
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { logActivity } = useActivityLogs()

  const fetchProjects = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to load your projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      setError(null)
      
      let teamCode = null
      
      // Generate team code for team projects
      if (projectData.project_type === 'team') {
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_team_code')
        
        if (codeError) throw codeError
        teamCode = codeData
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_by: user.id
        }])
        .select()
        .maybeSingle()

      if (error) throw error
      
      // Create team code record for team projects
      if (projectData.project_type === 'team' && teamCode) {
        await supabase
          .from('team_codes')
          .insert({
            code: teamCode,
            project_id: data.id,
            created_by: user.id
          })
        
        // Add creator as team lead
        await supabase
          .from('project_members')
          .insert({
            project_id: data.id,
            user_id: user.id,
            role: 'lead'
          })
      }
      
      setProjects(prev => [data, ...prev])
      
      // Log activity
      try {
        await logActivity({
          activity_type: 'created_project',
          description: `Created project "${projectData.name}"`,
          project_id: data.id,
          metadata: { project_type: projectData.project_type }
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
      
      return { ...data, teamCode }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      throw err instanceof Error ? err : new Error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const joinProject = async (teamCode: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      setError(null)
      
      // Find valid team code
      const { data: codeData, error: codeError } = await supabase
        .from('team_codes')
        .select('project_id, projects(*)')
        .eq('code', teamCode.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()
      
      if (codeError) throw codeError
      if (!codeData) throw new Error('Invalid or expired team code')
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', codeData.project_id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (existingMember) {
        throw new Error('You are already a member of this project')
      }
      
      // Add as team member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: codeData.project_id,
          user_id: user.id,
          role: 'member'
        })
      
      if (memberError) throw memberError
      
      // Refresh projects
      await fetchProjects()
      
      // Log activity
      try {
        await logActivity({
          activity_type: 'joined_project',
          description: `Joined team project "${codeData.projects.name}"`,
          project_id: codeData.project_id,
          metadata: { team_code: teamCode }
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
      
      return codeData.projects
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join project')
      throw err instanceof Error ? err : new Error('Failed to join project')
    } finally {
      setLoading(false)
    }
  }
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error

      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err instanceof Error ? err : new Error('Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Get project name for logging
      const project = projects.find(p => p.id === id)
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== id))
      
      // Log activity
      try {
        await logActivity({
          activity_type: 'deleted_project',
          description: `Deleted project "${project?.name || 'Unknown'}"`,
          metadata: { project_id: id }
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err instanceof Error ? err : new Error('Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  return {
    projects,
    loading,
    error,
    createProject,
    joinProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
    fetchProjects
  }
}