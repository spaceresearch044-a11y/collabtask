import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Check, 
  X, 
  Settings,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Users,
  FileText
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useActivityLogs } from '../../hooks/useActivityLogs'

const getNotificationIcon = (activity_type: string) => {
  switch (activity_type) {
    case 'completed_task': return CheckCircle
    case 'created_task': return Info
    case 'created_project': return Info
    case 'uploaded_file': return FileText
    case 'scheduled_meeting': return Calendar
    default: return Info
  }
}

const getNotificationType = (activity_type: string) => {
  switch (activity_type) {
    case 'completed_task': return 'success'
    case 'created_task': return 'info'
    case 'created_project': return 'success'
    case 'uploaded_file': return 'info'
    case 'scheduled_meeting': return 'info'
    default: return 'info'
  }
}

const getNotificationColor = (activity_type: string) => {
  const type = getNotificationType(activity_type)
  switch (type) {
    case 'success': return 'from-green-500 to-emerald-600'
    case 'warning': return 'from-yellow-500 to-orange-600'
    case 'error': return 'from-red-500 to-pink-600'
    default: return 'from-blue-500 to-cyan-600'
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

export const NotificationsPage: React.FC = () => {
  const { activities, loading, fetchActivities } = useActivityLogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showSettings, setShowSettings] = useState(false)

  // Convert activities to notification format
  const notifications = activities.map(activity => ({
    id: activity.id,
    type: getNotificationType(activity.activity_type),
    title: activity.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    message: activity.description,
    is_read: false, // All activities are treated as unread for now
    created_at: activity.created_at,
    activity_type: activity.activity_type
  }))

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.is_read) ||
                         (filterType === 'read' && notification.is_read) ||
                         notification.activity_type === filterType
    return matchesSearch && matchesFilter
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = (id: string) => {
    // TODO: Implement mark as read in database
    console.log('Mark as read:', id)
  }

  const markAllAsRead = () => {
    // TODO: Implement mark all as read
    console.log('Mark all as read')
  }

  const deleteNotification = (id: string) => {
    // TODO: Implement delete notification
    console.log('Delete notification:', id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 text-red-400 relative"
            >
              <Bell className="w-full h-full" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.div>
            Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            Stay updated with your team activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={markAllAsRead}
              icon={<Check className="w-4 h-4" />}
            >
              Mark All Read
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowSettings(true)}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.activity_type)
              const colorClasses = getNotificationColor(notification.activity_type)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                    notification.is_read 
                      ? 'bg-gray-800/20 hover:bg-gray-800/30' 
                      : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-400'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        icon={<Check className="w-3 h-3" />}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      icon={<X className="w-3 h-3" />}
                    />
                  </div>
                </motion.div>
              )
            })}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No notifications found</p>
                <p className="text-sm">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Notification Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Task Updates</h4>
                    <p className="text-sm text-gray-400">Notify when tasks are updated</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Meeting Reminders</h4>
                    <p className="text-sm text-gray-400">Remind me about upcoming meetings</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Project Updates</h4>
                    <p className="text-sm text-gray-400">Notify about project changes</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Save Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}