import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Flag, 
  User,
  Loader2,
  AlertCircle,
  Target,
  Clock,
  Users
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useTasks } from '../../hooks/useTasks'
import { useProjects } from '../../hooks/useProjects'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  task?: any // For editing existing task
  mode?: 'create' | 'edit'
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  task,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'review' | 'completed',
    assigned_to: '',
    due_date: ''
  })
  
  const { createTask, updateTask, loading, error } = useTasks()
  const { projects } = useProjects()

  // Mock team members - in real app, fetch from project_members
  const teamMembers = [
    { id: '1', name: 'Sarah Chen', email: 'sarah@example.com' },
    { id: '2', name: 'Alex Rodriguez', email: 'alex@example.com' },
    { id: '3', name: 'Emma Wilson', email: 'emma@example.com' }
  ]

  // Initialize form data for editing
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      })
    }
  }, [task, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === 'edit' && task) {
        await updateTask(task.id, {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          assigned_to: formData.assigned_to || null,
          due_date: formData.due_date || null
        })
      } else {
        await createTask({
          title: formData.title,
          description: formData.description || undefined,
          project_id: projectId,
          priority: formData.priority,
          status: formData.status,
          assigned_to: formData.assigned_to || null,
          due_date: formData.due_date || null
        })
      }
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error with task:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assigned_to: '',
      due_date: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20'
      case 'review': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-purple-400 bg-purple-500/20'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
                  >
                    <Target className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Task Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                  icon={<Target className="w-4 h-4" />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the task..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)} text-center`}>
                      {formData.priority.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status)} text-center`}>
                      {formData.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Assign To (Optional)
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  type="date"
                  label="Due Date (Optional)"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  icon={<Calendar className="w-4 h-4" />}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!formData.title.trim() || loading}
                    className="flex-1"
                    icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  >
                    {loading ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}