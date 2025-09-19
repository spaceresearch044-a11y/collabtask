import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface FileItem {
  id: string
  project_id?: string
  task_id?: string
  user_id: string
  name: string
  file_url: string
  file_size?: number
  mime_type?: string
  version: number
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
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
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
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
      tags?: string[]
      is_public?: boolean
    } = {}
  ) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      // Insert file metadata
      const { data, error } = await supabase
        .from('files')
        .insert({
          uploaded_by: user.id,
          uploaded_by: user.id,
          user_id: user.id,
          project_id: options.project_id || null,
          task_id: options.task_id || null,
          name: file.name,
          url: publicUrl,
          file_url: publicUrl,
          file_size: file.size,
          size: file.size,
          mime_type: file.type,
          version: 1,
          tags: options.tags || [],
          is_public: options.is_public || false,
        })
        .select()
        .maybeSingle()

      if (error) throw error

      // Log activity
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_action: 'uploaded_file',
        p_description: `Uploaded file "${file.name}"`,
        p_project_id: options.project_id || null,
        p_target_id: data.id,
        p_target_type: 'file'
      })

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

      // Delete from storage
      const filePath = file.file_url.split('/').pop()
      if (filePath) {
        await supabase.storage
          .from('files')
          .remove([`${user.id}/${filePath}`])
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const attachToTask = async (fileId: string, taskId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('files')
        .update({ task_id: taskId })
        .eq('id', fileId)
        .select()
        .maybeSingle()

      if (error) throw error

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, task_id: taskId } : f
      ))
      
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
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
    attachToTask,
    fetchFiles
  }
}