import React from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { Card } from '../ui/Card';
import { TrendingUp, Users, CheckCircle, Clock, FolderOpen, Target, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProjectCreationModal } from '../projects/ProjectCreationModal';
import { useState } from 'react';

interface ProjectOverviewCardsProps {
  className?: string;
  onProjectClick?: (projectId: string) => void;
}

export const ProjectOverviewCards: React.FC<ProjectOverviewCardsProps> = ({ 
  className,
  onProjectClick 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { projects, loading, fetchProjects } = useProjects()
  const { members } = useTeam()
  
  // Get tasks from all projects for stats
  const allTasks = projects.flatMap(project => {
    // This would need to be fetched properly in a real app
    return [] // Placeholder for now
  })
  
  const completedTasks = allTasks.filter(task => task?.status === 'completed').length
  const pendingTasks = allTasks.filter(task => task?.status !== 'completed').length
  
  const handleProjectCreated = () => {
    fetchProjects()
    setShowCreateModal(false)
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-16 bg-gray-800 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-xs text-green-400 mt-1">
                  +{projects.filter(p => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(p.created_at) > weekAgo
                  }).length} this week
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Team Members</p>
                <p className="text-2xl font-bold text-white">{members.length}</p>
                <p className="text-xs text-green-400 mt-1">
                  {members.filter(m => m.is_online).length} online
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">{completedTasks}</p>
                <p className="text-xs text-green-400 mt-1">Great progress!</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Tasks</p>
                <p className="text-2xl font-bold text-white">{pendingTasks}</p>
                <p className="text-xs text-yellow-400 mt-1">Keep going!</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
          <p className="text-gray-400 mb-6">Create your first project to start organizing your work</p>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Your First Project
          </Button>
        </motion.div>
      )}

      {showCreateModal && (
        <ProjectCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </>
  );
};