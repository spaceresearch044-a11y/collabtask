import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  BarChart3, 
  Settings,
  Trophy,
  Bell
} from 'lucide-react'
import { RootState } from '../../store/store'
import { toggleSidebar, setCurrentPage } from '../../store/slices/uiSlice'
import { Navigation } from './Navigation'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentPage } = useSelector((state: RootState) => state.ui)
  const { profile } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const navigationItems = [
    { key: 'dashboard', icon: Home, label: 'Dashboard' },
    { key: 'projects', icon: FolderOpen, label: 'Projects' },
    { key: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { key: 'calendar', icon: Calendar, label: 'Calendar' },
    { key: 'team', icon: Users, label: 'Team' },
    { key: 'meetings', icon: Video, label: 'Meeting Room' },
    { key: 'files', icon: FileText, label: 'Files' },
    { key: 'reports', icon: BarChart3, label: 'Reports' },
    { key: 'achievements', icon: Trophy, label: 'Achievements' },
    { key: 'notifications', icon: Bell, label: 'Notifications' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800/50 z-50 lg:relative lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">CollabTask</span>
              </motion.div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch(setCurrentPage(item.key))}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
                  currentPage === item.key
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              >
                <div className={`relative ${currentPage === item.key ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {currentPage === item.key && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -inset-1 bg-blue-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}

                {!sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    {item.label}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </nav>

          {/* User Info */}
          {profile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 border-t border-gray-800/50"
            >
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
                  {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {profile.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Level {profile.level} • {profile.points} pts
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  )
}