import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Users, TrendingUp, Target, Zap } from 'lucide-react'
import { Card } from '../ui/Card'

const stats = [
  {
    title: 'Tasks Completed',
    value: '127',
    change: '+12% from last week',
    changeType: 'positive' as const,
    icon: CheckCircle2,
    color: 'from-green-500 to-emerald-600',
    glowColor: 'shadow-green-500/25'
  },
  {
    title: 'Active Projects',
    value: '8',
    change: '+2 new projects',
    changeType: 'positive' as const,
    icon: Target,
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'shadow-blue-500/25'
  },
  {
    title: 'Team Members',
    value: '24',
    change: '+3 this month',
    changeType: 'positive' as const,
    icon: Users,
    color: 'from-purple-500 to-violet-600',
    glowColor: 'shadow-purple-500/25'
  },
  {
    title: 'Productivity',
    value: '94%',
    change: '+5% improvement',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'from-orange-500 to-amber-600',
    glowColor: 'shadow-orange-500/25'
  }
]

export const QuickStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <motion.div
            whileHover={{ 
              y: -8,
              rotateY: 5,
              rotateX: 5
            }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
          >
            <Card className={`p-6 hover:shadow-2xl ${stat.glowColor} transition-all duration-300 transform-gpu perspective-1000`}>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                    {stat.title}
                  </p>
                  <motion.p 
                    className="text-3xl font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                
                <motion.div
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:shadow-xl transition-all duration-300`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                  backgroundSize: '200% 200%'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </Card>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}