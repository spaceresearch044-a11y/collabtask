import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface ActivityLog {
  id: string
  user_id: string
  project_id?: string
  task_id?: string
  action: string
  target_id?: string
  target_type?: string
  description: string
  metadata: any
  created_at: string
  user_profile?: {
    full_name: string | null
    email: string
  }
}

export const useActivityLogs = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchActivities = async (projectId?: string, limit: number = 50) => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      // First, get the user's accessible project IDs to avoid RLS recursion
      const { data: userProjects, error: projectsError } = await supabase
        .rpc('get_user_projects_safe', { user_id: user.id })
      
      if (projectsError) throw projectsError
      
      const accessibleProjectIds = userProjects?.map((p: any) => p.project_id) || []
      
      // First, get the user's accessible project IDs to avoid RLS recursion
      const { data: userProjects, error: projectsError } = await supabase
        .rpc('get_user_projects_safe', { user_id: user.id })
      
      if (projectsError) throw projectsError
      
      const accessibleProjectIds = userProjects?.map((p: any) => p.project_id) || []
      
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user_profile:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (projectId) {
        // If specific project requested, ensure user has access to it
        if (!accessibleProjectIds.includes(projectId)) {
          throw new Error('Access denied to project')
        }
        // If specific project requested, ensure user has access to it
        if (!accessibleProjectIds.includes(projectId)) {
          throw new Error('Access denied to project')
        }
        query = query.eq('project_id', projectId)
      } else {
        // Filter by accessible projects OR user's own activities
        query = query.or(`project_id.in.(${accessibleProjectIds.join(',')}),user_id.eq.${user.id}`)
      } else {
        // Filter by accessible projects OR user's own activities
        query = query.or(`project_id.in.(${accessibleProjectIds.join(',')}),user_id.eq.${user.id}`)
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
    action: string
    description: string
    project_id?: string
    task_id?: string
    target_id?: string
    target_type?: string
    metadata?: any
  }) => {
    if (!user) return

    try {
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_action: activityData.action,
        p_description: activityData.description,
        p_project_id: activityData.project_id || null,
        p_task_id: activityData.task_id || null,
        p_target_id: activityData.target_id || null,
        p_target_type: activityData.target_type || null,
        p_metadata: activityData.metadata || {}
      })

      // Refresh activities to show the new one
      fetchActivities()
    } catch (error: any) {
      console.error('Error logging activity:', error)
    }
  }

  const subscribeToActivities = (projectId?: string) => {
    if (!user) return

    const channel = supabase
      .channel('activity_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: projectId ? `project_id=eq.${projectId}` : undefined
        },
        (payload) => {
          // Add new activity to the list
          setActivities(prev => [payload.new as ActivityLog, ...prev.slice(0, 49)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user])

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity,
    subscribeToActivities
  }
}