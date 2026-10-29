import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STATE_COLOR = {
  ready: '#3f7d68',
  analyzing: '#5b86a8',
  retrieving: '#7d8f9a',
  generating: '#5a9682',
  complete: '#3f7d68',
}

function NeuralNodes({ count = 110, color, speed }) {
  const points = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 1.35 + Math.random() * 0.25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * speed
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function CoreSphere({ color, active }) {
  const mesh = useRef()
  const wire = useRef()
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * (active ? 0.55 : 0.18)
      mesh.current.rotation.x += delta * 0.12
      const t = state.clock.getElapsedTime()
      const pulse = active ? 1 + Math.sin(t * 3) * 0.05 : 1 + Math.sin(t * 0.8) * 0.02
      mesh.current.scale.setScalar(pulse)
    }
    if (wire.current) wire.current.rotation.y -= delta * 0.28
  })
  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.28 : 0.12}
          roughness={0.54}
          metalness={0.18}
          wireframe
          transparent
          opacity={0.46}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color={'#dceef0'} wireframe transparent opacity={0.22} />
      </mesh>
      <pointLight color={'#dfeff5'} intensity={active ? 2.2 : 1.2} distance={5} position={[1.4, 1.6, 2.4]} />
      <pointLight color={color} intensity={active ? 1.6 : 0.9} distance={4} position={[-1, -1, 1.2]} />
    </group>
  )
}

function Rings({ color }) {
  const r1 = useRef(); const r2 = useRef(); const r3 = useRef()
  useFrame((_, delta) => {
    if (r1.current) r1.current.rotation.x += delta * 0.18
    if (r2.current) r2.current.rotation.z += delta * 0.14
    if (r3.current) r3.current.rotation.y -= delta * 0.11
  })
  return (
    <>
      <mesh ref={r1} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.55, 0.007, 12, 120]} />
        <meshBasicMaterial color={'rgba(63,125,104,0.30)'} transparent opacity={0.9} />
      </mesh>
      <mesh ref={r2} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.83, 0.006, 10, 140]} />
        <meshBasicMaterial color={'rgba(79,126,168,0.20)'} transparent opacity={0.8} />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 2.7, Math.PI / 5, 0]}>
        <torusGeometry args={[2.15, 0.004, 10, 150]} />
        <meshBasicMaterial color={'rgba(120,150,155,0.18)'} transparent opacity={0.75} />
      </mesh>
    </>
  )
}

function Scene({ state }) {
  const color = STATE_COLOR[state] || STATE_COLOR.ready
  const active = state !== 'ready'
  return (
    <>
      <ambientLight intensity={0.7} color="#edf6f3" />
      <directionalLight position={[2.2, 2.4, 1.8]} intensity={1.6} color="#f7fbff" />
      <directionalLight position={[-2.4, 1.2, 2]} intensity={0.7} color="#bdd6d0" />
      <CoreSphere color={color} active={active} />
      <NeuralNodes color={color} speed={active ? 0.45 : 0.15} />
      <Rings color={color} />
    </>
  )
}

/**
 * The AI Core — reused on the Dashboard and inside the Thinking
 * Pipeline. `state` drives color and animation intensity:
 * 'ready' | 'analyzing' | 'retrieving' | 'generating' | 'complete'
 */
export default function AICore({ state = 'ready', height = 360 }) {
  return (
    <div style={{ height }} className="relative">
      <Canvas camera={{ position: [0, 0, 3.6], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Scene state={state} />
        </Suspense>
      </Canvas>
    </div>
  )
}
