import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  Users, 
  FileText,
  BarChart3,
  Plus,
  Sparkles
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ProjectModal } from '../modals/ProjectModal'

interface EmptyStateProps {
  type: 'projects' | 'tasks' | 'calendar' | 'team' | 'files' | 'reports'
  onAction?: () => void
}

const emptyStateConfig = {
  projects: {
    icon: FolderOpen,
    title: 'No Projects Yet',
    description: 'Create your first project to start organizing your work and collaborating with your team.',
    actionText: 'Create Project',
    color: 'from-blue-500 to-cyan-600'
  },
  tasks: {
    icon: CheckSquare,
    title: 'No Tasks Yet',
    description: 'Add your first task to get started with project management and track your progress.',
    actionText: 'Add Task',
    color: 'from-purple-500 to-violet-600'
  },
  calendar: {
    icon: Calendar,
    title: 'No Events Scheduled',
    description: 'Your calendar is empty. Schedule meetings, set deadlines, and organize your time.',
    actionText: 'Add Event',
    color: 'from-green-500 to-emerald-600'
  },
  team: {
    icon: Users,
    title: 'No Team Members',
    description: 'Invite team members to collaborate on projects and share the workload.',
    actionText: 'Invite Members',
    color: 'from-orange-500 to-amber-600'
  },
  files: {
    icon: FileText,
    title: 'No Files Uploaded',
    description: 'Upload files to share with your team and attach them to tasks and projects.',
    actionText: 'Upload Files',
    color: 'from-pink-500 to-rose-600'
  },
  reports: {
    icon: BarChart3,
    title: 'No Reports Generated',
    description: 'Generate reports to track progress, analyze performance, and share insights.',
    actionText: 'Generate Report',
    color: 'from-indigo-500 to-purple-600'
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const [showProjectModal, setShowProjectModal] = useState(false)
  const config = emptyStateConfig[type]
  const Icon = config.icon

  const handleAction = () => {
    if (type === 'projects') {
      setShowProjectModal(true)
    } else if (onAction) {
      onAction()
    }
  }
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[400px] p-8"
      >
        <Card className="p-12 text-center max-w-md mx-auto" glow>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Icon */}
            <div className={`w-20 h-20 bg-gradient-to-r ${config.color} rounded-2xl flex items-center justify-center mx-auto`}>
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">{config.title}</h3>
              <p className="text-gray-400 leading-relaxed">{config.description}</p>
            </div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="primary"
                onClick={handleAction}
                icon={<Plus className="w-4 h-4" />}
                className="mt-4"
              >
                {config.actionText}
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <div className="relative">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${-10 + i * 5}px`,
                  }}
                  animate={{
                    y: [-5, 5, -5],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </Card>
      </motion.div>
      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {
            setShowProjectModal(false)
            window.location.reload() // Refresh to show new project
          }}
          mode="create"
        />
      )}
    </>
  )
}