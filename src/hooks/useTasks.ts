import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'
import {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setLoading,
  setError,
} from '../store/slices/tasksSlice'

export const useTasks = (projectId?: string) => {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.tasks
  )
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (user && projectId) {
      fetchTasks(projectId)
    }
  }, [user, projectId])

  const fetchTasks = async (projectId: string) => {
    if (!user) return

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:assigned_to(
            id,
            full_name,
            email
          ),
          created_by_profile:created_by(
            id,
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (error) throw error

      dispatch(setTasks(data || []))
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      dispatch(setError(error.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const createTask = async (taskData: {
    title: string
    description?: string
    project_id: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assigned_to?: string | null
    due_date?: string | null
    status?: 'todo' | 'in_progress' | 'review' | 'completed'
  }) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      // Ensure user profile exists before creating task
      await supabase.rpc('ensure_user_profile_exists', { user_id: user.id })
      
      // Check if user has permission to create tasks in this project
      const { data: membership, error: membershipError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', taskData.project_id)
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', taskData.project_id)
        .maybeSingle()

      if (projectError || !project) {
        throw new Error('Project not found')
      }

      // User must be project creator or a member
      if (project.created_by !== user.id && !membership) {
        throw new Error('You do not have permission to create tasks in this project')
      }

      // Get the highest position for ordering
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', taskData.project_id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      const position = lastTask ? lastTask.position + 1 : 0

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id,
          position,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium'
        })
        .select(`
          *,
          assigned_to_profile:assigned_to(
            id,
            full_name,
            email
          ),
          created_by_profile:created_by(
            id,
            full_name,
            email
          )
        `)
        .maybeSingle()

      if (taskError || !task) {
        throw new Error(taskError?.message || 'Failed to create task')
      }

      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            project_id: taskData.project_id,
            task_id: task.id,
            activity_type: 'created_task',
            description: `Created task "${task.title}"`,
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      dispatch(addTask(task))
      
      // Refetch to ensure consistency
      setTimeout(() => fetchTasks(taskData.project_id), 100)
      
      return task
    } catch (error: any) {
      console.error('Create task error:', error)
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const updateTaskData = async (
    taskId: string,
    updates: Partial<{
      title: string
      description: string
      status: 'todo' | 'in_progress' | 'review' | 'completed'
      priority: 'low' | 'medium' | 'high' | 'urgent'
      assigned_to: string | null
      due_date: string | null
      position: number
    }>
  ) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          assigned_to_profile:assigned_to(
            id,
            full_name,
            email
          ),
          created_by_profile:created_by(
            id,
            full_name,
            email
          )
        `)
        .maybeSingle()

      if (error || !data) {
        throw new Error(error?.message || 'Failed to update task')
      }

      // Log activity for status changes
      if (updates.status === 'completed') {
        try {
          await supabase
            .from('activity_logs')
            .insert({
              user_id: user.id,
              project_id: data.project_id,
              task_id: data.id,
              activity_type: 'completed_task',
              description: `Completed task "${data.title}"`,
            })
        } catch (logError) {
          console.warn('Activity logging failed:', logError)
        }
      }

      dispatch(updateTask(data))
      return data
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const deleteTaskData = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated')

    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      dispatch(deleteTask(taskId))
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const assignTask = async (taskId: string, userId: string | null) => {
    return updateTaskData(taskId, { assigned_to: userId })
  }

  const moveTask = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'completed', newPosition: number) => {
    return updateTaskData(taskId, { status: newStatus, position: newPosition })
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask: updateTaskData,
    deleteTask: deleteTaskData,
    assignTask,
    moveTask,
    fetchTasks,
  }
}