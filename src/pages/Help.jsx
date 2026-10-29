import { HelpCircle, Keyboard, BookOpen, LifeBuoy } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'

const SHORTCUTS = [
  { keys: 'Ctrl + Enter', action: 'Run Analyze in the current tool' },
  { keys: 'Ctrl + K', action: 'Open command search' },
  { keys: 'Ctrl + B', action: 'Collapse / expand sidebar' },
  { keys: 'Ctrl + /', action: 'Toggle editor comment' },
]

const FAQ = [
  { q: 'How does Project AI know about my code?', a: 'Once a project is imported, it is chunked and embedded, then retrieved by relevance whenever you ask a question or run a tool.' },
  { q: 'Is my code sent anywhere?', a: 'In this preview build, everything runs against mock data locally. A real backend integration would define its own data-handling policy.' },
  { q: 'Can I use my own LLM backend?', a: 'Yes — the API service layer in src/lib/api.js is the single place to point at a FastAPI backend.' },
]

export default function Help() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <HelpCircle className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Help</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Glass3DFrame className="flex flex-col items-start gap-2">
          <BookOpen className="text-[var(--accent)]" size={18} />
          <div className="text-sm font-medium">Documentation</div>
          <p className="text-xs text-[var(--text-faint)]">Guides for every AI tool and page.</p>
        </Glass3DFrame>
        <Glass3DFrame className="flex flex-col items-start gap-2">
          <Keyboard className="text-[var(--accent)]" size={18} />
          <div className="text-sm font-medium">Keyboard Shortcuts</div>
          <p className="text-xs text-[var(--text-faint)]">Move faster through the workspace.</p>
        </Glass3DFrame>
        <Glass3DFrame className="flex flex-col items-start gap-2">
          <LifeBuoy className="text-[var(--accent)]" size={18} />
          <div className="text-sm font-medium">Support</div>
          <p className="text-xs text-[var(--text-faint)]">Reach the team for anything else.</p>
        </Glass3DFrame>
      </div>

      <Glass3DFrame>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Keyboard Shortcuts</h2>
        <div className="flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-dim)]">{s.action}</span>
              <kbd className="rounded border border-[var(--border-bright)] bg-[var(--surface-2)] px-2 py-1 font-mono text-xs">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </Glass3DFrame>

      <Glass3DFrame>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">FAQ</h2>
        <div className="flex flex-col gap-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <div className="text-sm font-medium text-[var(--text)]">{f.q}</div>
              <p className="mt-1 text-sm text-[var(--text-dim)]">{f.a}</p>
            </div>
          ))}
        </div>
      </Glass3DFrame>
    </div>
  )
}
