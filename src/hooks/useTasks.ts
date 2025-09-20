import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

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

  const fetchTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'position'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
          position: tasks.length
        }])
        .select()
        .single()

      if (error) throw error
      
      setTasks(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create task')
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update task')
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete task')
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
    fetchTasks()
  }, [user, projectId])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskPosition,
    refetch: fetchTasks
  }
}