import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Award,
  Medal,
  Crown,
  Flame,
  CheckCircle,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  badge_url?: string
  points_awarded: number
  awarded_at?: string
  progress?: number
  max_progress?: number
  unlocked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    type: 'task_completion',
    title: 'Task Master',
    description: 'Complete 100 tasks',
    points_awarded: 500,
    awarded_at: new Date().toISOString(),
    progress: 100,
    max_progress: 100,
    unlocked: true,
    rarity: 'epic'
  },
  {
    id: '2',
    type: 'project_creation',
    title: 'Project Pioneer',
    description: 'Create your first project',
    points_awarded: 100,
    awarded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 1,
    max_progress: 1,
    unlocked: true,
    rarity: 'common'
  },
  {
    id: '3',
    type: 'team_collaboration',
    title: 'Team Player',
    description: 'Collaborate with 10 team members',
    points_awarded: 250,
    progress: 7,
    max_progress: 10,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: '4',
    type: 'streak',
    title: 'Consistency King',
    description: 'Complete tasks for 30 consecutive days',
    points_awarded: 1000,
    progress: 15,
    max_progress: 30,
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: '5',
    type: 'meeting_attendance',
    title: 'Meeting Maven',
    description: 'Attend 50 meetings',
    points_awarded: 300,
    progress: 23,
    max_progress: 50,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: '6',
    type: 'deadline_master',
    title: 'Deadline Destroyer',
    description: 'Complete 20 tasks before deadline',
    points_awarded: 400,
    awarded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 20,
    max_progress: 20,
    unlocked: true,
    rarity: 'epic'
  }
]

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500'
    case 'epic': return 'from-purple-500 to-violet-600'
    case 'rare': return 'from-blue-500 to-cyan-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return Crown
    case 'epic': return Trophy
    case 'rare': return Medal
    default: return Award
  }
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'task_completion': return CheckCircle
    case 'project_creation': return Target
    case 'team_collaboration': return Users
    case 'streak': return Flame
    case 'meeting_attendance': return Calendar
    case 'deadline_master': return Zap
    default: return Star
  }
}

export const AchievementsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [achievements] = useState<Achievement[]>(mockAchievements)

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || 
    (selectedCategory === 'unlocked' && achievement.unlocked) ||
    (selectedCategory === 'locked' && !achievement.unlocked) ||
    achievement.rarity === selectedCategory
  )

  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points_awarded, 0)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const completionRate = Math.round((unlockedCount / achievements.length) * 100)

  const categories = [
    { key: 'all', label: 'All Achievements', count: achievements.length },
    { key: 'unlocked', label: 'Unlocked', count: unlockedCount },
    { key: 'locked', label: 'Locked', count: achievements.length - unlockedCount },
    { key: 'legendary', label: 'Legendary', count: achievements.filter(a => a.rarity === 'legendary').length },
    { key: 'epic', label: 'Epic', count: achievements.filter(a => a.rarity === 'epic').length },
    { key: 'rare', label: 'Rare', count: achievements.filter(a => a.rarity === 'rare').length },
    { key: 'common', label: 'Common', count: achievements.filter(a => a.rarity === 'common').length }
  ]

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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 text-amber-400"
            >
              <Trophy className="w-full h-full" />
            </motion.div>
            Achievements
          </h1>
          <p className="text-gray-400 mt-1">
            Track your progress and unlock rewards
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="p-6 hover:scale-105 transition-transform" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalPoints}</div>
          <div className="text-sm text-gray-400">Total Points</div>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{unlockedCount}</div>
          <div className="text-sm text-gray-400">Unlocked</div>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{completionRate}%</div>
          <div className="text-sm text-gray-400">Completion</div>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform" hover>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}
          </div>
          <div className="text-sm text-gray-400">Legendary</div>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className="flex items-center gap-2"
              >
                {category.label}
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredAchievements.map((achievement, index) => {
          const RarityIcon = getRarityIcon(achievement.rarity)
          const AchievementIcon = getAchievementIcon(achievement.type)
          const rarityColor = getRarityColor(achievement.rarity)
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className={`p-6 relative overflow-hidden ${
                achievement.unlocked ? 'border-2' : 'opacity-60'
              }`} hover glow={achievement.unlocked}>
                {/* Rarity Background */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${rarityColor} opacity-20 rounded-bl-full`} />
                
                {/* Rarity Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`w-6 h-6 bg-gradient-to-r ${rarityColor} rounded-full flex items-center justify-center`}>
                    <RarityIcon className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Achievement Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${
                    achievement.unlocked ? rarityColor : 'from-gray-600 to-gray-700'
                  } rounded-2xl flex items-center justify-center relative`}>
                    <AchievementIcon className="w-8 h-8 text-white" />
                    {achievement.unlocked && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
                      />
                    )}
                  </div>

                  {/* Achievement Info */}
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {achievement.max_progress && achievement.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className={achievement.unlocked ? 'text-green-400' : 'text-gray-400'}>
                          {achievement.progress}/{achievement.max_progress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            achievement.unlocked ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-cyan-600'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(achievement.progress / achievement.max_progress) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Points & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        {achievement.points_awarded} pts
                      </span>
                    </div>
                    {achievement.awarded_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.awarded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {achievement.unlocked ? (
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Unlocked</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        {achievement.progress && achievement.max_progress ? 
                          `${achievement.max_progress - achievement.progress} more to unlock` :
                          'Locked'
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Unlock Animation */}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${rarityColor} opacity-10 rounded-xl`} />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400">No achievements found in this category</p>
        </motion.div>
      )}
    </div>
  )
}