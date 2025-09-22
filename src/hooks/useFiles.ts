import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface FileItem {
  id: string
  project_id?: string
  task_id?: string
  uploaded_by: string
  name: string
  url: string
  size?: bigint
  mime_type?: string
  created_at: string
}

export const useFiles = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchFiles = async (projectId?: string) => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      } else {
        // Fetch files from user's projects or files they uploaded
        query = query.eq('uploaded_by', user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setFiles(data || [])
    } catch (error: any) {
      console.error('Error fetching files:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (
    file: File,
    options: {
      project_id?: string
      task_id?: string
    } = {}
  ) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      // For demo purposes, create a mock file URL
      const mockUrl = `https://files.collabtask.com/${user.id}/${file.name}`

      // Insert file metadata
      const { data, error } = await supabase
        .from('files')
        .insert({
          uploaded_by: user.id,
          project_id: options.project_id || null,
          task_id: options.task_id || null,
          name: file.name,
          url: mockUrl,
          size: file.size,
          mime_type: file.type,
        })
        .select()
        .maybeSingle()

      if (error) throw error

      // Log activity (optional, ignore errors)
      try {
        // This would use the activity logs hook
        console.log('File uploaded:', file.name)
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      setFiles(prev => [data, ...prev])
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      // Get file info first
      const file = files.find(f => f.id === fileId)
      if (!file) throw new Error('File not found')

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('uploaded_by', user.id) // Ensure user can only delete their own files

      if (error) throw error

      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])

  return {
    files,
    loading,
    error,
    uploadFile,
    deleteFile,
    fetchFiles
  }
}