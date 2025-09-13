import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react'

export const WelcomeHero: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.auth)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-r from-gray-900/80 via-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-yellow-400"
            >
              <Sparkles className="w-full h-full" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || 'User'}!
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            Ready to conquer your goals today? ✨
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Target className="w-4 h-4" />
              <span>8 tasks completed this week</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>94% productivity score</span>
            </div>
          </motion.div>
        </div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-8"
        >
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl font-bold text-white mb-1"
            >
              {profile?.level || 1}
            </motion.div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
          
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1"
            >
              {profile?.points || 0}
            </motion.div>
            <div className="text-sm text-gray-400">Points</div>
          </div>

          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/25"
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}