import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { RootState } from '../store/store'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
  role: 'admin' | 'lead' | 'member'
  joined_at: string
  is_online: boolean
  last_seen: string
}

export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchMembers = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      // Get project IDs first
      const projectIds = await getUserProjectIds()
      
      if (projectIds.length === 0) {
        setMembers([])
        return
      }

      // Get team members from projects the user has access to
      const { data, error } = await supabase
        .from('project_members')
        .select('user_id, role, joined_at')
        .in('project_id', projectIds)
        .order('joined_at', { ascending: false })

      if (error) throw error
      
      // Get unique user IDs
      const userIds = [...new Set(data?.map(member => member.user_id) || [])]
      
      if (userIds.length === 0) {
        setMembers([])
        return
      }

      // Fetch profile data separately
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_online, last_seen')
        .in('id', userIds)

      if (profileError) throw profileError

      // Combine member data with profile data
      const formattedMembers = data?.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id)
        return {
          id: member.user_id,
          full_name: profile?.full_name || null,
          email: profile?.email || '',
          role: member.role,
          joined_at: member.joined_at,
          is_online: profile?.is_online || false,
          last_seen: profile?.last_seen || new Date().toISOString()
        }
      }).filter(member => member.email) || []

      setMembers(formattedMembers)
    } catch (error: any) {
      console.error('Error fetching members:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getUserProjectIds = async (): Promise<string[]> => {
    if (!user) return []
    
    try {
      // Get projects created by user
      const { data: createdProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('created_by', user.id)
      
      // Get projects user is a member of
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)
      
      const createdIds = createdProjects?.map(p => p.id) || []
      const memberIds = memberProjects?.map(pm => pm.project_id) || []
      
      return [...new Set([...createdIds, ...memberIds])]
    } catch (error) {
      console.error('Error getting user project IDs:', error)
      return []
    }
  }

  const inviteMember = async (email: string, role: 'admin' | 'lead' | 'member' = 'member') => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)
    
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (!existingUser) {
        throw new Error('User not found. They need to create an account first.')
      }

      // Get user's primary project (first project they created)
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('created_by', user.id)
        .limit(1)
        .maybeSingle()
      
      if (!userProjects) {
        throw new Error('No project found to invite member to')
      }

      const projectId = userProjects.id

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', existingUser.id)
        .maybeSingle()

      if (existingMember) {
        throw new Error('User is already a project member')
      }

      // Add member to project
      const { error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: existingUser.id,
          role
        })

      if (error) throw error

      // Refresh members list
      await fetchMembers()
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'lead' | 'member') => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('user_id', memberId)

      if (error) throw error

      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ))
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const removeMember = async (memberId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('user_id', memberId)

      if (error) throw error

      // Update local state
      setMembers(prev => prev.filter(member => member.id !== memberId))
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchMembers()
    }
  }, [user])

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchMembers
  }
}