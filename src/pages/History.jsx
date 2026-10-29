import { useState, useEffect } from 'react'
import { History as HistoryIcon } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { getHistory } from '../lib/api.js'

const FILTERS = ['All', 'Debug', 'Review', 'Generate', 'Explain', 'Tests', 'Refactor', 'Docs']

export default function History() {
  const [filter, setFilter] = useState('All')
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false))
  }, [])
  const items = filter === 'All' ? history : history.filter((item) => item.type === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <HistoryIcon className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">History</h1>
      </div>

      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-bright)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((h) => (
          <Glass3DFrame key={h.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <StatusBadge tone="violet" dot={false}>{h.type}</StatusBadge>
                <span className="text-sm font-medium text-[var(--text)]">{h.project}</span>
              </div>
              <p className="mt-1.5 truncate text-sm text-[var(--text-dim)]">{h.preview}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusBadge tone="success" dot={false}>{h.status}</StatusBadge>
              <span className="text-[11px] text-[var(--text-faint)]">{h.date}</span>
            </div>
          </Glass3DFrame>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-[var(--text-faint)]">No history for this filter yet.</p>}
        {loading && <p className="text-sm text-[var(--text-faint)]">Loading activity…</p>}
      </div>
    </div>
  )
}
