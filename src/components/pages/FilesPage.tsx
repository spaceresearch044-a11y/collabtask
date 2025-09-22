import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Share2,
  Trash2,
  Eye,
  FolderOpen,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useFiles } from '../../hooks/useFiles'

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.startsWith('audio/')) return Music
  if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive
  return FileText
}

const getFileColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'from-green-500 to-emerald-600'
  if (mimeType.startsWith('video/')) return 'from-red-500 to-pink-600'
  if (mimeType.startsWith('audio/')) return 'from-purple-500 to-violet-600'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'from-orange-500 to-amber-600'
  return 'from-blue-500 to-cyan-600'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const FilesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dragOver, setDragOver] = useState(false)

  const { files, loading, uploadFile, deleteFile } = useFiles()

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'images' && file.mime_type?.startsWith('image/')) ||
                         (filterType === 'documents' && file.mime_type?.includes('document')) ||
                         (filterType === 'videos' && file.mime_type?.startsWith('video/'))
    return matchesSearch && matchesFilter
  })

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadFile(files[i])
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-cyan-400"
            >
              <FileText className="w-full h-full" />
            </motion.div>
            Files
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and share your project files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
              className="cursor-pointer"
            >
              Upload Files
            </Button>
          </label>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="videos">Videos</option>
            </select>

            <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Drop files here to upload
        </h3>
        <p className="text-gray-400">
          Or click the upload button to browse files
        </p>
      </motion.div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400">No files found</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredFiles.map((file, index) => {
            const FileIcon = getFileIcon(file.mime_type || '')
            const colorClasses = getFileColor(file.mime_type || '')
            
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-4 hover:bg-gray-800/30 transition-colors group" hover>
                  {viewMode === 'grid' ? (
                    <div className="space-y-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses} rounded-lg flex items-center justify-center mx-auto`}>
                        <FileIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium text-white truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {file.size ? formatFileSize(Number(file.size)) : 'Unknown size'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" icon={<Eye className="w-3 h-3" />} />
                        <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />} />
                        <Button variant="ghost" size="sm" icon={<Share2 className="w-3 h-3" />} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={() => deleteFile(file.id)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses} rounded-lg flex items-center justify-center`}>
                          <FileIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{file.name}</h4>
                          <p className="text-sm text-gray-400">
                            {file.size ? formatFileSize(Number(file.size)) : 'Unknown size'} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                        <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} />
                        <Button variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => deleteFile(file.id)}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}