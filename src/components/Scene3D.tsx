import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'

function Printer3D() {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#2a4a6b" />
      </mesh>
      
      {/* Frame */}
      <mesh position={[-1.8, 0, -1.3]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.8, 0, -1.3]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.8, 0, 1.3]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.8, 0, 1.3]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Top frame */}
      <mesh position={[0, 1.4, -1.3]}>
        <boxGeometry args={[3.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 1.4, 1.3]}>
        <boxGeometry args={[3.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Print bed */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[3, 0.1, 2.5]} />
          <meshStandardMaterial color="#00aef0" />
        </mesh>
      </Float>
      
      {/* Hotend */}
      <mesh position={[0.5, 0.2, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Sample print */}
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh position={[0, -0.6, 0]}>
          <dodecahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#37d67a" />
        </mesh>
      </Float>
    </group>
  )
}

function Scene3D() {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Printer3D />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={4}
            maxDistance={12}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Scene3D
