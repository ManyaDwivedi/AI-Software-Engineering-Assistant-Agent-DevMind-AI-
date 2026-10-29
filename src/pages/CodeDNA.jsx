import { useEffect, useState } from 'react'
import { Dna } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import { getProjectDNA, getProjects } from '../lib/api.js'

function DNAStrand({ metrics }) {
  const height = 340
  const rungCount = metrics.length
  const gap = height / (rungCount + 1)

  return (
    <svg viewBox={`0 0 420 ${height}`} className="w-full" style={{ maxHeight: height }}>
      {Array.from({ length: rungCount }).map((_, i) => {
        const y = gap * (i + 1)
        const wave = Math.sin(i * 0.9) * 70
        const leftX = 130 + wave
        const rightX = 290 - wave
        const metric = metrics[i]
        const rungWidth = (metric.value / 100) * (rightX - leftX)
        return (
          <g key={metric.label}>
            <line x1={leftX} y1={y} x2={rightX} y2={y} stroke="#d9d8d1" strokeWidth="2" />
            <line x1={leftX} y1={y} x2={leftX + rungWidth} y2={y} stroke={metric.tone} strokeWidth="3" />
            <circle cx={leftX} cy={y} r="4.5" fill={metric.tone} />
            <circle cx={rightX} cy={y} r="4.5" fill="#f0efea" stroke={metric.tone} strokeWidth="1.5" />
            <text x={leftX - 12} y={y + 3} textAnchor="end" fontSize="10" fill="#626a64" fontFamily="JetBrains Mono, monospace">
              {metric.label}
            </text>
            <text x={rightX + 12} y={y + 3} fontSize="11" fill={metric.tone} fontFamily="JetBrains Mono, monospace" fontWeight="600">
              {metric.value}
            </text>
          </g>
        )
      })}
      {Array.from({ length: rungCount - 1 }).map((_, i) => {
        const y1 = gap * (i + 1); const y2 = gap * (i + 2)
        const w1 = Math.sin(i * 0.9) * 70; const w2 = Math.sin((i + 1) * 0.9) * 70
        return (
          <path key={`l-${i}`} d={`M ${130 + w1} ${y1} Q ${130 + (w1 + w2) / 2 - 20} ${(y1 + y2) / 2} ${130 + w2} ${y2}`}
            stroke="#c9c8c0" strokeWidth="1.5" fill="none" />
        )
      })}
      {Array.from({ length: rungCount - 1 }).map((_, i) => {
        const y1 = gap * (i + 1); const y2 = gap * (i + 2)
        const w1 = Math.sin(i * 0.9) * 70; const w2 = Math.sin((i + 1) * 0.9) * 70
        return (
          <path key={`r-${i}`} d={`M ${290 - w1} ${y1} Q ${290 - (w1 + w2) / 2 + 20} ${(y1 + y2) / 2} ${290 - w2} ${y2}`}
            stroke="#c9c8c0" strokeWidth="1.5" fill="none" />
        )
      })}
    </svg>
  )
}

export default function CodeDNA() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [metrics, setMetrics] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects()
      .then((items) => {
        setProjects(items)
        setProjectId(items[0]?.id || '')
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!projectId) {
      return
    }
    getProjectDNA(projectId)
      .then((result) => setMetrics(result.metrics))
      .catch((caught) => setError(caught.message))
  }, [projectId])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Dna className="text-[var(--accent)]" size={20} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Project DNA</h1>
        </div>
        {projects.length > 0 && (
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm">
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        )}
      </div>
      <p className="text-sm text-[var(--text-dim)]">A structural read of uploaded source files — metric scores are computed from indexed code.</p>
      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}
      {loading ? (
        <p className="text-sm text-[var(--text-faint)]">Calculating source metrics…</p>
      ) : metrics.length === 0 ? (
        <Glass3DFrame><p className="text-sm text-[var(--text-faint)]">Import a project containing source files to calculate its code metrics.</p></Glass3DFrame>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
          <Glass3DFrame glow className="flex items-center justify-center">
            <DNAStrand metrics={metrics} />
          </Glass3DFrame>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Glass3DFrame key={metric.label}>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">{metric.label}</div>
                <div className="mt-1.5 font-display text-2xl font-semibold" style={{ color: metric.tone }}>{metric.value}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div className="h-full rounded-full" style={{ width: `${metric.value}%`, background: metric.tone }} />
                </div>
              </Glass3DFrame>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
