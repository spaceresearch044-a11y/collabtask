import React from 'react'
import { motion } from 'framer-motion'
import { FileX, Plus, FolderOpen, Users, Calendar, CheckSquare } from 'lucide-react'
import { Button } from '../ui/Button'

interface EmptyStateProps {
  type: 'projects' | 'tasks' | 'files' | 'team' | 'calendar' | 'default'
  onAction?: () => void
}

const emptyStateConfig = {
  projects: {
    icon: FolderOpen,
    title: 'No projects yet',
    description: 'Create your first project to start organizing your work and collaborating with your team.',
    actionText: 'Create Project',
    gradient: 'from-blue-500 to-purple-600'
  },
  tasks: {
    icon: CheckSquare,
    title: 'No tasks found',
    description: 'Add your first task to start tracking your progress.',
    actionText: 'Add Task',
    gradient: 'from-green-500 to-blue-600'
  },
  files: {
    icon: FileX,
    title: 'No files uploaded',
    description: 'Upload files to share them with your team.',
    actionText: 'Upload File',
    gradient: 'from-orange-500 to-red-600'
  },
  team: {
    icon: Users,
    title: 'No team members',
    description: 'Invite team members to collaborate on projects.',
    actionText: 'Invite Members',
    gradient: 'from-purple-500 to-pink-600'
  },
  calendar: {
    icon: Calendar,
    title: 'No events scheduled',
    description: 'Schedule meetings and events to stay organized.',
    actionText: 'Add Event',
    gradient: 'from-indigo-500 to-blue-600'
  },
  default: {
    icon: FileX,
    title: 'Nothing here yet',
    description: 'Get started by adding some content.',
    actionText: 'Get Started',
    gradient: 'from-gray-500 to-gray-600'
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`w-20 h-20 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-white mb-2"
      >
        {config.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-8 max-w-md"
      >
        {config.description}
      </motion.p>

      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onAction}
            className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-opacity`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {config.actionText}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}