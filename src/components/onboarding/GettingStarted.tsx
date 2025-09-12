import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Plus, 
  Users, 
  Target, 
  Rocket,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ProjectCreationModal } from '../projects/ProjectCreationModal'

interface GettingStartedProps {
  onCreateProject: () => void
  onJoinTeam: () => void
}

export const GettingStarted: React.FC<GettingStartedProps> = ({
  onCreateProject,
  onJoinTeam
}) => {
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTour, setShowTour] = useState(false)

  const features = [
    {
      icon: Target,
      title: 'Create Projects',
      description: 'Start your first project and organize your tasks',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Users,
      title: 'Join Teams',
      description: 'Collaborate with others using team codes',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: Zap,
      title: '3D Task Board',
      description: 'Experience immersive task management',
      color: 'from-orange-500 to-amber-600'
    }
  ]

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full space-y-8"
        >
          {/* Welcome Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome to CollabTask
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Experience the future of team collaboration with immersive 3D interfaces, 
              real-time updates, and AI-powered productivity tools.
            </motion.p>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            <Card className="p-8 text-center space-y-4 hover:scale-105 transition-transform cursor-pointer" hover glow>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Create Project</h3>
              <p className="text-gray-400">Start your first project and begin organizing your tasks</p>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => setShowProjectModal(true)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:scale-105 transition-transform cursor-pointer" hover glow>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Join Team</h3>
              <p className="text-gray-400">Enter a team code to join an existing project</p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={onJoinTeam}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Join Now
              </Button>
            </Card>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className="p-6 text-center space-y-4" hover>
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mx-auto`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Guided Tour */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <Button
              variant="ghost"
              onClick={() => setShowTour(true)}
              icon={<Lightbulb className="w-4 h-4" />}
            >
              Take a Guided Tour
            </Button>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {showProjectModal && (
        <ProjectCreationModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSuccess={onCreateProject}
        />
      )}
    </>
  )
}