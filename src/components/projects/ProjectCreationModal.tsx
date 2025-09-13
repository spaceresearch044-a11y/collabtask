import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  User, 
  Users, 
  Calendar, 
  Flag, 
  Copy, 
  Check,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useProjects } from '../../hooks/useProjects'

interface ProjectCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'individual' as 'individual' | 'team',
    role: 'lead' as 'lead' | 'member',
    teamCode: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [generatedCode, setGeneratedCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  
  const { createProject, joinProject, loading } = useProjects()

  const handleSubmit = async () => {
    try {
      if (formData.type === 'team' && formData.role === 'member') {
        await joinProject(formData.teamCode)
      } else {
        const result = await createProject({
          name: formData.name,
          description: formData.description,
          project_type: formData.type,
          deadline: formData.deadline || null,
        })
        
        if (formData.type === 'team' && result?.teamCode) {
          setGeneratedCode(result.teamCode)
          setStep(4)
          return
        }
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating/joining project:', error)
      // Error is already handled in the hook, just log it here
    }
  }

  const copyTeamCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      name: '',
      description: '',
      type: 'individual',
      role: 'lead',
      teamCode: '',
      deadline: '',
      priority: 'medium'
    })
    setGeneratedCode('')
    setCodeCopied(false)
  }

  const handleClose = () => {
    resetForm()
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {step === 1 && 'Create New Project'}
                  {step === 2 && 'Project Details'}
                  {step === 3 && 'Team Setup'}
                  {step === 4 && 'Team Code Generated'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Project Type */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400">Choose your project type:</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: 'individual' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === 'individual'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <User className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <h3 className="font-semibold text-white">Individual</h3>
                      <p className="text-sm text-gray-400">Personal project</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: 'team' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === 'team'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <h3 className="font-semibold text-white">Team</h3>
                      <p className="text-sm text-gray-400">Collaborative project</p>
                    </motion.button>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Project Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Input
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project..."
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Deadline (Optional)"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      icon={<Calendar className="w-4 h-4" />}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-200">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => formData.type === 'team' ? setStep(3) : handleSubmit()}
                      disabled={!formData.name.trim() || loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : formData.type === 'team' ? (
                        'Continue'
                      ) : (
                        'Create Project'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Team Setup */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400">Choose your role:</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, role: 'lead' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'lead'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Flag className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <h3 className="font-semibold text-white">Team Lead</h3>
                      <p className="text-sm text-gray-400">Create & manage</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, role: 'member' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'member'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <h3 className="font-semibold text-white">Team Member</h3>
                      <p className="text-sm text-gray-400">Join existing</p>
                    </motion.button>
                  </div>

                  {formData.role === 'member' && (
                    <Input
                      label="Team Code"
                      value={formData.teamCode}
                      onChange={(e) => setFormData({ ...formData, teamCode: e.target.value.toUpperCase() })}
                      placeholder="Enter team code (e.g., CT-AB12)"
                      required
                    />
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={
                        loading || 
                        (formData.role === 'member' && !formData.teamCode.trim())
                      }
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : formData.role === 'lead' ? (
                        'Create Team Project'
                      ) : (
                        'Join Team'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Team Code Generated */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Team Project Created!</h3>
                    <p className="text-gray-400">Share this code with your team members:</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-mono font-bold text-blue-400">
                        {generatedCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTeamCode}
                        icon={codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      >
                        {codeCopied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Team members can use this code to join your project. 
                    The code expires in 30 days.
                  </p>

                  <Button
                    variant="primary"
                    onClick={() => {
                      onSuccess()
                      onClose()
                    }}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}