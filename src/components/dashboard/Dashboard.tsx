import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { AlertCircle, RefreshCw, CheckSquare } from 'lucide-react'
import { RootState } from '../../store/store'
import { useProjects } from '../../hooks/useProjects'
import { ProjectOverviewCards } from './ProjectOverviewCards'
import { TaskBoard3D } from './TaskBoard3D'
import { ActivityFeed } from './ActivityFeed'
import { TeamPresence } from './TeamPresence'
import { QuickStats } from './QuickStats'
import { WelcomeHero } from './WelcomeHero'
import { EmptyState } from './EmptyState'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export const Dashboard: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.auth)
  const { currentView } = useSelector((state: RootState) => state.ui)
  const { projects, loading, error, fetchProjects } = useProjects()

  // Show error only for actual fetch failures, not for new users
  const shouldShowError = error && !loading && profile?.has_ever_created_project

  // Show empty state for new users with no projects and no errors
  if (!loading && projects.length === 0 && !error) {
    return <EmptyState type="projects" />
  }

  // Show error popup for existing users with fetch failures
  if (shouldShowError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center space-y-6 max-w-md" glow>
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Failed to Load Projects</h2>
            <p className="text-gray-400">
              We couldn't load your projects. Please check your connection and try again.
            </p>
            <p className="text-sm text-gray-500">
              Error: {error}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => fetchProjects()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-pink-900/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Welcome Hero Section */}
      <WelcomeHero />

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 relative z-10">
        {/* Left Column - Projects & Tasks */}
        <div className="xl:col-span-3 space-y-8">
          {/* Project Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProjectOverviewCards />
          </motion.div>

          {/* Task Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TaskBoard3D />
          </motion.div>
        </div>

        {/* Right Column - Activity & Team */}
        <div className="space-y-8">
          {/* Team Presence */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <TeamPresence />
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <ActivityFeed />
          </motion.div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl shadow-blue-500/25 flex items-center justify-center text-white hover:shadow-blue-500/40 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}