import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  User, 
  MoreVertical, 
  Edit, 
  Trash2,
  Flag,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useTasks } from '../../hooks/useTasks'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id: string
  assigned_to: string | null
  created_by: string
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  assigned_to_profile?: {
    id: string
    full_name: string | null
    email: string
  } | null
  created_by_profile?: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface TaskCardProps {
  task: Task
  projectMembers?: Array<{
    id: string
    full_name: string | null
    email: string
  }>
  onUpdate: () => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, projectMembers = [], onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false)
  const { updateTask, deleteTask, loading } = useTasks()
  const { user } = useSelector((state: RootState) => state.auth)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
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
      case 'completed': return 'text-green-400'
      case 'in_progress': return 'text-blue-400'
      case 'review': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'review' | 'completed') => {
    try {
      await updateTask(task.id, { status: newStatus })
      onUpdate()
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id)
        onUpdate()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const canEdit = user && (task.created_by === user.id || task.assigned_to === user.id)
  const canDelete = user && task.created_by === user.id

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 space-y-3 hover:bg-gray-800/30 transition-colors" hover>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white line-clamp-2 mb-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              icon={<MoreVertical className="w-4 h-4" />}
            />
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]"
              >
                {canEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      // TODO: Open edit modal
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleDelete()
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Priority and Status */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          {task.status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.due_date)}</span>
            {isOverdue && <span className="text-red-400">(Overdue)</span>}
          </div>
        )}

        {/* Assignee */}
        {task.assigned_to_profile && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
              {task.assigned_to_profile.full_name?.charAt(0) || task.assigned_to_profile.email.charAt(0)}
            </div>
            <span className="text-xs text-gray-400">
              {task.assigned_to_profile.full_name || task.assigned_to_profile.email}
            </span>
          </div>
        )}

        {/* Status Actions */}
        {canEdit && task.status !== 'completed' && (
          <div className="flex gap-1 pt-2 border-t border-gray-700">
            {task.status !== 'in_progress' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('in_progress')}
                className="text-xs"
              >
                Start
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('review')}
                className="text-xs"
              >
                Review
              </Button>
            )}
            {(task.status === 'review' || task.status === 'in_progress') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('completed')}
                className="text-xs text-green-400"
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}