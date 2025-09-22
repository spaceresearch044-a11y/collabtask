import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Key,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useAuth } from '../../hooks/useAuth'

export const SettingsPage: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.auth)
  const { updateProfile, updatePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'integrations', label: 'Integrations', icon: Globe },
    { key: 'data', label: 'Data & Privacy', icon: Key }
  ]

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      if (activeTab === 'profile') {
        await updateProfile({
          full_name: formData.full_name,
          email: formData.email
        })
      } else if (activeTab === 'security' && formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          throw new Error('Passwords do not match')
        }
        await updatePassword(formData.current_password, formData.new_password)
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
      }
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <Button variant="secondary" size="sm">
                  Change Avatar
                </Button>
                <p className="text-sm text-gray-400 mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Account Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{profile?.level || 1}</div>
                  <div className="text-sm text-gray-400">Current Level</div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{profile?.points || 0}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{profile?.project_count || 0}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Email Notifications</h4>
              {[
                { key: 'task_updates', label: 'Task Updates', description: 'Get notified when tasks are assigned or updated' },
                { key: 'project_updates', label: 'Project Updates', description: 'Notifications about project changes' },
                { key: 'meeting_reminders', label: 'Meeting Reminders', description: 'Reminders for upcoming meetings' },
                { key: 'deadline_alerts', label: 'Deadline Alerts', description: 'Alerts for approaching deadlines' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h5 className="font-medium text-white">{setting.label}</h5>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Push Notifications</h4>
              {[
                { key: 'browser_notifications', label: 'Browser Notifications', description: 'Show notifications in your browser' },
                { key: 'sound_alerts', label: 'Sound Alerts', description: 'Play sound for important notifications' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h5 className="font-medium text-white">{setting.label}</h5>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              ))}
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Change Password</h4>
              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                placeholder="Enter current password"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Two-Factor Authentication</h4>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-white">Authenticator App</h5>
                    <p className="text-sm text-gray-400">Use an authenticator app for additional security</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Active Sessions</h4>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'New York, US', current: true },
                  { device: 'Safari on iPhone', location: 'New York, US', current: false },
                  { device: 'Firefox on Mac', location: 'San Francisco, US', current: false }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <h5 className="font-medium text-white flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </h5>
                      <p className="text-sm text-gray-400">{session.location}</p>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Theme</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'dark', label: 'Dark', active: true },
                  { key: 'light', label: 'Light', active: false },
                  { key: 'auto', label: 'Auto', active: false }
                ].map((theme) => (
                  <div
                    key={theme.key}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      theme.active 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-8 rounded mb-2 mx-auto ${
                        theme.key === 'dark' ? 'bg-gray-800' :
                        theme.key === 'light' ? 'bg-white' :
                        'bg-gradient-to-r from-gray-800 to-white'
                      }`} />
                      <h5 className="font-medium text-white">{theme.label}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Display Options</h4>
              {[
                { key: 'compact_mode', label: 'Compact Mode', description: 'Reduce spacing and padding' },
                { key: 'animations', label: 'Animations', description: 'Enable smooth transitions and effects' },
                { key: 'sidebar_auto_collapse', label: 'Auto-collapse Sidebar', description: 'Automatically collapse sidebar on small screens' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h5 className="font-medium text-white">{setting.label}</h5>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              ))}
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Connected Apps</h4>
              {[
                { name: 'Google Calendar', description: 'Sync your meetings and deadlines', connected: true },
                { name: 'Slack', description: 'Get notifications in your Slack workspace', connected: false },
                { name: 'GitHub', description: 'Link your repositories and issues', connected: true },
                { name: 'Zoom', description: 'Create and join meetings directly', connected: false }
              ].map((app, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h5 className="font-medium text-white">{app.name}</h5>
                    <p className="text-sm text-gray-400">{app.description}</p>
                  </div>
                  <Button 
                    variant={app.connected ? 'ghost' : 'primary'} 
                    size="sm"
                  >
                    {app.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">API Access</h4>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium text-white">API Key</h5>
                    <p className="text-sm text-gray-400">Use this key to access the CollabTask API</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Generate New Key
                  </Button>
                </div>
                <div className="font-mono text-sm bg-gray-900 p-3 rounded border">
                  ct_1234567890abcdef...
                </div>
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Data Export</h4>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <h5 className="font-medium text-white mb-2">Download Your Data</h5>
                <p className="text-sm text-gray-400 mb-4">
                  Export all your projects, tasks, and personal data in JSON format.
                </p>
                <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                  Export Data
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Privacy Settings</h4>
              {[
                { key: 'profile_visibility', label: 'Profile Visibility', description: 'Allow others to see your profile' },
                { key: 'activity_tracking', label: 'Activity Tracking', description: 'Track your activity for analytics' },
                { key: 'data_sharing', label: 'Data Sharing', description: 'Share anonymized data for product improvement' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h5 className="font-medium text-white">{setting.label}</h5>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white text-red-400">Danger Zone</h4>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h5 className="font-medium text-white mb-2">Delete Account</h5>
                <p className="text-sm text-gray-400 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-gray-400"
            >
              <Settings className="w-full h-full" />
            </motion.div>
            Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your account and preferences
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="p-6">
            {renderTabContent()}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}