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

interface Team {
  id: string
  name: string
  code: string
  created_by: string
  created_at: string
  member_count: number
}

export const useTeam = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const fetchTeams = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      // First get teams created by user
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (createdError) throw createdError

      // Then get teams user is a member of
      const userTeamIds = await getUserTeamIds()
      let memberTeams: any[] = []
      
      if (userTeamIds.length > 0) {
        const { data: memberTeamsData, error: memberError } = await supabase
          .from('teams')
          .select('*')
          .in('id', userTeamIds)
          .neq('created_by', user.id) // Avoid duplicates
          .order('created_at', { ascending: false })

        if (memberError) throw memberError
        memberTeams = memberTeamsData || []
      }

      // Combine both arrays
      const allTeams = [...(createdTeams || []), ...memberTeams]
      setTeams(allTeams)

    } catch (error: any) {
      console.error('Error fetching teams:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      // Get team members from projects the user has access to
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            id,
            full_name,
            email,
            is_online,
            last_seen
          )
        `)
        .in('project_id', await getUserProjectIds())
        .order('joined_at', { ascending: false })

      if (error) throw error
      
      const formattedMembers = data?.map(member => ({
        id: member.profiles.id,
        full_name: member.profiles.full_name,
        email: member.profiles.email,
        role: member.role,
        joined_at: member.joined_at,
        is_online: member.profiles.is_online,
        last_seen: member.profiles.last_seen
      })) || []

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
      const { data } = await supabase
        .rpc('get_user_projects', { user_uuid: user.id })
      
      return data?.map(p => p.id) || []
    } catch (error) {
      console.error('Error getting user project IDs:', error)
      return []
    }
  }

  const getUserTeamIds = async (): Promise<string[]> => {
    if (!user) return []
    
    try {
      const { data } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
      
      return data?.map(tm => tm.team_id) || []
    } catch (error) {
      console.error('Error getting team IDs:', error)
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

      // Get user's primary team (first team they created or joined)
      const userTeams = await getUserTeamIds()
      if (userTeams.length === 0) {
        throw new Error('No team found to invite member to')
      }

      const teamId = userTeams[0] // Use first team for now

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', existingUser.id)
        .maybeSingle()

      if (existingMember) {
        throw new Error('User is already a team member')
      }

      // Add member to team
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: existingUser.id,
          role,
          invited_by: user.id
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
        .from('team_members')
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
        .from('team_members')
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
      fetchTeams()
      fetchMembers()
    }
  }, [user])

  return {
    teams,
    members,
    loading,
    error,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchTeams,
    fetchMembers
  }
}