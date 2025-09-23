import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Calendar, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Flag,
  User
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { TaskModal } from '../modals/TaskModal'
import { useTasks } from '../../hooks/useTasks'
import { useProjects } from '../../hooks/useProjects'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  project_type: 'individual' | 'team'
  status: string
  deadline: string | null
  created_at: string
  updated_at: string
  created_by: string
}

interface ProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
  onUpdate: () => void
  onOpen: (project: Project) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  viewMode, 
  onUpdate,
  onOpen 
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTasks, setShowTasks] = useState(false)
  
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks(project.id)
  const { deleteProject } = useProjects()

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id)
        onUpdate()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleTaskSuccess = () => {
    refetchTasks()
    setShowTaskModal(false)
    setSelectedTask(null)
  }

  const handleTaskEdit = (task: any) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleTaskToggle = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    try {
      // This would use the useTasks hook's updateTask function
      console.log('Toggle task status:', task.id, newStatus)
      refetchTasks()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:bg-gray-800/30 transition-colors" hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <Target className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white truncate">{project.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.project_type === 'team' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.project_type}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{totalTasks} tasks</span>
                <span>{completedTasks} completed</span>
                {project.deadline && (
                  <span>Due {formatDate(project.deadline)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
              icon={<Eye className="w-4 h-4" />}
            >
              {showTasks ? 'Hide' : 'View'} Tasks
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpen(project)}
            >
              Open
            </Button>
          </div>
        </div>

        {/* Tasks Section */}
        {showTasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Tasks</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTaskModal(true)}
                icon={<Plus className="w-3 h-3" />}
              >
                Add Task
              </Button>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTaskModal(true)}
                  className="mt-2"
                >
                  Create first task
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleTaskToggle(task)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className={`text-sm font-medium truncate ${
                          task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {task.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-gray-500">
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskEdit(task)}
                        icon={<Edit className="w-3 h-3" />}
                      />
                    </div>
                  </div>
                ))}
                
                {tasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpen(project)}
                    >
                      View all {tasks.length} tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSuccess={handleTaskSuccess}
            projectId={project.id}
            task={selectedTask}
            mode={selectedTask ? 'edit' : 'create'}
          />
        )}
      </Card>
    )
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 space-y-4 hover:bg-gray-800/30 transition-colors cursor-pointer" hover glow>
        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: project.color }}
            >
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{project.name}</h3>
              <p className="text-sm text-gray-400 truncate">
                {project.description || 'No description'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              icon={<MoreVertical className="w-4 h-4" />}
            />
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onOpen(project)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onOpen(project)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    handleDelete()
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.project_type === 'team' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {project.project_type}
            </span>
            <span className="text-gray-400">{totalTasks} tasks</span>
          </div>
          
          {project.deadline && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(project.deadline)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-blue-400">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Tasks
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTaskModal(true)
                }}
                icon={<Plus className="w-3 h-3" />}
              >
                Add
              </Button>
              {tasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTasks(!showTasks)
                  }}
                  icon={<Eye className="w-3 h-3" />}
                >
                  {showTasks ? 'Hide' : 'Show'}
                </Button>
              )}
            </div>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">No tasks yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTaskModal(true)
                }}
                icon={<Plus className="w-3 h-3" />}
              >
                Create first task
              </Button>
            </div>
          ) : (
            <>
              {/* Task Summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-800/30 rounded">
                  <div className="text-blue-400 font-medium">{tasks.filter(t => t.status === 'todo').length}</div>
                  <div className="text-gray-500">To Do</div>
                </div>
                <div className="p-2 bg-gray-800/30 rounded">
                  <div className="text-yellow-400 font-medium">{tasks.filter(t => t.status === 'in_progress').length}</div>
                  <div className="text-gray-500">In Progress</div>
                </div>
                <div className="p-2 bg-gray-800/30 rounded">
                  <div className="text-green-400 font-medium">{completedTasks}</div>
                  <div className="text-gray-500">Completed</div>
                </div>
              </div>

              {/* Recent Tasks */}
              {showTasks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 max-h-48 overflow-y-auto"
                >
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskToggle(task)
                          }}
                          className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-2 h-2 text-white" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className={`text-xs font-medium truncate ${
                            task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-1 mt-1">
                            <Flag className={`w-2 h-2 ${getPriorityColor(task.priority)}`} />
                            {task.due_date && (
                              <span className="text-xs text-gray-500">
                                {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskEdit(task)
                        }}
                        icon={<Edit className="w-3 h-3" />}
                      />
                    </div>
                  ))}
                  
                  {tasks.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpen(project)
                        }}
                      >
                        View all {tasks.length} tasks
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSuccess={handleTaskSuccess}
            projectId={project.id}
            task={selectedTask}
            mode={selectedTask ? 'edit' : 'create'}
          />
        )}
      </Card>
    </motion.div>
  )
}