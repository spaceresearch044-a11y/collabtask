import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useProjects } from '../../hooks/useProjects'
import { StatsCard } from './StatsCard'
import { ActivityFeed } from './ActivityFeed'
import { TaskBoard3D } from './TaskBoard3D'
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.auth)
  const { currentView } = useSelector((state: RootState) => state.ui)
  const { projects, loading: projectsLoading, error: projectsError } = useProjects()

  const stats = [
    {
      title: 'Tasks Completed',
      value: '0',
      change: '+12% from last week',
      changeType: 'positive' as const,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Active Projects',
      value: projects.length.toString(),
      change: projects.length > 0 ? `${projects.length} active` : 'No projects yet',
      changeType: 'positive' as const,
      icon: Target,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Team Members',
      value: '1',
      change: 'Just you for now',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Productivity Score',
      value: '0%',
      change: 'Start working to track',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600'
    }
  ]

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Loading your projects...</p>
        </div>
      </div>
    )
  }

  // Show error only if there's an actual network/database error
  if (projectsError && projectsError.includes('Failed to load')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-400 text-xl">⚠</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load projects</h3>
            <p className="text-gray-400">{projectsError}</p>
            <button 
              onClick={() => {
                // Retry fetching projects
                window.location.reload()
              }} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name || 'User'}! ✨
            </h1>
            <p className="text-lg text-gray-300">
              {projects.length > 0 
                ? `You have ${projects.length} active project${projects.length !== 1 ? 's' : ''}. Keep up the great work!`
                : 'Ready to start your productivity journey? Create your first project!'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile?.level || 1}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="w-px h-12 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{profile?.points || 0}</div>
              <div className="text-sm text-gray-400">Points</div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-yellow-400"
            >
              <Zap className="w-full h-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Task Board or Regular Board */}
        <div className="lg:col-span-2">
          {currentView === '3d' ? (
            <TaskBoard3D />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {currentView === 'kanban' ? 'Kanban Board' : 'Task List'}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Design Homepage Layout</h4>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      In Progress
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Create responsive homepage design with modern UI components
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">API Integration</h4>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      To Do
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Integrate backend APIs for user authentication and data management
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">User Testing</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Conduct user testing sessions and gather feedback
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  )
}