import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

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

  const fetchProjects = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_by: user.id
        }])
        .select()
        .maybeSingle()

      if (error) throw error
      
      setProjects(prev => [data, ...prev])
      
      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'created_project',
            description: `Created project "${projectData.name}"`,
            metadata: { project_type: projectData.project_type }
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      throw err instanceof Error ? err : new Error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project')
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== id))
      
      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user!.id,
            activity_type: 'deleted_project',
            description: `Deleted project`,
            metadata: { project_id: id }
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project')
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
    updateProject,
    deleteProject,
    refetch: fetchProjects
  }
}