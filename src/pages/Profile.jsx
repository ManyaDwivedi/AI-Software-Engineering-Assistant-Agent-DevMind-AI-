import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getHistory, getProjects } from '../lib/api.js'

export default function Profile() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [projectCount, setProjectCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getHistory(), getProjects()])
      .then(([activity, projects]) => {
        setHistory(activity)
        setProjectCount(projects.length)
      })
      .catch((caught) => setError(caught.message))
  }, [])

  const memberSince = user?.created_at
    ? new Date(user.created_at.replace(' ', 'T') + (user.created_at.endsWith('Z') ? '' : 'Z')).getFullYear()
    : '—'

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <User className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>
      </div>
      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}

      <Glass3DFrame className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--violet)]/20 text-xl font-medium text-[var(--violet)]">
          {(user?.name || 'D')[0].toUpperCase()}
        </div>
        <div>
          <div className="font-display text-lg font-semibold text-[var(--text)]">{user?.name || 'Developer'}</div>
          <div className="text-sm text-[var(--text-faint)]">{user?.email}</div>
        </div>
        <StatusBadge tone="success" className="ml-auto">Active</StatusBadge>
      </Glass3DFrame>

      <Glass3DFrame>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Account</h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between"><span className="text-[var(--text-dim)]">Plan</span><span>Developer Preview</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-dim)]">Member since</span><span>{memberSince}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-dim)]">Projects</span><span>{projectCount}</span></div>
        </div>
      </Glass3DFrame>

      <Glass3DFrame>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Recent Activity</h2>
        <div className="flex flex-col gap-3 text-sm">
          {history.slice(0, 4).map((h) => (
            <div key={h.id} className="flex items-center justify-between">
              <span className="text-[var(--text-dim)]">{h.type} · {h.project}</span>
              <span className="text-xs text-[var(--text-faint)]">{h.date}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-[var(--text-faint)]">No recent activity yet.</p>}
        </div>
      </Glass3DFrame>
    </div>
  )
}
