import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cpu, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import AICore from '../components/3d/AICore.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--bg)] bg-grid">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-transparent z-10" />
        <AICore state="analyzing" height="100%" />
      </div>

      <div className="relative z-20 flex w-full flex-col justify-center px-8 sm:px-16 lg:w-[48%] lg:px-20">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10">
            <Cpu size={18} className="text-[var(--accent)]" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">v1.0 · Connected Workspace</span>
        </div>

        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--text)]">Create your account</h1>
        <p className="mt-4 max-w-sm text-[var(--text-dim)]">Set up your workspace in under a minute.</p>

        <form onSubmit={onSubmit} className="mt-10 flex max-w-sm flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace"
              className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15" />
          </div>

          {error && <p className="text-xs text-[var(--error)]">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#426957] hover:shadow-md active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-8 text-sm text-[var(--text-faint)]">
          Already have an account? <Link to="/login" className="text-[var(--accent)] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
