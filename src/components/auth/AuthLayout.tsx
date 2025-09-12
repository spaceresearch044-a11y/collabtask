import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Users } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CollabTask
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight">
              The Future of Team Collaboration
            </h2>
            <p className="text-xl text-gray-300">
              Experience next-generation project management with immersive 3D interfaces, 
              real-time collaboration, and AI-powered productivity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-gray-300">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Real-time collaboration & updates</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Immersive 3D project dashboards</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span>AI-powered task management</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}