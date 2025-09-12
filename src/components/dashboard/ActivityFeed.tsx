import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import {
  CheckCircle,
  MessageCircle,
  FileText,
  Users,
  Clock,
} from 'lucide-react'

interface Activity {
  id: string
  type: 'task_completed' | 'comment' | 'file_uploaded' | 'user_joined' | 'deadline_approaching'
  message: string
  user: string
  timestamp: string
  avatar: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    message: 'completed "Design new homepage layout"',
    user: 'Sarah Chen',
    timestamp: '2 minutes ago',
    avatar: 'SC'
  },
  {
    id: '2',
    type: 'comment',
    message: 'commented on "API Integration"',
    user: 'Alex Rodriguez',
    timestamp: '15 minutes ago',
    avatar: 'AR'
  },
  {
    id: '3',
    type: 'file_uploaded',
    message: 'uploaded wireframes.fig to "Mobile App Redesign"',
    user: 'Emma Wilson',
    timestamp: '1 hour ago',
    avatar: 'EW'
  },
  {
    id: '4',
    type: 'user_joined',
    message: 'joined the project "Q4 Marketing Campaign"',
    user: 'Mike Johnson',
    timestamp: '2 hours ago',
    avatar: 'MJ'
  },
  {
    id: '5',
    type: 'deadline_approaching',
    message: 'Deadline approaching for "User Testing Phase"',
    user: 'System',
    timestamp: '3 hours ago',
    avatar: '⚡'
  }
]

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'task_completed': return CheckCircle
    case 'comment': return MessageCircle
    case 'file_uploaded': return FileText
    case 'user_joined': return Users
    case 'deadline_approaching': return Clock
    default: return CheckCircle
  }
}

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'task_completed': return 'from-green-500 to-emerald-600'
    case 'comment': return 'from-blue-500 to-cyan-600'
    case 'file_uploaded': return 'from-purple-500 to-violet-600'
    case 'user_joined': return 'from-orange-500 to-amber-600'
    case 'deadline_approaching': return 'from-red-500 to-pink-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

export const ActivityFeed: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Team Activity</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const color = getActivityColor(activity.type)

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
                  <span className="font-medium text-white">{activity.user}</span>{' '}
                  {activity.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
              </div>

              {activity.user !== 'System' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                  {activity.avatar}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}