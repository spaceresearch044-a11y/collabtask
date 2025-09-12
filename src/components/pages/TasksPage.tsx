import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { TaskBoard } from '../tasks/TaskBoard'
import { EmptyState } from '../dashboard/EmptyState'
import { Card } from '../ui/Card'

export const TasksPage: React.FC = () => {
  const { projects, loading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyState type="tasks" />
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-1">
            Manage tasks across your projects
          </p>
        </div>
      </motion.div>

      {/* Project Selector */}
      {projects.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-200">
                Select Project:
              </label>
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Task Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TaskBoard 
          projectId={selectedProject.id}
          projectMembers={[]} // TODO: Fetch project members
        />
      </motion.div>
    </div>
  )
}