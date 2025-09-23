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
  Loader2,
  Target,
  Sparkles
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
    project_type: 'individual' as 'individual' | 'team',
    deadline: '',
    color: '#3b82f6'
  })
  const [generatedCode, setGeneratedCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  
  const { createProject, joinProject, loading } = useProjects()

  const handleSubmit = async () => {
    try {
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        project_type: formData.project_type,
        deadline: formData.deadline || null,
        color: formData.color
      })
      
      if (formData.project_type === 'team' && result?.teamCode) {
        setGeneratedCode(result.teamCode)
        setStep(3)
        return
      }
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error creating/joining project:', error)
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
      project_type: 'individual',
      deadline: '',
      color: '#3b82f6'
    })
    setGeneratedCode('')
    setCodeCopied(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getModalTitle = () => {
    if (step === 1) return 'Create New Project'
    if (step === 2) return 'Project Details'
    return 'Team Code Generated'
  }

  const colors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#f97316', '#84cc16'
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
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">{getModalTitle()}</h2>
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
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Project Type (only for create mode) */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400">Choose your project type:</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, project_type: 'individual' })}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        formData.project_type === 'individual'
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <User className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <h3 className="font-semibold text-white">Individual</h3>
                      <p className="text-sm text-gray-400">Personal project</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, project_type: 'team' })}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        formData.project_type === 'team'
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
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
                    icon={<Target className="w-4 h-4" />}
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
                    icon={<Target className="w-4 h-4" />}
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
                        Color Theme
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {colors.map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              formData.color === color 
                                ? 'border-white shadow-lg' 
                                : 'border-gray-600 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}
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
                      onClick={handleSubmit}
                      disabled={!formData.name.trim() || loading}
                      className="flex-1"
                      icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Team Code Generated */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Team Project Created!</h3>
                    <p className="text-gray-400">Share this code with your team members:</p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-mono font-bold text-blue-400">
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
                  </motion.div>

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
                    icon={<Target className="w-4 h-4" />}
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