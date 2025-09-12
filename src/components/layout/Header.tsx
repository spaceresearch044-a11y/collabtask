import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  Search,
  Bell,
  Settings,
  Sun,
  Moon,
  Plus,
  Grid3X3,
  List,
  Box,
} from 'lucide-react'
import { RootState } from '../../store/store'
import { toggleTheme, setCurrentView, toggleNotifications } from '../../store/slices/uiSlice'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { theme, currentView, notifications } = useSelector((state: RootState) => state.ui)
  const { profile } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const unreadCount = notifications.length

  const viewButtons = [
    { key: '3d', icon: Box, label: '3D View' },
    { key: 'kanban', icon: Grid3X3, label: 'Kanban' },
    { key: 'list', icon: List, label: 'List' },
  ]

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tasks, or team members..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Center - View Toggle */}
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg">
          {viewButtons.map(({ key, icon: Icon, label }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(setCurrentView(key as any))}
              className={`p-2 rounded-md transition-all duration-200 ${
                currentView === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleTheme())}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleNotifications())}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* User Avatar */}
          {profile && (
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
              {profile.full_name?.charAt(0) || profile.email.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}