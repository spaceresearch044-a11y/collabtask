import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Users, 
  Code,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useProjects } from '../../hooks/useProjects'

interface TeamJoinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const TeamJoinModal: React.FC<TeamJoinModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [teamCode, setTeamCode] = useState('')
  const { joinProject, loading, error } = useProjects()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await joinProject(teamCode.trim().toUpperCase())
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error joining team:', error)
    }
  }

  const handleClose = () => {
    setTeamCode('')
    onClose()
  }

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
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Join Team Project</h2>
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

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                  <Code className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Enter Team Code</h3>
                  <p className="text-gray-400 text-sm">
                    Ask your team lead for the 6-character team code to join their project.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Team Code"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="CT-XXXX"
                  required
                  maxLength={7}
                  icon={<Code className="w-4 h-4" />}
                  className="text-center font-mono text-lg tracking-wider"
                />

                <div className="text-center text-xs text-gray-500">
                  Team codes are case-insensitive and expire after 30 days
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
                    disabled={!teamCode.trim() || loading}
                    className="flex-1"
                    icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  >
                    {loading ? 'Joining...' : 'Join Team'}
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