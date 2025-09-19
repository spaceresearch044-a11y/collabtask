import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Plus, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useReports } from '../../hooks/useReports'

export const ReportsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'custom' | 'project_summary',
    project_id: '',
    date_range_start: '',
    date_range_end: ''
  })

  const { reports, loading, generateReport, exportReport } = useReports()

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await generateReport(formData)
      setShowCreateModal(false)
      setFormData({
        title: '',
        type: 'weekly',
        project_id: '',
        date_range_start: '',
        date_range_end: ''
      })
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const reportTemplates = [
    {
      type: 'weekly',
      title: 'Weekly Summary',
      description: 'Overview of tasks and progress for the past week',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      type: 'monthly',
      title: 'Monthly Report',
      description: 'Comprehensive monthly performance analysis',
      icon: BarChart3,
      color: 'from-purple-500 to-violet-600'
    },
    {
      type: 'project_summary',
      title: 'Project Summary',
      description: 'Detailed project status and metrics',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    {
      type: 'custom',
      title: 'Custom Report',
      description: 'Create a report with custom date range and filters',
      icon: FileText,
      color: 'from-orange-500 to-amber-600'
    }
  ]

  const quickStats = [
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'from-blue-500 to-cyan-600' },
    { label: 'This Month', value: reports.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-purple-500 to-violet-600' },
    { label: 'Project Reports', value: reports.filter(r => r.type === 'project_summary').length, icon: Target, color: 'from-green-500 to-emerald-600' },
    { label: 'Custom Reports', value: reports.filter(r => r.type === 'custom').length, icon: PieChart, color: 'from-orange-500 to-amber-600' }
  ]

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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 text-yellow-400"
            >
              <BarChart3 className="w-full h-full" />
            </motion.div>
            Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Generate insights and track performance
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Generate Report
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="p-6 hover:scale-105 transition-transform" hover>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Report Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Generate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template, index) => (
              <motion.div
                key={template.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => {
                  setFormData({ ...formData, type: template.type as any, title: template.title })
                  setShowCreateModal(true)
                }}
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                  <template.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-white mb-1">{template.title}</h4>
                <p className="text-sm text-gray-400">{template.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
          <div className="space-y-4">
            {reports.slice(0, 10).map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{report.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="capitalize">{report.type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => exportReport(report.id, 'pdf')}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export
                  </Button>
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reports generated yet</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Generate Report Modal */}
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
                <h3 className="text-xl font-bold text-white">Generate Report</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleGenerateReport} className="space-y-4">
                <Input
                  label="Report Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter report title"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Report Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly Summary</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="project_summary">Project Summary</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>

                {formData.type === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Start Date"
                      value={formData.date_range_start}
                      onChange={(e) => setFormData({ ...formData, date_range_start: e.target.value })}
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={formData.date_range_end}
                      onChange={(e) => setFormData({ ...formData, date_range_end: e.target.value })}
                    />
                  </div>
                )}

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
                    icon={<BarChart3 className="w-4 h-4" />}
                  >
                    Generate
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