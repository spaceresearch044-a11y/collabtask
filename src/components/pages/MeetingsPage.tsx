import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock,
  Users,
  Play,
  Pause,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Phone,
  Settings,
  Share2
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useMeetings } from '../../hooks/useMeetings'

export const MeetingsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    duration: 60,
    participants: [] as string[]
  })

  const { meetings, loading, createMeeting, joinMeeting, updateMeeting } = useMeetings()

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMeeting(formData)
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        start_time: '',
        duration: 60,
        participants: []
      })
    } catch (error) {
      console.error('Error creating meeting:', error)
    }
  }

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      const meetingUrl = await joinMeeting(meetingId)
      setActiveMeeting(meetingId)
      // In a real app, this would open the video call interface
      console.log('Joining meeting:', meetingUrl)
    } catch (error) {
      console.error('Error joining meeting:', error)
    }
  }

  const upcomingMeetings = meetings.filter(m => 
    new Date(m.start_time) > new Date() && m.status === 'scheduled'
  )

  const activeMeetings = meetings.filter(m => m.status === 'in_progress')

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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 text-pink-400"
            >
              <Video className="w-full h-full" />
            </motion.div>
            Meeting Room
          </h1>
          <p className="text-gray-400 mt-1">
            Schedule and join virtual meetings
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Schedule Meeting
        </Button>
      </motion.div>

      {/* Active Meetings */}
      {activeMeetings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Live Meetings
            </h3>
            <div className="space-y-4">
              {activeMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                    <p className="text-sm text-gray-400">
                      Started {new Date(meeting.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleJoinMeeting(meeting.id)}
                    icon={<Video className="w-4 h-4" />}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Join Now
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-6 hover:scale-105 transition-transform cursor-pointer" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Instant Meeting</h3>
          <p className="text-gray-400 text-sm mb-4">Start a meeting right now</p>
          <Button variant="primary" className="w-full">
            Start Now
          </Button>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform cursor-pointer" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Schedule Meeting</h3>
          <p className="text-gray-400 text-sm mb-4">Plan a meeting for later</p>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setShowCreateModal(true)}
          >
            Schedule
          </Button>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform cursor-pointer" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Join Meeting</h3>
          <p className="text-gray-400 text-sm mb-4">Enter meeting ID to join</p>
          <Button variant="ghost" className="w-full">
            Join
          </Button>
        </Card>
      </motion.div>

      {/* Upcoming Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(meeting.start_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(meeting.start_time).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {meeting.participants.length} participants
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleJoinMeeting(meeting.id)}
                  >
                    Join
                  </Button>
                </div>
              </motion.div>
            ))}
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming meetings</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 space-y-6" glow>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Schedule Meeting</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <Input
                  label="Meeting Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter meeting title"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting description..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="datetime-local"
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Duration (minutes)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    icon={<Calendar className="w-4 h-4" />}
                  >
                    Schedule
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}