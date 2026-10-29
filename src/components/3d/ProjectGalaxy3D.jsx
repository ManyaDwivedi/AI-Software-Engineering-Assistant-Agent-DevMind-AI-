import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'

const GROUP_COLOR = {
  core: '#5b806f',
  auth: '#80758c',
  ui: '#b58a4a',
  data: '#66849a',
  util: '#858a84',
}

function layoutNodes(nodes) {
  const n = nodes.length
  return nodes.map((node, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const r = 2.4
    return {
      ...node,
      pos: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
    }
  })
}

function Node({ node, onSelect, selected }) {
  const color = GROUP_COLOR[node.group] || '#858a84'
  const [hovered, setHovered] = useState(false)
  return (
    <group position={node.pos}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(node)}
        scale={selected?.id === node.id || hovered ? 1.4 : 1}
      >
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered || selected?.id === node.id ? 0.45 : 0.12} />
      </mesh>
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.12}
        color="#3f4541"
        anchorX="center"
        anchorY="middle"
      >
        {node.id}
      </Text>
    </group>
  )
}

function Scene({ graph, onSelect, selected }) {
  const laidOut = useMemo(() => layoutNodes(graph.nodes), [graph])
  const posById = useMemo(() => Object.fromEntries(laidOut.map((n) => [n.id, n.pos])), [laidOut])

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1.2} />
      {graph.edges.map(([a, b], i) => (
        <Line key={i} points={[posById[a], posById[b]]} color="#c9c8c0" lineWidth={1} transparent opacity={0.7} />
      ))}
      {laidOut.map((node) => (
        <Node key={node.id} node={node} onSelect={onSelect} selected={selected} />
      ))}
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} minDistance={2} maxDistance={8} />
    </>
  )
}

export default function ProjectGalaxy3D({ graph, height = 480 }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="relative" style={{ height }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <Scene graph={graph} onSelect={setSelected} selected={selected} />
      </Canvas>
      {selected && (
        <div className="absolute right-4 top-4 w-56 rounded-md border border-[var(--border-bright)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
          <div className="font-mono text-sm text-[var(--text)]">{selected.id}</div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--text-dim)]">
            <div className="flex justify-between"><span>Functions</span><span className="font-mono">{selected.functions}</span></div>
            <div className="flex justify-between"><span>Imports</span><span className="font-mono">{selected.imports}</span></div>
            <div className="flex justify-between"><span>Dependents</span><span className="font-mono">{selected.dependents}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
