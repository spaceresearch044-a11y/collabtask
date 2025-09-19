import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { MainLayout } from '../components/layout/MainLayout'
import { Dashboard } from '../components/dashboard/Dashboard'
import { GettingStarted } from '../components/onboarding/GettingStarted'
import { ProjectsPage } from '../components/pages/ProjectsPage'
import { CalendarPage } from '../components/pages/CalendarPage'
import { TeamPage } from '../components/pages/TeamPage'
import { TasksPage } from '../components/pages/TasksPage'
import { MeetingsPage } from '../components/pages/MeetingsPage'
import { FilesPage } from '../components/pages/FilesPage'
import { ReportsPage } from '../components/pages/ReportsPage'
import { NotificationsPage } from '../components/pages/NotificationsPage'
import { AchievementsPage } from '../components/pages/AchievementsPage'
import { SettingsPage } from '../components/pages/SettingsPage'
import { useProjects } from '../hooks/useProjects'

export const DashboardPage: React.FC = () => {
  const { currentPage } = useSelector((state: RootState) => state.ui)
  const { projects, loading: projectsLoading, error: projectsError } = useProjects()
  
  const renderPageContent = () => {
    // Show onboarding for new users with no projects (but only after loading is complete)
    if (!projectsLoading && projects.length === 0 && currentPage === 'dashboard' && !projectsError) {
      return (
        <GettingStarted
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
        return <TasksPage />
      case 'calendar':
        return <CalendarPage />
      case 'team':
        return <TeamPage />
      case 'meetings':
        return <MeetingsPage />
      case 'files':
        return <FilesPage />
      case 'reports':
        return <ReportsPage />
      case 'notifications':
        return <NotificationsPage />
      case 'achievements':
        return <AchievementsPage />
      case 'settings':
        return <SettingsPage />
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