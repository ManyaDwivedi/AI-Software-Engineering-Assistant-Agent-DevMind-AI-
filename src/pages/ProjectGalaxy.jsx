import { useEffect, useMemo, useState } from 'react'
import { Network, Search } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import ProjectGalaxy3D from '../components/3d/ProjectGalaxy3D.jsx'
import { getProjectGraph, getProjects } from '../lib/api.js'

const LEGEND = [
  { group: 'core', color: '#5b806f' },
  { group: 'auth', color: '#80758c' },
  { group: 'ui', color: '#b58a4a' },
  { group: 'data', color: '#66849a' },
  { group: 'util', color: '#858a84' },
]

export default function ProjectGalaxy() {
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
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
    getProjectGraph(projectId)
      .then(setGraph)
      .catch((caught) => setError(caught.message))
  }, [projectId])

  const visibleGraph = useMemo(() => {
    const nodes = graph.nodes.filter((node) => node.id.toLowerCase().includes(query.toLowerCase()))
    const visibleIds = new Set(nodes.map((node) => node.id))
    return { nodes, edges: graph.edges.filter(([from, to]) => visibleIds.has(from) && visibleIds.has(to)) }
  }, [graph, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Network className="text-[var(--accent)]" size={20} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Project Galaxy</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {projects.length > 0 && (
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm">
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search file…"
              className="rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] py-2 pl-8 pr-3 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60" />
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--text-dim)]">A 3D map of indexed source files and detected imports. Drag to rotate, scroll to zoom, click a node for details.</p>

      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}
      <Glass3DFrame padded={false} className="overflow-hidden" glow>
        {loading ? (
          <p className="p-6 text-sm text-[var(--text-faint)]">Loading project graph…</p>
        ) : visibleGraph.nodes.length ? (
          <ProjectGalaxy3D graph={visibleGraph} />
        ) : (
          <p className="p-6 text-sm text-[var(--text-faint)]">Import a project containing source files to build its dependency graph.</p>
        )}
      </Glass3DFrame>

      <div className="flex flex-wrap gap-4">
        {LEGEND.map((item) => (
          <div key={item.group} className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            {item.group}
          </div>
        ))}
      </div>
    </div>
  )
}
