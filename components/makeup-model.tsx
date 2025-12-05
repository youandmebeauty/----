"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function MakeupModel() {
  const { scene } = useGLTF("/makeup__cosmetics.glb")
  const modelRef = useRef<THREE.Group>(null)

  // Auto-rotate the model slowly
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={modelRef}>
      <primitive
        object={scene}
        scale={0.5}
        position={[0, -2, 0]}
      />
    </group>
  )
}

// Preload the model
useGLTF.preload("/makeup__cosmetics.glb")

export function MakeupModel3D() {
  return (
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting setup similar to Sketchfab */}
          <ambientLight intensity={0.2} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Environment for reflections */}
          <Environment preset="studio" />

          {/* The 3D Model */}
          <MakeupModel />

          {/* Soft shadows */}
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Interactive controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
  )
}
