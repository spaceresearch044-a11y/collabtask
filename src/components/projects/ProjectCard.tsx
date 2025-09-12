import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Flag,
  Clock
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

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
}

interface ProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

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
              <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
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
          </div>
          <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
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

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            project.status === 'active' ? 'bg-green-500' :
            project.status === 'completed' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-sm text-gray-400 capitalize">{project.status}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {project.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.deadline)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(project.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<Edit className="w-4 h-4" />}
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
    </motion.div>
  )
}