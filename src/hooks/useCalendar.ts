import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface CalendarEvent {
  id: string
  project_id?: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  event_type: string
  created_at: string
  updated_at: string
}

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchEvents = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`user_id.eq.${user.id},project_id.in.(${await getUserProjectIds()})`)
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      console.error('Error fetching calendar events:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getUserProjectIds = async (): Promise<string> => {
    if (!user) return ''
    
    const { data } = await supabase
      .from('projects')
      .select('id')
      .or(`created_by.eq.${user.id},id.in.(${await getUserMemberProjectIds()})`)
    
    return data?.map(p => p.id).join(',') || ''
  }

  const getUserMemberProjectIds = async (): Promise<string> => {
    if (!user) return ''
    
    const { data } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
    
    return data?.map(pm => pm.project_id).join(',') || ''
  }

  const createEvent = async (eventData: {
    title: string
    description?: string
    start_time: string
    end_time: string
    all_day?: boolean
    project_id?: string
    event_type?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id,
          all_day: eventData.all_day || false,
          event_type: eventData.event_type || 'custom'
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_action: 'created_event',
        p_description: `Created calendar event "${eventData.title}"`,
        p_project_id: eventData.project_id || null,
        p_target_id: data.id,
        p_target_type: 'calendar_event'
      })

      setEvents(prev => [...prev, data])
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error

      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...data } : event
      ))
      
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents
  }
}