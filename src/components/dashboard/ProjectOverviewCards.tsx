import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Users, Calendar, Target, Edit, Trash2, ExternalLink } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useProjects } from '../../hooks/useProjects'
import { ProjectModal } from '../modals/ProjectModal'

// Mock members for display - in real app, fetch from project_members
const mockMembers = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC' },
  { id: '2', name: 'Alex Rodriguez', avatar: 'AR' },
  { id: '3', name: 'Emma Wilson', avatar: 'EW' }
]

export const ProjectOverviewCards: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [flippedProject, setFlippedProject] = useState<string | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'quickAdd'>('create')
  
  const { projects, loading, fetchProjects, deleteProject } = useProjects()

  const handleCreateProject = () => {
    setModalMode('create')
    setSelectedProject(null)
    setShowProjectModal(true)
  }

  const handleQuickAdd = () => {
    setModalMode('quickAdd')
    setSelectedProject(null)
    setShowProjectModal(true)
  }

  const handleEditProject = (project: any) => {
    setModalMode('edit')
    setSelectedProject(project)
    setShowProjectModal(true)
  }

  const handleProjectSuccess = () => {
    fetchProjects()
    setShowProjectModal(false)
  }

  const handleDeleteProject = async (project: any) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id)
        fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const getColorClasses = (color: string) => {
    // Convert hex color to Tailwind gradient classes
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'from-blue-500 to-cyan-600',
      '#8b5cf6': 'from-purple-500 to-violet-600',
      '#10b981': 'from-green-500 to-emerald-600',
      '#f59e0b': 'from-amber-500 to-yellow-600',
      '#ef4444': 'from-red-500 to-pink-600',
      '#06b6d4': 'from-cyan-500 to-blue-600',
      '#f97316': 'from-orange-500 to-red-600',
      '#84cc16': 'from-lime-500 to-green-600'
    }
    return colorMap[color] || 'from-blue-500 to-cyan-600'
  }

  const calculateProgress = (project: any) => {
    // Mock progress calculation - in real app, calculate from tasks
    return Math.floor(Math.random() * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            Active Projects
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleQuickAdd}
              icon={<Plus className="w-4 h-4" />}
            >
              Quick Add
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateProject}
              icon={<Plus className="w-4 h-4" />}
              className="shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const progress = calculateProgress(project)
            const colorClasses = getColorClasses(project.color)
            
            return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group perspective-1000"
            onHoverStart={() => setHoveredProject(project.id)}
            onHoverEnd={() => setHoveredProject(null)}
          >
            <motion.div
              className="relative preserve-3d cursor-pointer"
              whileHover={{ 
                rotateY: flippedProject === project.id ? 180 : 5,
                rotateX: 2,
                z: 50
              }}
              onClick={() => setFlippedProject(flippedProject === project.id ? null : project.id)}
              transition={{ duration: 0.6 }}
            >
              {/* Front of card */}
              <Card className={`p-6 backface-hidden ${flippedProject === project.id ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${colorClasses} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {mockMembers.slice(0, 3).map((member, memberIndex) => (
                        <motion.div
                          key={member.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + memberIndex * 0.1 }}
                          whileHover={{ scale: 1.2, zIndex: 10 }}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-white cursor-pointer"
                          title={member.name}
                        >
                          {member.avatar}
                        </motion.div>
                      ))}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 border-dashed flex items-center justify-center text-gray-400 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.div>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (project.status || 'active') === 'active' ? 'bg-green-500/20 text-green-400' :
                      (project.status || 'active') === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {(project.status || 'active').replace('-', ' ').toUpperCase()}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Open Project →
                    </motion.button>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <AnimatePresence>
                  {hoveredProject === project.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </Card>

              {/* Back of card */}
              <Card className={`absolute inset-0 p-6 backface-hidden rotate-y-180 ${flippedProject === project.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                <div className="h-full flex flex-col justify-center space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Project
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditProject(project)
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Details
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open team management modal
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-all"
                    >
                      <Users className="w-4 h-4" />
                      Manage Team
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project)
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
            )
          })}

          {/* Add New Project Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: projects.length * 0.1 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.02,
                rotateY: 2,
                rotateX: 1
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateProject}
              className="group cursor-pointer"
            >
              <Card className="p-6 h-full border-2 border-dashed border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all"
                  >
                    <Plus className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-400 group-hover:text-white transition-colors">
                      Create New Project
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                      Start your next big idea
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectSuccess}
          project={selectedProject}
          mode={modalMode}
        />
      )}
    </>
  )
}