import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Circle, MessageCircle, Video, Phone } from 'lucide-react'
import { Card } from '../ui/Card'
import { useTeam } from '../../hooks/useTeam'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: string
  currentTask?: string
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'UI/UX Designer',
    avatar: 'SC',
    status: 'online',
    currentTask: 'Working on mobile wireframes'
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    role: 'Frontend Developer',
    avatar: 'AR',
    status: 'online',
    currentTask: 'Implementing dashboard components'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    role: 'Product Manager',
    avatar: 'EW',
    status: 'busy',
    currentTask: 'In meeting with stakeholders'
  },
  {
    id: '4',
    name: 'Mike Johnson',
    role: 'Backend Developer',
    avatar: 'MJ',
    status: 'away',
    lastSeen: '5 minutes ago'
  },
  {
    id: '5',
    name: 'Lisa Park',
    role: 'QA Engineer',
    avatar: 'LP',
    status: 'online',
    currentTask: 'Testing API endpoints'
  },
  {
    id: '6',
    name: 'David Kim',
    role: 'DevOps Engineer',
    avatar: 'DK',
    status: 'offline',
    lastSeen: '2 hours ago'
  }
]

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'online': return 'bg-green-500 shadow-green-500/50'
    case 'away': return 'bg-yellow-500 shadow-yellow-500/50'
    case 'busy': return 'bg-red-500 shadow-red-500/50'
    case 'offline': return 'bg-gray-500 shadow-gray-500/50'
    default: return 'bg-gray-500'
  }
}

const getStatusText = (member: TeamMember) => {
  switch (member.status) {
    case 'online': return member.currentTask || 'Available'
    case 'away': return `Away • ${member.lastSeen}`
    case 'busy': return member.currentTask || 'Busy'
    case 'offline': return `Offline • ${member.lastSeen}`
    default: return 'Unknown'
  }
}

export const TeamPresence: React.FC = () => {
  const { members, loading, fetchMembers } = useTeam()
  
  useEffect(() => {
    fetchMembers()
  }, [])
  
  // Convert team members to the expected format
  const teamMembers: TeamMember[] = members.map(member => ({
    id: member.id,
    name: member.full_name || member.email,
    role: member.role === 'lead' ? 'Team Lead' : 'Team Member',
    avatar: (member.full_name?.charAt(0) || member.email.charAt(0)).toUpperCase(),
    status: member.is_online ? 'online' : 'offline',
    lastSeen: member.last_seen ? new Date(member.last_seen).toLocaleString() : 'Unknown'
  }))
  
  const onlineMembers = teamMembers.filter(m => m.status === 'online' || m.status === 'busy')

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Team Presence
          <span className="text-sm text-gray-400">({onlineMembers.length} online)</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(55, 65, 81, 0.3)' }}
            className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group"
          >
            {/* Avatar with Status */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-sm font-medium text-white"
              >
                {member.avatar}
              </motion.div>
              <motion.div
                animate={{ 
                  scale: member.status === 'online' ? [1, 1.2, 1] : 1,
                }}
                transition={{ 
                  duration: 2, 
                  repeat: member.status === 'online' ? Infinity : 0 
                }}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${getStatusColor(member.status)}`}
              />
            </div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                  {member.name}
                </h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                    title="Message"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Voice Call"
                  >
                    <Phone className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate">{member.role}</p>
              <p className="text-xs text-gray-500 truncate mt-1">
                {getStatusText(member)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all text-sm"
          >
            <Video className="w-4 h-4" />
            Start Meeting
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open team management modal
              console.log('Manage team')
            }}
            className="flex items-center justify-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all text-sm"
          >
            <Users className="w-4 h-4" />
            Invite Member
          </motion.button>
        </div>
      </div>
    </Card>
  )
}