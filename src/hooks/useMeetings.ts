import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface Meeting {
  id: string
  project_id?: string
  title: string
  description?: string
  start_time: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  meeting_url?: string
  participants: string[]
  notes?: string
  recording_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchMeetings = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .or(`created_by.eq.${user.id},participants.cs.["${user.id}"]`)
        .order('start_time', { ascending: true })

      if (error) throw error
      setMeetings(data || [])
    } catch (error: any) {
      console.error('Error fetching meetings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createMeeting = async (meetingData: {
    title: string
    description?: string
    start_time: string
    duration?: number
    project_id?: string
    participants?: string[]
  }) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...meetingData,
          created_by: user.id,
          duration: meetingData.duration || 60,
          participants: meetingData.participants || [],
          status: 'scheduled',
          meeting_url: `https://meet.collabtask.com/${Math.random().toString(36).substr(2, 9)}`
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
            activity_type: 'scheduled_meeting',
            description: `Scheduled meeting "${meetingData.title}"`,
            project_id: meetingData.project_id || null,
            metadata: { duration: meetingData.duration }
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      setMeetings(prev => [...prev, data])
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .maybeSingle()

      if (error) throw error

      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? { ...meeting, ...data } : meeting
      ))
      
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const joinMeeting = async (meetingId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Update meeting status to in_progress if it's the first participant
      const meeting = meetings.find(m => m.id === meetingId)
      if (meeting && meeting.status === 'scheduled') {
        await updateMeeting(meetingId, { status: 'in_progress' })
      }

      // Log activity
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'joined_meeting',
            description: `Joined meeting "${meeting?.title}"`,
            project_id: meeting?.project_id || null,
            metadata: { meeting_id: meetingId }
          })
      } catch (logError) {
        console.warn('Activity logging failed:', logError)
      }

      // Return meeting URL for joining
      return meeting?.meeting_url
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId)

      if (error) throw error

      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  return {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    joinMeeting,
    deleteMeeting,
    fetchMeetings
  }
}