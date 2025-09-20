import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface Report {
  id: string
  project_id?: string
  generated_by: string
  title: string
  type: 'weekly' | 'monthly' | 'custom' | 'project_summary'
  content: any
  file_url?: string
  date_range_start?: string
  date_range_end?: string
  created_at: string
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchReports = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('generated_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      console.error('Error fetching reports:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportData: {
    title: string
    type: 'weekly' | 'monthly' | 'custom' | 'project_summary'
    project_id?: string
    date_range_start?: string
    date_range_end?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      // Generate report content based on type
      const content = await generateReportContent(reportData)

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          generated_by: user.id,
          content
        })
        .select()
        .maybeSingle()

      if (error) throw error

      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'generated_report',
            description: `Generated ${reportData.type} report "${reportData.title}"`,
            project_id: reportData.project_id || null,
            metadata: { report_type: reportData.type }
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      setReports(prev => [data, ...prev])
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const generateReportContent = async (reportData: {
    type: string
    project_id?: string
    date_range_start?: string
    date_range_end?: string
  }) => {
    const content: any = {
      summary: {},
      tasks: [],
      projects: [],
      meetings: [],
      files: []
    }

    try {
      // Fetch tasks data
      let tasksQuery = supabase.from('tasks').select('*')
      if (reportData.project_id) {
        tasksQuery = tasksQuery.eq('project_id', reportData.project_id)
      }
      if (reportData.date_range_start) {
        tasksQuery = tasksQuery.gte('created_at', reportData.date_range_start)
      }
      if (reportData.date_range_end) {
        tasksQuery = tasksQuery.lte('created_at', reportData.date_range_end)
      }

      const { data: tasks } = await tasksQuery
      content.tasks = tasks || []

      // Calculate summary statistics
      content.summary = {
        total_tasks: tasks?.length || 0,
        completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
        in_progress_tasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
        overdue_tasks: tasks?.filter(t => 
          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        ).length || 0
      }

      // Fetch projects data if not project-specific
      if (!reportData.project_id) {
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('created_by', user!.id)
        content.projects = projects || []
      }

      return content
    } catch (error) {
      console.error('Error generating report content:', error)
      return content
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      setReports(prev => prev.filter(r => r.id !== reportId))
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (reportId: string, format: 'pdf' | 'csv' | 'excel') => {
    // This would typically call a Supabase Edge Function to generate the export
    // For now, we'll return a mock URL
    return `https://reports.collabtask.com/export/${reportId}.${format}`
  }

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  return {
    reports,
    loading,
    error,
    generateReport,
    deleteReport,
    exportReport,
    fetchReports
  }
}