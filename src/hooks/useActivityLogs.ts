import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface ActivityLog {
  id: string
  user_id: string
  project_id?: string
  task_id?: string
  action: 'created_project' | 'updated_project' | 'deleted_project' | 'created_task' | 'updated_task' | 'completed_task' | 'deleted_task' | 'uploaded_file' | 'scheduled_meeting' | 'joined_meeting' | 'created_event' | 'generated_report'
  target_id?: string
  target_type?: string
  description: string
  metadata: Record<string, any>
  created_at: string
  user_profile?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export const useActivityLogs = (projectId?: string) => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchActivities = async (projectId?: string) => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles!activity_logs_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setActivities(data || [])
    } catch (error: any) {
      console.error('Error fetching activity logs:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (activityData: {
    action: ActivityLog['action']
    description: string
    project_id?: string
    task_id?: string
    target_id?: string
    target_type?: string
    metadata?: Record<string, any>
  }) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_action: activityData.action,
        p_description: activityData.description,
        p_project_id: activityData.project_id || null,
        p_task_id: activityData.task_id || null,
        p_target_id: activityData.target_id || null,
        p_target_type: activityData.target_type || null,
        p_metadata: activityData.metadata || {}
      })

      if (error) throw error

      // Refresh activities after logging
      if (projectId) {
        fetchActivities(projectId)
      }
    } catch (error: any) {
      console.error('Error logging activity:', error)
      throw error
    }
  }

  const getRecentActivities = async (limit: number = 10) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles!activity_logs_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching recent activities:', error)
      return []
    }
  }

  const getProjectActivities = async (projectId: string, limit: number = 20) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles!activity_logs_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching project activities:', error)
      return []
    }
  }

  const getUserActivities = async (userId: string, limit: number = 20) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles!activity_logs_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching user activities:', error)
      return []
    }
  }

  const getActivitiesByType = async (action: ActivityLog['action'], limit: number = 20) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles!activity_logs_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching activities by type:', error)
      return []
    }
  }

  const deleteActivity = async (activityId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', activityId)
        .eq('user_id', user.id) // Only allow users to delete their own activities

      if (error) throw error

      setActivities(prev => prev.filter(activity => activity.id !== activityId))
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  const clearUserActivities = async () => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setActivities([])
    } catch (error: any) {
      console.error('Error clearing activities:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchActivities(projectId)
    }
  }, [user, projectId])

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity,
    getRecentActivities,
    getProjectActivities,
    getUserActivities,
    getActivitiesByType,
    deleteActivity,
    clearUserActivities
  }
}