import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glow = false,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={clsx(
        'bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl',
        glow && 'shadow-2xl shadow-blue-500/10',
        hover && 'hover:border-gray-700 transition-colors duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  )
}