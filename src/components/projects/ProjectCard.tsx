import React from 'react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Flag,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useProjects } from '../../hooks/useProjects'

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

interface ProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
  onUpdate?: () => void
  onOpen?: (project: Project) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  viewMode, 
  onUpdate,
  onOpen
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { deleteProject, loading } = useProjects()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }


  const handleDelete = async () => {
    try {
      await deleteProject(project.id)
      onUpdate?.()
      setShowDeleteConfirm(false)
      setShowMenu(false)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }
  
  const handleOpen = () => {
    onOpen?.(project)
    setShowMenu(false)
  }
  
  const isOverdue = project.deadline && new Date(project.deadline) < new Date()

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:bg-gray-800/30 transition-colors" hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{project.name}</h3>
              <p className="text-sm text-gray-400 truncate">
                {project.description || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span className="capitalize">{project.project_type}</span>
            </div>
            
            {project.deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.deadline)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                Open
              </Button>
              <div className="relative">
                onClick={handleOpen}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={<MoreVertical className="w-4 h-4" />}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 space-y-4 h-full" hover glow>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.project_type === 'team' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {project.project_type}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<MoreVertical className="w-4 h-4" />}
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]"
              >
                View
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white line-clamp-1">
            {project.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {project.description || 'No description provided'}
          </p>
        </div>

                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
                      className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 min-w-[120px]"
            project.status === 'completed' ? 'bg-blue-500' :
            'bg-yellow-500'
                        onClick={handleOpen}
          <span className="text-sm text-gray-400 capitalize">{project.status}</span>
        </div>
                        <Eye className="w-3 h-3" />
                        View Details
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {project.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.deadline)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
                  </>
              <Clock className="w-4 h-4" />
              <span>{formatDate(project.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<Edit className="w-4 h-4" />}
              onClick={handleEdit}
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Open
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Edit Modal */}
        <div className="space-y-2" onClick={handleOpen}>
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          mode="edit"
        />
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Delete Project</h3>
                  <p className="text-gray-400">
                    Are you sure you want to delete "{project.name}"? This action cannot be undone.
                  </p>
                </div>
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
              </div>
                >
                  Cancel
                    <Eye className="w-3 h-3" />
                  icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              onClick={handleOpen}
                  variant="danger"
              View
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setShowMenu(false)
                    }}
                  className="flex-1"
    </motion.div>
  )
}