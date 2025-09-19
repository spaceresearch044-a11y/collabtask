import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  Home,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  Video,
  FileText,
  BarChart3,
  Trophy,
  Bell,
  Sparkles,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { RootState } from '../../store/store'
import { toggleSidebar, setCurrentPage } from '../../store/slices/uiSlice'

const menuItems = [
  { 
    icon: Home, 
    label: 'Dashboard', 
    key: 'dashboard',
    color: 'text-blue-400', 
    hoverColor: 'hover:bg-blue-500/10',
    gradient: 'from-blue-500 to-cyan-600',
    glowColor: 'shadow-blue-500/25'
  },
  { 
    icon: FolderOpen, 
    label: 'Projects', 
    key: 'projects',
    color: 'text-purple-400', 
    hoverColor: 'hover:bg-purple-500/10',
    gradient: 'from-purple-500 to-violet-600',
    glowColor: 'shadow-purple-500/25'
  },
  { 
    icon: Calendar, 
    label: 'Calendar', 
    key: 'calendar',
    color: 'text-green-400', 
    hoverColor: 'hover:bg-green-500/10',
    gradient: 'from-green-500 to-emerald-600',
    glowColor: 'shadow-green-500/25'
  },
  { 
    icon: Users, 
    label: 'Team', 
    key: 'team',
    color: 'text-orange-400', 
    hoverColor: 'hover:bg-orange-500/10',
    gradient: 'from-orange-500 to-amber-600',
    glowColor: 'shadow-orange-500/25'
  },
  { 
    icon: Video, 
    label: 'Meeting Room', 
    key: 'meetings',
    color: 'text-pink-400', 
    hoverColor: 'hover:bg-pink-500/10',
    gradient: 'from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/25'
  },
  { 
    icon: FileText, 
    label: 'Files', 
    key: 'files',
    color: 'text-cyan-400', 
    hoverColor: 'hover:bg-cyan-500/10',
    gradient: 'from-cyan-500 to-blue-600',
    glowColor: 'shadow-cyan-500/25'
  },
  { 
    icon: BarChart3, 
    label: 'Reports', 
    key: 'reports',
    color: 'text-yellow-400', 
    hoverColor: 'hover:bg-yellow-500/10',
    gradient: 'from-yellow-500 to-orange-600',
    glowColor: 'shadow-yellow-500/25'
  },
  { 
    icon: Bell, 
    label: 'Notifications', 
    key: 'notifications',
    color: 'text-red-400', 
    hoverColor: 'hover:bg-red-500/10',
    gradient: 'from-red-500 to-pink-600',
    glowColor: 'shadow-red-500/25'
  },
  { 
    icon: Trophy, 
    label: 'Achievements', 
    key: 'achievements',
    color: 'text-amber-400', 
    hoverColor: 'hover:bg-amber-500/10',
    gradient: 'from-amber-500 to-yellow-600',
    glowColor: 'shadow-amber-500/25'
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    key: 'settings',
    color: 'text-gray-400', 
    hoverColor: 'hover:bg-gray-500/10',
    gradient: 'from-gray-500 to-gray-600',
    glowColor: 'shadow-gray-500/25'
  },
]

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentPage } = useSelector((state: RootState) => state.ui)
  const { profile } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const handleNavigation = (pageKey: string) => {
    dispatch(setCurrentPage(pageKey))
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gray-900/95 backdrop-blur-sm border-r border-gray-800/50 flex flex-col h-screen relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -top-20 -right-10 w-40 h-40 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.2, 1, 1.2]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -bottom-20 -left-10 w-32 h-32 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"
        />
      </div>

      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800/50 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CollabTask
              </h1>
              <p className="text-xs text-gray-500">Future of Collaboration</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ 
              x: sidebarOpen ? 8 : 4,
              scale: 1.02,
              rotateY: 5,
              rotateX: 2
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation(item.key)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              currentPage === item.key 
                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.glowColor}` 
                : `text-gray-300 hover:text-white ${item.hoverColor}`
            } ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            {/* 3D Glow Effect */}
            {currentPage === item.key && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <motion.div
              whileHover={{ 
                rotate: currentPage === item.key ? 360 : [0, -10, 10, 0],
                scale: 1.2,
                rotateY: 15
              }}
              transition={{ 
                duration: currentPage === item.key ? 2 : 0.5,
                repeat: currentPage === item.key ? Infinity : 0,
                ease: currentPage === item.key ? 'linear' : 'easeInOut'
              }}
              className={`relative z-10 ${
                currentPage === item.key ? 'text-white' : item.color
              } group-hover:scale-110 transition-all duration-300`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              
              {/* Floating particles for active item */}
              {currentPage === item.key && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/60 rounded-full"
                      style={{
                        left: `${Math.random() * 20 - 10}px`,
                        top: `${Math.random() * 20 - 10}px`,
                      }}
                      animate={{
                        y: [-5, 5, -5],
                        opacity: [0.6, 1, 0.6],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
            
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`font-medium relative z-10 ${
                  currentPage === item.key ? 'text-white' : ''
                }`}
              >
                {item.label}
              </motion.span>
            )}
            
            {/* 3D Hover indicator */}
            {currentPage !== item.key && (
              <motion.div
                className="absolute right-2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.2, x: 2 }}
              />
            )}
            
            {/* Tooltip for collapsed sidebar */}
            {!sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                whileHover={{ opacity: 1, scale: 1, x: 0 }}
                className="absolute left-full ml-4 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-lg"
              >
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 border-l border-b border-gray-700 rotate-45"></div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* User Profile Section */}
      {profile && (
        <div className="p-4 border-t border-gray-800/50 relative z-10">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-200 cursor-pointer ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-lg">
                {profile.full_name?.charAt(0) || profile.email.charAt(0)}
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
              />
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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">
                    Level {profile.level}
                  </p>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">{profile.points}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-4 top-24 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-gray-800 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 z-20"
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 10}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>
    </motion.aside>
  )
}