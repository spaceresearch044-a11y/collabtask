import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import * as THREE from 'three'

interface Task3DProps {
  position: [number, number, number]
  color: string
  title: string
  status: string
}

const Task3D: React.FC<Task3DProps> = ({ position, color, title, status }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1.5, 0.8, 0.1]}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </Box>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {title}
      </Text>
      <Text
        position={[0, -0.3, 0.1]}
        fontSize={0.06}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {status}
      </Text>
    </group>
  )
}

const FloatingParticles: React.FC = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null!)
  const count = 50
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        speed: Math.random() * 0.01 + 0.005,
      })
    }
    return temp
  }, [])

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        particle.position[1] += particle.speed
        if (particle.position[1] > 10) {
          particle.position[1] = -10
        }
        
        const matrix = new THREE.Matrix4()
        matrix.setPosition(...particle.position)
        particlesRef.current.setMatrixAt(i, matrix)
      })
      particlesRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
    </instancedMesh>
  )
}

export const TaskBoard3D: React.FC = () => {
  const tasks = [
    { id: '1', title: 'Design Homepage', status: 'In Progress', color: '#3b82f6', position: [-3, 2, 0] as [number, number, number] },
    { id: '2', title: 'API Integration', status: 'To Do', color: '#8b5cf6', position: [0, 2, 0] as [number, number, number] },
    { id: '3', title: 'User Testing', status: 'Review', color: '#f59e0b', position: [3, 2, 0] as [number, number, number] },
    { id: '4', title: 'Deploy to Production', status: 'Completed', color: '#10b981', position: [6, 2, 0] as [number, number, number] },
    { id: '5', title: 'Database Schema', status: 'In Progress', color: '#3b82f6', position: [-3, 0, 0] as [number, number, number] },
    { id: '6', title: 'Mobile Responsive', status: 'To Do', color: '#8b5cf6', position: [0, 0, 0] as [number, number, number] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">3D Task Board</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Drag to rotate • Scroll to zoom</span>
          </div>
        </div>

        <div className="h-96 bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-lg overflow-hidden">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            
            <FloatingParticles />
            
            {tasks.map((task) => (
              <Task3D
                key={task.id}
                position={task.position}
                color={task.color}
                title={task.title}
                status={task.status}
              />
            ))}
            
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
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
      </Card>
    </motion.div>
  )
}