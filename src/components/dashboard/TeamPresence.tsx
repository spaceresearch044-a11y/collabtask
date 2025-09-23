import { useState, useRef, useEffect } from 'react'
  Phone,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User as UserIcon,
  LogOut
import { Users, Circle, MessageCircle, Video, Phone } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useTeam } from '../../hooks/useTeam'
import { useProjects } from '../../hooks/useProjects'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

const getStatusColor = (status: 'online' | 'away' | 'busy' | 'offline') => {
  switch (status) {
    case 'online': return 'bg-green-500 shadow-green-500/50'
    case 'away': return 'bg-yellow-500 shadow-yellow-500/50'
    case 'busy': return 'bg-red-500 shadow-red-500/50'
    case 'offline': return 'bg-gray-500 shadow-gray-500/50'
    default: return 'bg-gray-500'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return Crown
    case 'lead': return Shield
    default: return UserIcon
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'text-yellow-400'
    case 'lead': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

export const TeamPresence: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'lead' | 'member'>('member')
  
  const { members, loading, fetchMembers, inviteMember, removeMember } = useTeam()
  const { projects } = useProjects()
  const { user } = useSelector((state: RootState) => state.auth)
  
  useEffect(() => {
    fetchMembers()
  }, [])
  
  const teamProjects = projects.filter(p => p.project_type === 'team')
  const onlineMembers = members.filter(m => m.is_online)
  
  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return
    
    try {
      await inviteMember(inviteEmail, selectedRole)
      setInviteEmail('')
      setShowInviteModal(false)
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(memberId)
      } catch (error) {
        console.error('Error removing member:', error)
      }
    }
  }

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInviteModal(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Invite
        </Button>
      </div>

      <div className="space-y-3">
        {members.map((member, index) => {
          const RoleIcon = getRoleIcon(member.role)
          const status = member.is_online ? 'online' : 'offline'
          const isCurrentUser = user?.id === member.id
          
          return (
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
                  {member.full_name?.charAt(0) || member.email.charAt(0)}
                    <Video className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    scale: status === 'online' ? [1, 1.2, 1] : 1,
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Voice Call"
                    repeat: status === 'online' ? Infinity : 0 
                    <Phone className="w-3 h-3" />
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${getStatusColor(status)}`}
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate">{member.role}</p>
                  <div className="flex items-center gap-1">
                    <div className={`flex items-center gap-1 ${getRoleColor(member.role)}`}>
                      <RoleIcon className="w-3 h-3" />
                      <span className="text-xs">{member.role}</span>
                    </div>
                    {!isCurrentUser && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove Member"
                        >
                          <UserMinus className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}
              // TODO: Open team management modal
              console.log('Manage team')
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
            className="flex items-center justify-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all text-sm"
                  {status === 'online' ? 'Available' : `Last seen ${new Date(member.last_seen).toLocaleString()}`}
            <Users className="w-4 h-4" />
            Invite Member
          </motion.button>
          )
        })}
        
            onClick={() => setShowInviteModal(true)}
              variant="ghost"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              icon={<UserPlus className="w-3 h-3" />}
            >
              Invite first member
            </Button>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
          </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
        )}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="lead">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
      </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleInviteMember}
                  disabled={!inviteEmail.trim()}
                  className="flex-1"
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  Send Invite
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </Card>
  )
}