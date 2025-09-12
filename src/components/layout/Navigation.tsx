import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  Home,
  FolderOpen,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Video,
  CheckSquare,
} from 'lucide-react'
import { RootState } from '../../store/store'
import { setCurrentPage } from '../../store/slices/uiSlice'

const navigationItems = [
  { key: 'dashboard', icon: Home, label: 'Dashboard' },
  { key: 'projects', icon: FolderOpen, label: 'Projects' },
  { key: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { key: 'calendar', icon: Calendar, label: 'Calendar' },
  { key: 'team', icon: Users, label: 'Team' },
  { key: 'meeting', icon: Video, label: 'Meeting Room' },
  { key: 'files', icon: FileText, label: 'Files' },
  { key: 'reports', icon: BarChart3, label: 'Reports' },
  { key: 'settings', icon: Settings, label: 'Settings' },
]

export const Navigation: React.FC = () => {
  const dispatch = useDispatch()
  const { currentPage, sidebarOpen } = useSelector((state: RootState) => state.ui)

  const handleNavigation = (page: string) => {
    dispatch(setCurrentPage(page))
  }

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navigationItems.map((item, index) => (
        <motion.button
          key={item.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigation(item.key)}
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
  )
}