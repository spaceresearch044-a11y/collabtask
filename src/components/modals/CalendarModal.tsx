import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Clock,
  Loader2,
  AlertCircle,
  CalendarDays,
  MapPin
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useCalendar } from '../../hooks/useCalendar'
import { useProjects } from '../../hooks/useProjects'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  event?: any // For editing existing event
  mode?: 'create' | 'edit'
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_time: event?.start_time ? event.start_time.split('T')[0] : '',
    start_time_hour: event?.start_time ? new Date(event.start_time).getHours().toString().padStart(2, '0') : '09',
    start_time_minute: event?.start_time ? new Date(event.start_time).getMinutes().toString().padStart(2, '0') : '00',
    end_time: event?.end_time ? event.end_time.split('T')[0] : '',
    end_time_hour: event?.end_time ? new Date(event.end_time).getHours().toString().padStart(2, '0') : '10',
    end_time_minute: event?.end_time ? new Date(event.end_time).getMinutes().toString().padStart(2, '0') : '00',
    all_day: event?.all_day || false,
    project_id: event?.project_id || '',
    event_type: event?.event_type || 'custom'
  })
  
  const { createEvent, updateEvent, loading, error } = useCalendar()
  const { projects } = useProjects()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const startDateTime = formData.all_day 
        ? `${formData.start_time}T00:00:00`
        : `${formData.start_time}T${formData.start_time_hour}:${formData.start_time_minute}:00`
      
      const endDateTime = formData.all_day
        ? `${formData.end_time || formData.start_time}T23:59:59`
        : `${formData.end_time || formData.start_time}T${formData.end_time_hour}:${formData.end_time_minute}:00`

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        all_day: formData.all_day,
        project_id: formData.project_id || undefined,
        event_type: formData.event_type
      }

      if (mode === 'edit' && event) {
        await updateEvent(event.id, eventData)
      } else {
        await createEvent(eventData)
      }
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error with calendar event:', error)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const eventTypes = [
    { value: 'custom', label: 'Custom Event', color: 'text-blue-400' },
    { value: 'meeting', label: 'Meeting', color: 'text-purple-400' },
    { value: 'deadline', label: 'Deadline', color: 'text-red-400' },
    { value: 'milestone', label: 'Milestone', color: 'text-green-400' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
                  >
                    <CalendarDays className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'edit' ? 'Edit Event' : 'Add Calendar Event'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Event Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                  icon={<CalendarDays className="w-4 h-4" />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Event Type
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Project (Optional)
                    </label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="all_day"
                      checked={formData.all_day}
                      onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="all_day" className="text-sm font-medium text-gray-200">
                      All Day Event
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Start Date"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    
                    {!formData.all_day && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-200">
                          Start Time
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.start_time_hour}
                            onChange={(e) => setFormData({ ...formData, start_time_hour: e.target.value })}
                            className="flex-1 px-2 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <select
                            value={formData.start_time_minute}
                            onChange={(e) => setFormData({ ...formData, start_time_minute: e.target.value })}
                            className="flex-1 px-2 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {['00', '15', '30', '45'].map((minute) => (
                              <option key={minute} value={minute}>
                                {minute}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {!formData.all_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        label="End Date"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-200">
                          End Time
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.end_time_hour}
                            onChange={(e) => setFormData({ ...formData, end_time_hour: e.target.value })}
                            className="flex-1 px-2 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <select
                            value={formData.end_time_minute}
                            onChange={(e) => setFormData({ ...formData, end_time_minute: e.target.value })}
                            className="flex-1 px-2 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {['00', '15', '30', '45'].map((minute) => (
                              <option key={minute} value={minute}>
                                {minute}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!formData.title.trim() || loading}
                    className="flex-1"
                    icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                  >
                    {loading ? 'Saving...' : mode === 'edit' ? 'Update Event' : 'Add Event'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}