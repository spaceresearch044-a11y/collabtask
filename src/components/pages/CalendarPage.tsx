import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CalendarModal } from '../modals/CalendarModal'
import { useCalendar } from '../../hooks/useCalendar'

export const CalendarPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const { events, loading, fetchEvents } = useCalendar()

  const handleEventCreated = () => {
    fetchEvents()
    setShowCreateModal(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-green-400"
            >
              <CalendarIcon className="w-full h-full" />
            </motion.div>
            Calendar
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your schedule and deadlines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm transition-colors capitalize ${
                  viewMode === mode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Event
          </Button>
        </div>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigateMonth('prev')}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <h2 className="text-xl font-semibold text-white">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigateMonth('next')}
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-400 border-b border-gray-800"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth(selectedDate).map((date, index) => {
              const dayEvents = date ? getEventsForDate(date) : []
              const isToday = date && date.toDateString() === new Date().toDateString()
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`min-h-[100px] p-2 border border-gray-800 transition-colors ${
                    date 
                      ? 'hover:bg-gray-800/30 cursor-pointer' 
                      : 'bg-gray-900/50'
                  } ${
                    isToday ? 'bg-blue-500/10 border-blue-500/30' : ''
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.05 }}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded truncate"
                          >
                            {event.title}
                          </motion.div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.start_time).toLocaleString()}
                    </div>
                    {event.description && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events scheduled</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CalendarModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEventCreated}
        />
      )}
    </div>
  )
}