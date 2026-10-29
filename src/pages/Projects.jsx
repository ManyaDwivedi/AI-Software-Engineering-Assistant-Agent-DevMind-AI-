import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, UploadCloud, FolderKanban, ArrowRight } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import { getProjects, uploadProject } from '../lib/api.js'

function ProjectCard({ p, onOpen }) {
  return (
    <Glass3DFrame className="group flex flex-col gap-3 transition-all hover:border-[var(--accent)]/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--violet)]/10 text-[var(--violet)]">
            <FolderKanban size={16} />
          </div>
          <div className="font-medium text-[var(--text)]">{p.name}</div>
        </div>
        <StatusBadge tone={p.status === 'indexed' ? 'success' : 'warning'}>{p.status}</StatusBadge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="rounded border border-[var(--border-bright)] px-2 py-0.5 text-[11px] text-[var(--text-dim)] font-mono">{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--text-faint)]">
        <span>{p.files} files</span>
        <span>Analyzed {p.lastAnalyzed}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${p.health}%` }} />
        </div>
        <span className="text-[11px] font-mono text-[var(--text-dim)]">{p.health}%</span>
      </div>
      <button onClick={() => onOpen(p)} className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] group-hover:gap-2.5 transition-all">
        Open Project <ArrowRight size={14} />
      </button>
    </Glass3DFrame>
  )
}

function UploadModal({ onClose, onImported }) {
  const [stage, setStage] = useState(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  async function startUpload(files) {
    if (!files?.length || uploading) return
    setDone(false)
    setError('')
    setUploading(true)
    setStage('Uploading and indexing project')
    try {
      const imported = await uploadProject(files, setStage)
      setResult(imported)
      await onImported()
      setDone(true)
    } catch (caught) {
      setError(caught.message)
      setStage(null)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <Glass3DFrame className="w-full max-w-lg" glow>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Import Your Project</h2>
          <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text)]">✕</button>
        </div>

        {!done && (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              startUpload(Array.from(event.dataTransfer.files))
            }}
            className="cursor-pointer rounded-md border-2 border-dashed border-[var(--border-bright)] p-10 text-center transition-colors hover:border-[var(--accent)]/50"
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".zip,.py,.js,.jsx,.ts,.tsx,.go,.java,.md,.json,.html,.css,.sql,.yaml,.yml,.txt"
              className="hidden"
              onChange={(event) => startUpload(Array.from(event.target.files || []))}
            />
            <UploadCloud className="mx-auto mb-3 text-[var(--accent)]" size={28} />
            <div className="font-medium text-[var(--text)]">{uploading ? 'Uploading and indexing…' : 'Drop project here'}</div>
            <p className="mt-1 text-sm text-[var(--text-dim)]">Upload a ZIP or select multiple source files</p>
            <p className="mt-3 text-xs text-[var(--text-faint)]">Your project will be scanned, processed and indexed for AI analysis.</p>
            {stage && <p className="mt-2 text-xs text-[var(--accent)]">{stage}</p>}
            {error && <p role="alert" className="mt-3 text-xs text-[var(--error)]">{error}</p>}
          </div>
        )}

        {done && (
          <div className="py-4 text-center">
            <StatusBadge tone="success" className="mx-auto">Project Indexed</StatusBadge>
            <p className="mt-3 text-sm text-[var(--text-dim)]">{result?.name}: {result?.files} source files indexed. Project AI can now search the uploaded files.</p>
            <GlowButton className="mx-auto mt-4" onClick={onClose}>Done</GlowButton>
          </div>
        )}
      </Glass3DFrame>
    </div>
  )
}

export default function Projects() {
  const [query, setQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function loadProjects() {
    try {
      setProjects(await getProjects())
    } catch (caught) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getProjects()
      .then((data) => {
        if (active) setProjects(data)
      })
      .catch((caught) => {
        if (active) setError(caught.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-[var(--text-dim)]">Manage and index the codebases your AI tools can reason about.</p>
        </div>
        <GlowButton icon={Plus} onClick={() => setShowUpload(true)}>Import Project</GlowButton>
      </div>

      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProjectCard key={p.id} p={p} onOpen={(project) => navigate(`/intelligence/project-ai?projectId=${encodeURIComponent(project.id)}`)} />
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-[var(--text-faint)]">{projects.length ? 'No projects match your search.' : 'No projects yet. Import a ZIP or select source files to get started.'}</p>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onImported={loadProjects} />}
    </div>
  )
}
