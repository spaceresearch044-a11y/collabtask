import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Crown, 
  Shield, 
  User,
  Mail,
  Calendar,
  MoreVertical,
  UserPlus,
  Settings
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useTeam } from '../../hooks/useTeam'

export const TeamPage: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'lead' | 'member'>('member')
  const { teams, members, loading, inviteMember, updateMemberRole } = useTeam()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'lead': return Shield
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-400 bg-yellow-500/20'
      case 'lead': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 text-orange-400"
            >
              <Users className="w-full h-full" />
            </motion.div>
            Team Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your team members and roles
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowInviteModal(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Invite Member
        </Button>
      </motion.div>

      {/* Team Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Members', value: members.length, color: 'from-blue-500 to-cyan-600' },
          { label: 'Admins', value: members.filter(m => m.role === 'admin').length, color: 'from-yellow-500 to-orange-600' },
          { label: 'Team Leads', value: members.filter(m => m.role === 'lead').length, color: 'from-purple-500 to-violet-600' },
          { label: 'Active Projects', value: teams.length, color: 'from-green-500 to-emerald-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="p-6 hover:scale-105 transition-transform" hover>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>
                Manage Roles
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {members.map((member, index) => {
              const RoleIcon = getRoleIcon(member.role)
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.full_name?.charAt(0) || member.email.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {member.full_name || 'Unnamed User'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      <RoleIcon className="w-3 h-3" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(member.joined_at).toLocaleDateString()}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MoreVertical className="w-4 h-4" />}
                    />
                  </div>
                </motion.div>
              )
            })}

            {members.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No team members yet</p>
                <p className="text-sm">Invite your first team member to get started</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

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
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  icon={<Mail className="w-4 h-4" />}
                />

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
    </div>
  )
}