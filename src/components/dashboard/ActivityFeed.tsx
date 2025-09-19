import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { useActivityLogs } from '../../hooks/useActivityLogs'
import {
  CheckCircle,
  MessageCircle,
  FileText,
  Users,
  Clock,
} from 'lucide-react'

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'completed_task': return CheckCircle
    case 'created_task': return CheckCircle
    case 'created_project': return FileText
    case 'uploaded_file': return FileText
    case 'scheduled_meeting': return Users
    case 'created_event': return Clock
    default: return CheckCircle
  }
}

const getActivityColor = (action: string) => {
  switch (action) {
    case 'completed_task': return 'from-green-500 to-emerald-600'
    case 'created_task': return 'from-blue-500 to-cyan-600'
    case 'created_project': return 'from-purple-500 to-violet-600'
    case 'uploaded_file': return 'from-orange-500 to-amber-600'
    case 'scheduled_meeting': return 'from-pink-500 to-rose-600'
    case 'created_event': return 'from-red-500 to-pink-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export const ActivityFeed: React.FC = () => {
  const { activities, loading } = useActivityLogs()

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Team Activity</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.slice(0, 10).map((activity, index) => {
          const Icon = getActivityIcon(activity.action)
          const color = getActivityColor(activity.action)

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 group hover:bg-gray-800/30 p-3 rounded-lg transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">
                  <span className="font-medium text-white">
                    {activity.user_profile?.full_name || activity.user_profile?.email || 'User'}
                  </span>{' '}
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
              </div>

                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                  {activity.user_profile?.full_name?.charAt(0) || activity.user_profile?.email?.charAt(0) || 'U'}
                </div>
            </motion.div>
          )
        })}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  )
}