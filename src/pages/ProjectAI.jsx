import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BrainCircuit, Send, FileText } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { chatWithAI, getProjects } from '../lib/api.js'

export default function ProjectAI() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const project = projects.find((item) => item.id === projectId)

  useEffect(() => {
    getProjects()
      .then((items) => {
        setProjects(items)
        setProjectId((current) => (
          items.some((item) => item.id === current) ? current : items[0]?.id || ''
        ))
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false))
  }, [])

  async function ask() {
    if (!question.trim() || asking || !project) return
    setAsking(true)
    setError('')
    setAnswer(null)
    try {
      const response = await chatWithAI(question, project.id)
      setAnswer({ text: response.reply, sources: response.sources })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <BrainCircuit className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Project AI</h1>
      </div>
      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}
      {loading ? (
        <p className="text-sm text-[var(--text-faint)]">Loading your projects…</p>
      ) : projects.length === 0 ? (
        <Glass3DFrame>
          <p className="text-sm text-[var(--text-dim)]">Import a project before asking questions about its source code.</p>
        </Glass3DFrame>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          <Glass3DFrame className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Project</label>
              <select value={projectId} onChange={(event) => { setProjectId(event.target.value); setAnswer(null) }} className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none">
                {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-[var(--text-faint)]">Files indexed</span><span className="font-mono">{project?.files ?? 0}</span></div>
              <div className="flex items-center justify-between"><span className="text-[var(--text-faint)]">Knowledge status</span><StatusBadge tone={project?.status === 'indexed' ? 'success' : 'warning'}>{project?.status || 'unavailable'}</StatusBadge></div>
              <div className="flex items-center justify-between"><span className="text-[var(--text-faint)]">Project AI</span><StatusBadge tone="accent">Enabled</StatusBadge></div>
            </div>
          </Glass3DFrame>

          <div className="flex flex-col gap-4">
            <Glass3DFrame>
              <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--text-dim)]">
                <StatusBadge tone="success">{project?.files ?? 0} files indexed</StatusBadge>
                <StatusBadge tone="accent">Project knowledge active</StatusBadge>
              </div>
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && ask()}
                  placeholder={`Ask something about ${project?.name || 'this project'}…`}
                  className="flex-1 rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
                />
                <button onClick={ask} disabled={asking || !question.trim()} className="flex items-center justify-center rounded-md bg-[var(--accent)] px-4 text-white shadow-sm transition-colors hover:bg-[#426957] disabled:opacity-50">
                  <Send size={16} />
                </button>
              </div>
            </Glass3DFrame>

            {asking && (
              <Glass3DFrame>
                <p className="animate-pulse text-sm text-[var(--text-faint)]">Searching indexed source files…</p>
              </Glass3DFrame>
            )}

            {answer && (
              <Glass3DFrame>
                <p className="whitespace-pre-wrap text-sm text-[var(--text)]">{answer.text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {answer.sources.map((source) => (
                    <span key={source} className="flex items-center gap-1.5 rounded border border-[var(--border-bright)] px-2.5 py-1 text-xs text-[var(--text-dim)]">
                      <FileText size={12} /> {source}
                    </span>
                  ))}
                </div>
              </Glass3DFrame>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
