import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Cpu, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import AICore from '../components/3d/AICore.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, remember)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--bg)] bg-grid">
      {/* Right: 3D AI Core, full-bleed on large screens */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-transparent z-10" />
        <AICore state="ready" height="100%" />
      </div>

      {/* Left: form */}
      <div className="relative z-20 flex w-full flex-col justify-center px-8 sm:px-16 lg:w-[48%] lg:px-20">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10">
            <Cpu size={18} className="text-[var(--accent)]" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">v1.0 · Connected Workspace</span>
        </div>

        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl">
          AI Software<br />Engineering<br />Assistant
        </h1>
        <p className="mt-4 max-w-sm text-[var(--text-dim)]">Build. Analyze. Debug. Evolve.</p>

        <form onSubmit={onSubmit} className="mt-10 flex max-w-sm flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-[var(--text-dim)]">Password</label>
              <Link to="/forgot-password" className="text-xs text-[var(--accent)] hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 pr-10 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-dim)]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-[var(--border-bright)] bg-[var(--surface-2)] accent-[var(--accent)]" />
            Remember me
          </label>

          {error && <p className="text-xs text-[var(--error)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#426957] hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Log in'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-8 text-sm text-[var(--text-faint)]">
          Don't have an account? <Link to="/register" className="text-[var(--accent)] hover:underline">Create one</Link>
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-faint)]">Sign in with your registered account.</p>
      </div>
    </div>
  )
}
