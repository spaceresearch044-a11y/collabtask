import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}