import React from 'react'
import { MainLayout } from '../components/layout/MainLayout'
import { Dashboard } from '../components/dashboard/Dashboard'

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  )
}