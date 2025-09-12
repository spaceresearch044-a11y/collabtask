import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { MainLayout } from '../components/layout/MainLayout'
import { Dashboard } from '../components/dashboard/Dashboard'
import { GettingStarted } from '../components/onboarding/GettingStarted'
import { ProjectsPage } from '../components/pages/ProjectsPage'
import { EmptyState } from '../components/dashboard/EmptyState'
import { useProjects } from '../hooks/useProjects'

export const DashboardPage: React.FC = () => {
  const { currentPage } = useSelector((state: RootState) => state.ui)
  const { projects } = useProjects()
  
  const renderPageContent = () => {
    // Show onboarding for new users with no projects
    if (projects.length === 0 && currentPage === 'dashboard') {
      return (
        <GettingStarted
          onCreateProject={() => {}}
          onJoinTeam={() => {}}
        />
      )
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsPage />
      case 'tasks':
        return <EmptyState type="tasks" />
      case 'calendar':
        return <EmptyState type="calendar" />
      case 'team':
        return <EmptyState type="team" />
      case 'files':
        return <EmptyState type="files" />
      case 'reports':
        return <EmptyState type="reports" />
      case 'meeting':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Meeting Room</h2>
            <p className="text-gray-400">Video conferencing feature coming soon!</p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400">Settings panel coming soon!</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }
  return (
    <MainLayout>
      {renderPageContent()}
    </MainLayout>
  )
}