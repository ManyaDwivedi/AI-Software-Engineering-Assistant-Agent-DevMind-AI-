import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, Bug, SearchCheck, Sparkles, FlaskConical, RefreshCw, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import AICore from '../components/3d/AICore.jsx'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getHealth, getHistory, getProjects } from '../lib/api.js'

const QUICK_ACTIONS = [
  { to: '/tools/explain', icon: Lightbulb, title: 'Explain Code', desc: 'Understand any file, fast' },
  { to: '/tools/debug', icon: Bug, title: 'Debug Code', desc: 'Find root causes faster' },
  { to: '/tools/review', icon: SearchCheck, title: 'Code Review', desc: 'Catch issues before merge' },
  { to: '/tools/generate', icon: Sparkles, title: 'Generate Code', desc: 'From prompt to working code' },
  { to: '/tools/tests', icon: FlaskConical, title: 'Generate Tests', desc: 'Unit, integration, edge cases' },
  { to: '/tools/refactor', icon: RefreshCw, title: 'Refactor', desc: 'Cleaner code, same behavior' },
]

const CORE_LABELS = ['SEARCH', 'AST', 'RULES', 'CODE', 'CONTEXT']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [coreState] = useState('ready')
  const [projects, setProjects] = useState([])
  const [history, setHistory] = useState([])
  const [aiProviderConfigured, setAiProviderConfigured] = useState(false)
  const [error, setError] = useState('')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([getProjects(), getHistory(), getHealth()])
      .then(([projectData, historyData, health]) => {
        setProjects(projectData)
        setHistory(historyData)
        setAiProviderConfigured(health.aiProviderConfigured)
      })
      .catch((caught) => setError(caught.message))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)]">
            {greeting}, {user?.name?.split(' ')[0] || 'Developer'}.
          </h1>
          <p className="mt-1 text-[var(--text-dim)]">Analyze code, understand projects and build better software.</p>
        </div>
        {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}
        <StatusBadge tone={aiProviderConfigured ? 'success' : 'warning'}>
          {aiProviderConfigured ? 'AI PROVIDER READY' : 'LOCAL ANALYSIS MODE'}
        </StatusBadge>
      </div>

      {/* Hero: AI Core + stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Glass3DFrame glow padded={false} className="relative overflow-hidden">
          <div className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">AI Core</div>
          <div className="absolute right-5 top-5 z-10">
            <StatusBadge tone="accent">READY</StatusBadge>
          </div>
          <AICore state={coreState} height={320} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-4 pb-4 font-mono text-[10px] tracking-wider text-[var(--text-faint)]">
            {CORE_LABELS.map((l) => <span key={l}>{l}</span>)}
          </div>
        </Glass3DFrame>

        <div className="flex flex-col gap-5">
          <Glass3DFrame>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Project Knowledge</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{projects.length}</span>
              <span className="text-sm text-[var(--text-dim)]">projects indexed</span>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-[var(--text-dim)]">{p.name}</span>
                  <StatusBadge tone={p.status === 'indexed' ? 'success' : 'warning'} dot={false}>{p.status}</StatusBadge>
                </div>
              ))}
              {projects.length === 0 && <p className="text-xs text-[var(--text-faint)]">No indexed projects yet. Import a project to get started.</p>}
            </div>
          </Glass3DFrame>

          <Glass3DFrame>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Recent Activity</div>
            <div className="flex flex-col gap-3">
              {history.slice(0, 3).map((h) => (
                <div key={h.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text)]">{h.type} · {h.project}</div>
                    <div className="truncate text-xs text-[var(--text-faint)]">{h.preview}</div>
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--text-faint)]">{h.date}</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-[var(--text-faint)]">Your tool activity will appear here.</p>}
            </div>
          </Glass3DFrame>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Quick Actions</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="group flex flex-col items-start gap-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]"
            >
              <div className="flex w-full items-center justify-between">
                <a.icon size={18} className="text-[var(--accent)]" strokeWidth={1.8} />
                <ArrowUpRight size={14} className="text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--text)]">{a.title}</div>
                <div className="mt-0.5 text-xs text-[var(--text-faint)]">{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
