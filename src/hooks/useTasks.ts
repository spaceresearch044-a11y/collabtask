import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useActivityLogs } from './useActivityLogs'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id: string
  assigned_to?: string
  created_by: string
  due_date?: string
  position: number
  created_at: string
  updated_at: string
  tags?: string[]
}

export const useTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { logActivity } = useActivityLogs()

  const fetchTasks = async (forceProjectId?: string) => {
    if (!user) return
    
    const targetProjectId = forceProjectId || projectId
    if (!targetProjectId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(
            id,
            full_name,
            email
          ),
          created_by_profile:profiles!tasks_created_by_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('project_id', targetProjectId)
        .order('position', { ascending: true })


      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'position'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
          position: tasks.length
        }])
        .select()
        .maybeSingle()

      if (error) throw error
      
      setTasks(prev => [...prev, data])
      
      // Log activity
      try {
        await logActivity({
          activity_type: 'created_task',
          description: `Created task "${taskData.title}"`,
          project_id: taskData.project_id,
          task_id: data.id,
          metadata: { priority: taskData.priority, status: taskData.status }
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      throw err instanceof Error ? err : new Error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error

      setTasks(prev => prev.map(t => t.id === id ? data : t))
      
      // Log activity for status changes
      if (updates.status) {
        try {
          await logActivity({
            activity_type: updates.status === 'completed' ? 'completed_task' : 'updated_task',
            description: `${updates.status === 'completed' ? 'Completed' : 'Updated'} task "${data.title}"`,
            project_id: data.project_id,
            task_id: id,
            metadata: { new_status: updates.status }
          })
        } catch (logError) {
          console.warn('Activity logging failed:', logError)
        }
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err instanceof Error ? err : new Error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Get task info for logging
      const task = tasks.find(t => t.id === id)
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.filter(t => t.id !== id))
      
      // Log activity
      try {
        await logActivity({
          activity_type: 'deleted_task',
          description: `Deleted task "${task?.title || 'Unknown'}"`,
          project_id: task?.project_id,
          metadata: { task_id: id }
        })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err instanceof Error ? err : new Error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const updateTaskPosition = async (taskId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ position: newPosition })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, position: newPosition } : t
      ).sort((a, b) => a.position - b.position))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update task position')
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchTasks()
    }
  }, [user, projectId])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskPosition,
    refetch: fetchTasks,
    fetchTasks
  }
}