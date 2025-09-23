import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  User,
  LogOut,
  Sparkles,
  Video,
  FileText,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { RootState } from '../../store/store'
import { toggleTheme, setCurrentView, toggleNotifications } from '../../store/slices/uiSlice'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const { theme, currentView, notifications } = useSelector((state: RootState) => state.ui)
  const { profile } = useSelector((state: RootState) => state.auth)
  const { signOut } = useAuth()
  const dispatch = useDispatch()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadCount = notifications.length

  const viewButtons = [
    { key: '3d', icon: Box, label: '3D View' },
    { key: 'kanban', icon: Grid3X3, label: 'Kanban' },
    { key: 'list', icon: List, label: 'List' },
  ]

  const quickActions = [
    { icon: Plus, label: 'New Task', color: 'from-blue-500 to-cyan-600' },
    { icon: Video, label: 'Meeting Room', color: 'from-purple-500 to-violet-600' },
    { icon: FileText, label: 'Files', color: 'from-green-500 to-emerald-600' },
    { icon: Calendar, label: 'Calendar', color: 'from-orange-500 to-amber-600' },
    { icon: BarChart3, label: 'Reports', color: 'from-pink-500 to-rose-600' },
  ]

  const mockNotifications = [
    { id: '1', title: 'Task Completed', message: 'Sarah completed "Design Homepage"', time: '2 min ago', type: 'success' },
    { id: '2', title: 'New Comment', message: 'Alex commented on "API Integration"', time: '5 min ago', type: 'info' },
    { id: '3', title: 'Deadline Approaching', message: 'Mobile App Redesign due tomorrow', time: '1 hour ago', type: 'warning' },
  ]

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-6 py-4 relative z-40">
      <div className="flex items-center justify-between">
        {/* Left side - Logo & Search */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          {/* 3D Spinning Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CollabTask
            </h1>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tasks, or team members..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-300 text-xs transition-colors"
              >
                ×
              </motion.button>
            )}
          </div>
        </div>

        {/* Center - View Toggle */}
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
          {viewButtons.map(({ key, icon: Icon, label }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(setCurrentView(key as any))}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentView === key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>

        {/* Right side - Quick Actions & User */}
        <div className="flex items-center gap-4">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                title={action.label}
              >
                <action.icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-700"></div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleTheme())}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-800/50 border-b border-gray-800/50 last:border-b-0 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-800">
                    <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* User Profile */}
          {profile && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-lg">
                  {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-white">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400">Level {profile.level}</p>
                </div>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-lg font-medium text-white">
                          {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{profile.full_name || 'User'}</p>
                          <p className="text-sm text-gray-400">{profile.email}</p>
                          <p className="text-xs text-blue-400">Level {profile.level} • {profile.points} pts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-800/50 rounded-lg transition-all"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Profile Settings</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-800/50 rounded-lg transition-all"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Preferences</span>
                      </motion.button>
                      <div className="border-t border-gray-800 my-2"></div>
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={signOut}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-500/10 rounded-lg transition-all text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false)
            setShowProfileMenu(false)
          }}
        />
      )}
    </header>
  )
}