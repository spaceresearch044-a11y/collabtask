import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Copy,
  Check,
  Flag,
  Target,
  User,
  Settings,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useProjects } from '../../hooks/useProjects'
import { useTasks } from '../../hooks/useTasks'
import { useTeam } from '../../hooks/useTeam'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  project_type: 'individual' | 'team'
  status: string
  deadline: string | null
  created_at: string
  updated_at: string
  created_by: string
}

interface ProjectDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onUpdate: () => void
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [teamCode, setTeamCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  
  const [editData, setEditData] = useState({
    name: project.name,
    description: project.description || '',
    deadline: project.deadline ? project.deadline.split('T')[0] : '',
    color: project.color,
    status: project.status
  })

  const { updateProject, deleteProject, loading } = useProjects()
  const { tasks } = useTasks(project.id)
  const { members } = useTeam()

  useEffect(() => {
    if (project.project_type === 'team') {
      fetchTeamCode()
    }
  }, [project.id])

  const fetchTeamCode = async () => {
    try {
      const { data } = await supabase
        .from('team_codes')
        .select('code')
        .eq('project_id', project.id)
        .maybeSingle()
      
      if (data) {
        setTeamCode(data.code)
      }
    } catch (error) {
      console.error('Error fetching team code:', error)
    }
  }

  const handleSave = async () => {
    try {
      await updateProject(project.id, editData)
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id)
        onUpdate()
        onClose()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'completed': return 'text-blue-400 bg-blue-500/20'
      case 'paused': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  }

  const completionPercentage = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Target },
    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings }
  ]

  const colors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#f97316', '#84cc16'
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <Card className="h-full flex flex-col" glow>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: project.color }}
                  >
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.project_type === 'team' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {project.project_type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(!isEditing)}
                    icon={<Edit className="w-4 h-4" />}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-6 border-b border-gray-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          label="Project Name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          icon={<Target className="w-4 h-4" />}
                        />
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Description
                          </label>
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Project description..."
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="date"
                            label="Deadline"
                            value={editData.deadline}
                            onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                            icon={<Calendar className="w-4 h-4" />}
                          />
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                              Status
                            </label>
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Color Theme
                          </label>
                          <div className="grid grid-cols-8 gap-2">
                            {colors.map((color) => (
                              <motion.button
                                key={color}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditData({ ...editData, color })}
                                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                  editData.color === color 
                                    ? 'border-white shadow-lg' 
                                    : 'border-gray-600 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={loading}
                            className="flex-1"
                            icon={<Check className="w-4 h-4" />}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Project Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                              <p className="text-gray-200">
                                {project.description || 'No description provided'}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Created</h4>
                              <p className="text-gray-200">{formatDate(project.created_at)}</p>
                            </div>
                            
                            {project.deadline && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Deadline</h4>
                                <p className="text-gray-200">{formatDate(project.deadline)}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Task Progress */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-3">Task Progress</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-200">Completion</span>
                                  <span className="text-blue-400 font-medium">{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 1 }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-400">Completed: {taskStats.completed}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-400">In Progress: {taskStats.inProgress}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Team Code for Team Projects */}
                            {project.project_type === 'team' && teamCode && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-3">Team Code</h4>
                                <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                                  <span className="font-mono text-blue-400 font-bold">{teamCode}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyTeamCode}
                                    icon={codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  >
                                    {codeCopied ? 'Copied!' : 'Copy'}
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Share this code with team members to invite them
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">Project Tasks</h4>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Add Task
                      </Button>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tasks created yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.slice(0, 10).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-blue-500' :
                                task.status === 'review' ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`} />
                              <div>
                                <h5 className="font-medium text-white">{task.title}</h5>
                                <p className="text-sm text-gray-400">
                                  {task.priority} priority • {task.status.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            {task.due_date && (
                              <div className="text-sm text-gray-400">
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">Team Members</h4>
                      {project.project_type === 'team' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus className="w-4 h-4" />}
                        >
                          Invite Member
                        </Button>
                      )}
                    </div>

                    {project.project_type === 'individual' ? (
                      <div className="text-center py-12 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>This is an individual project</p>
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No team members yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {member.full_name?.charAt(0) || member.email.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-medium text-white">
                                  {member.full_name || 'Unnamed User'}
                                </h5>
                                <p className="text-sm text-gray-400">{member.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.role === 'lead' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-white">Project Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <h5 className="font-medium text-white mb-2">Project Type</h5>
                        <p className="text-gray-400 text-sm capitalize">{project.project_type} Project</p>
                      </div>

                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <h5 className="font-medium text-white mb-2">Created</h5>
                        <p className="text-gray-400 text-sm">{formatDate(project.created_at)}</p>
                      </div>

                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <h5 className="font-medium text-white mb-2">Last Updated</h5>
                        <p className="text-gray-400 text-sm">{formatDate(project.updated_at)}</p>
                      </div>

                      {project.project_type === 'team' && teamCode && (
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h5 className="font-medium text-white mb-2">Team Invitation</h5>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-gray-700 rounded text-blue-400 font-mono">
                              {teamCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyTeamCode}
                              icon={codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            >
                              {codeCopied ? 'Copied!' : 'Copy'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={loading}
                    icon={<Check className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}