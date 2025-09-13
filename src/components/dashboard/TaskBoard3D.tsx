import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Plus, Grid3X3, List, Box as BoxIcon, Filter, Search } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { useTasks } from '../../hooks/useTasks'
import { TaskModal } from '../modals/TaskModal'
import * as THREE from 'three'

interface Task3DProps {
  position: [number, number, number]
  color: string
  title: string
  status: string
  priority: string
  onClick: () => void
}

const Task3D: React.FC<Task3DProps> = ({ position, color, title, status, priority, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2)
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
    }
  })

  const getPriorityHeight = () => {
    switch (priority) {
      case 'urgent': return 1.2
      case 'high': return 1.0
      case 'medium': return 0.8
      case 'low': return 0.6
      default: return 0.8
    }
  }

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1.5, getPriorityHeight(), 0.15]}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.9 : 0.7}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Box>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
        font="/fonts/inter-bold.woff"
      >
        {title}
      </Text>
      <Text
        position={[0, -0.3, 0.1]}
        fontSize={0.08}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {status.replace('_', ' ').toUpperCase()}
      </Text>
      <Text
        position={[0, -0.45, 0.1]}
        fontSize={0.06}
        color={priority === 'urgent' ? '#ef4444' : priority === 'high' ? '#f97316' : priority === 'medium' ? '#eab308' : '#22c55e'}
        anchorX="center"
        anchorY="middle"
      >
        {priority.toUpperCase()}
      </Text>
    </group>
  )
}

const FloatingParticles: React.FC = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null!)
  const count = 100
  
  const particles = React.useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30
        ] as [number, number, number],
        speed: Math.random() * 0.02 + 0.01,
        scale: Math.random() * 0.5 + 0.5,
      })
    }
    return temp
  }, [])

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        particle.position[1] += particle.speed
        if (particle.position[1] > 15) {
          particle.position[1] = -15
        }
        
        const matrix = new THREE.Matrix4()
        matrix.setPosition(...particle.position)
        matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale))
        particlesRef.current.setMatrixAt(i, matrix)
      })
      particlesRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
    </instancedMesh>
  )
}

export const TaskBoard3D: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3d' | 'kanban' | 'list'>('3d')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  
  const { projects } = useProjects()
  const { tasks, fetchTasks } = useTasks(selectedProjectId)

  // Use first project if none selected
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const handleCreateTask = () => {
    if (!selectedProjectId) return
    setShowTaskModal(true)
  }

  const handleTaskSuccess = () => {
    if (selectedProjectId) {
      fetchTasks(selectedProjectId)
    }
    setShowTaskModal(false)
  }

  const getTaskColor = (status: string, priority: string) => {
    if (priority === 'urgent') return '#ef4444'
    switch (status) {
      case 'todo': return '#8b5cf6'
      case 'in_progress': return '#3b82f6'
      case 'review': return '#f59e0b'
      case 'completed': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTaskPosition = (index: number, status: string): [number, number, number] => {
    const statusColumns = {
      todo: -6,
      in_progress: -2,
      review: 2,
      completed: 6
    }
    
    const tasksInColumn = tasks.filter(t => t.status === status)
    const taskIndex = tasksInColumn.findIndex(t => t.id === tasks[index].id)
    
    return [
      statusColumns[status as keyof typeof statusColumns],
      2 - (taskIndex * 1.5),
      0
    ]
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  // Show empty state if no projects
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-white mb-4">No Projects Yet</h3>
        <p className="text-gray-400">Create your first project to start managing tasks.</p>
      </div>
    )
  }

  // Show empty state if no tasks
  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BoxIcon className="w-6 h-6 text-purple-400" />
            Task Board
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            
            <Button variant="primary" onClick={handleCreateTask} icon={<Plus className="w-4 h-4" />}>
              Add Task
            </Button>
          </div>
        </div>

        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-white mb-4">No Tasks Yet</h3>
          <p className="text-gray-400 mb-6">Add your first task to get started with project management.</p>
          <Button variant="primary" onClick={handleCreateTask} icon={<Plus className="w-4 h-4" />}>
            Create First Task
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BoxIcon className="w-6 h-6 text-purple-400" />
            Task Board
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg">
              {[
                { key: '3d', icon: BoxIcon, label: '3D View' },
                { key: 'kanban', icon: Grid3X3, label: 'Kanban' },
                { key: 'list', icon: List, label: 'List' },
              ].map(({ key, icon: Icon, label }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(key as any)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" icon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button variant="ghost" icon={<Search className="w-4 h-4" />}>
                Search
              </Button>
              <Button variant="primary" onClick={handleCreateTask} icon={<Plus className="w-4 h-4" />}>
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Task Board */}
        {viewMode === '3d' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <div className="h-96 bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-lg overflow-hidden relative">
                <Canvas
                  camera={{ position: [0, 2, 15], fov: 60 }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                  <pointLight position={[0, 10, -10]} intensity={0.3} color="#8b5cf6" />
                  
                  <FloatingParticles />
                  
                  {/* Column Labels */}
                  <Text position={[-6, 4, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center">TODO</Text>
                  <Text position={[-2, 4, 0]} fontSize={0.3} color="#3b82f6" anchorX="center">IN PROGRESS</Text>
                  <Text position={[2, 4, 0]} fontSize={0.3} color="#f59e0b" anchorX="center">REVIEW</Text>
                  <Text position={[6, 4, 0]} fontSize={0.3} color="#10b981" anchorX="center">COMPLETED</Text>
                  
                  {tasks.map((task, index) => (
                    <Task3D
                      key={task.id}
                      position={getTaskPosition(index, task.status)}
                      color={getTaskColor(task.status, task.priority)}
                      title={task.title}
                      status={task.status}
                      priority={task.priority}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                  
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate
                    autoRotateSpeed={0.3}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={8}
                    maxDistance={25}
                  />
                </Canvas>

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Drag to rotate • Scroll to zoom • Click tasks to view details</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-sm text-gray-400">To Do</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm text-gray-400">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span className="text-sm text-gray-400">Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-400">Completed</span>
                </div>
              </div>

              {/* Priority Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <span className="text-xs text-gray-500">Urgent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="text-xs text-gray-500">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
                  <span className="text-xs text-gray-500">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-1 bg-green-500 rounded-sm"></div>
                  <span className="text-xs text-gray-500">Low</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">{selectedTask.title}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    selectedTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    selectedTask.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTask.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    selectedTask.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                {selectedTask.assigned_to_profile && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Assignee:</span>
                    <span className="text-white">
                      {selectedTask.assigned_to_profile.full_name || selectedTask.assigned_to_profile.email}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" className="flex-1">Edit Task</Button>
                <Button variant="ghost" onClick={() => setSelectedTask(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Modal */}
      {showTaskModal && selectedProjectId && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskSuccess}
          projectId={selectedProjectId}
        />
      )}
    </>
  )
}
            >
              <h3 className="text-xl font-bold text-white mb-4">{selectedTask.title}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    selectedTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    selectedTask.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTask.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    selectedTask.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                {selectedTask.assignee && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Assignee:</span>
                    <span className="text-white">{selectedTask.assignee}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" className="flex-1">Edit Task</Button>
                <Button variant="ghost" onClick={() => setSelectedTask(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}