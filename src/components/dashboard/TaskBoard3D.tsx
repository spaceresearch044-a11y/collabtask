import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei'
import { 
  Plus, 
  Eye, 
  Grid3X3, 
  List, 
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { TaskModal } from '../modals/TaskModal'
import { useTasks } from '../../hooks/useTasks'
import { useProjects } from '../../hooks/useProjects'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import * as THREE from 'three'

// 3D Task Card Component
const TaskCard3D = ({ task, position, onClick, isSelected }: any) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      if (hovered) {
        meshRef.current.scale.setScalar(1.1)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#eab308'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e'
      case 'in_progress': return '#3b82f6'
      case 'review': return '#eab308'
      default: return '#8b5cf6'
    }
  }

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[2, 1.5, 0.2]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={isSelected ? '#3b82f6' : getStatusColor(task.status)}
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Priority indicator */}
      <Sphere
        position={[0.8, 0.6, 0.2]}
        args={[0.1]}
      >
        <meshStandardMaterial color={getPriorityColor(task.priority)} />
      </Sphere>

      {/* Task title */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {task.title}
      </Text>

      {/* Status indicator */}
      <Text
        position={[0, -0.5, 0.2]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {task.status.replace('_', ' ').toUpperCase()}
      </Text>
    </group>
  )
}

// 3D Scene Component
const TaskScene = ({ tasks, onTaskClick, selectedTask }: any) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 10)
  }, [camera])

  const getTaskPosition = (index: number, status: string) => {
    const statusPositions = {
      todo: { x: -6, baseY: 0 },
      in_progress: { x: -2, baseY: 0 },
      review: { x: 2, baseY: 0 },
      completed: { x: 6, baseY: 0 }
    }

    const statusPos = statusPositions[status as keyof typeof statusPositions] || statusPositions.todo
    const tasksInStatus = tasks.filter((t: any) => t.status === status)
    const indexInStatus = tasksInStatus.findIndex((t: any) => t.id === tasks[index].id)
    
    return [
      statusPos.x,
      statusPos.baseY + (indexInStatus - tasksInStatus.length / 2) * 2,
      0
    ]
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={0.3} />
      
      {/* Status columns */}
      {['todo', 'in_progress', 'review', 'completed'].map((status, index) => (
        <group key={status}>
          <Text
            position={[-6 + index * 4, 4, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {status.replace('_', ' ').toUpperCase()}
          </Text>
          
          {/* Column background */}
          <Box
            position={[-6 + index * 4, 0, -0.5]}
            args={[3, 8, 0.1]}
          >
            <meshStandardMaterial 
              color="#1f2937" 
              transparent 
              opacity={0.3} 
            />
          </Box>
        </group>
      ))}

      {/* Task cards */}
      {tasks.map((task: any, index: number) => (
        <TaskCard3D
          key={task.id}
          task={task}
          position={getTaskPosition(index, task.status)}
          onClick={() => onTaskClick(task)}
          isSelected={selectedTask?.id === task.id}
        />
      ))}

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={5}
      />
    </>
  )
}

export const TaskBoard3D: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'3d' | 'kanban' | 'list'>('3d')

  const { projects } = useProjects()
  const { currentView } = useSelector((state: RootState) => state.ui)
  
  // Use first project for demo, in real app this would be selected
  const selectedProject = projects[0]
  const { tasks, loading, fetchTasks } = useTasks(selectedProject?.id)

  useEffect(() => {
    if (selectedProject?.id) {
      fetchTasks(selectedProject.id)
    }
  }, [selectedProject?.id])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
  }

  const handleCreateTask = () => {
    setShowTaskModal(true)
  }

  const handleTaskSuccess = () => {
    if (selectedProject?.id) {
      fetchTasks(selectedProject.id)
    }
    setShowTaskModal(false)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    )
  }

  if (!selectedProject) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-white mb-2">No Project Selected</h3>
          <p className="text-gray-400">Create a project to start managing tasks.</p>
        </div>
      </Card>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            Task Board - {selectedProject.name}
          </h2>
          <Button
            variant="primary"
            onClick={handleCreateTask}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>

        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
              ? 'No tasks match your current filters.' 
              : 'Create your first task to get started with 3D task management.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
            <Button
              variant="primary"
              onClick={handleCreateTask}
              icon={<Plus className="w-4 h-4" />}
            >
              Create First Task
            </Button>
          )}
        </div>

        {showTaskModal && (
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSuccess={handleTaskSuccess}
            projectId={selectedProject.id}
          />
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <CheckCircle2 className="w-6 h-6 text-blue-400" />
          </motion.div>
          3D Task Board - {selectedProject.name}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('3d')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === '3d' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="3D View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Kanban View"
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          <Button
            variant="primary"
            onClick={handleCreateTask}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* 3D Task Board */}
      <Card className="p-0 overflow-hidden" glow>
        <div className="h-[600px] bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
          <Canvas>
            <TaskScene 
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              selectedTask={selectedTask}
            />
          </Canvas>
        </div>

        {/* Task Details Panel */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 border-t border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {selectedTask.title}
                  </h3>
                  {selectedTask.description && (
                    <p className="text-gray-400 mb-4">{selectedTask.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flag className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTask.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        selectedTask.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        selectedTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    
                    {selectedTask.due_date && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {selectedTask.assigned_to_profile && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{selectedTask.assigned_to_profile.full_name || selectedTask.assigned_to_profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTask(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // TODO: Open task edit modal
                      console.log('Edit task:', selectedTask.id)
                    }}
                  >
                    Edit Task
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskSuccess}
          projectId={selectedProject.id}
        />
      )}
    </div>
  )
}