import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { RootState } from '../../store/store'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { Navigation } from './Navigation'

export const Sidebar: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { profile } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 flex flex-col h-screen relative"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              CollabTask
            </motion.h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* User Profile */}
      {profile && (
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
              {profile.full_name?.charAt(0) || profile.email.charAt(0)}
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {profile.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Level {profile.level} • {profile.points} pts
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  )
}