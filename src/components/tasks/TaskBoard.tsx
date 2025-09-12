import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { TaskCard } from './TaskCard'
import { TaskCreationModal } from './TaskCreationModal'
import { useTasks } from '../../hooks/useTasks'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface TaskBoardProps {
  projectId: string
  projectMembers?: Array<{
    id: string
    full_name: string | null
    email: string
  }>
}

const statusColumns = [
  { key: 'todo', title: 'To Do', color: 'border-gray-600' },
  { key: 'in_progress', title: 'In Progress', color: 'border-blue-500' },
  { key: 'review', title: 'Review', color: 'border-yellow-500' },
  { key: 'completed', title: 'Completed', color: 'border-green-500' },
] as const

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, projectMembers = [] }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')

  const { tasks, loading, fetchTasks } = useTasks(projectId)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId)
    }
  }, [projectId])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'all' || 
                           (filterAssignee === 'unassigned' && !task.assigned_to) ||
                           task.assigned_to === filterAssignee
    return matchesSearch && matchesPriority && matchesAssignee
  })

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Task Board</h2>
          <p className="text-gray-400 mt-1">
            Manage and track your project tasks
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Task
        </Button>
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

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {projectMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || member.email}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.key)
          
          return (
            <motion.div
              key={column.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className={`p-4 border-t-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard 
                        task={task} 
                        projectMembers={projectMembers}
                        onUpdate={() => fetchTasks(projectId)}
                      />
                    </motion.div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchTasks(projectId)}
          projectId={projectId}
          projectMembers={projectMembers}
        />
      )}
    </div>
  )
}