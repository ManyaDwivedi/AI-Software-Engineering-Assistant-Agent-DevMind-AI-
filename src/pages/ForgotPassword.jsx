import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, ArrowLeft, Mail } from 'lucide-react'
import { requestPasswordReset } from '../lib/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await requestPasswordReset(email)
      setMessage(result.message)
      setSent(true)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg)] bg-grid px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10">
            <Cpu size={18} className="text-[var(--accent)]" />
          </div>
        </div>

        {sent ? (
          <div className="corner-frame rounded-md border border-[var(--border)] bg-[var(--surface)] p-6">
            <Mail className="mb-3 text-[var(--accent)]" size={22} />
            <h1 className="font-display text-xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-[var(--text-dim)]">{message} {message.includes('sent') ? `Check ${email}.` : ''}</p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Reset your password</h1>
            <p className="mt-2 text-sm text-[var(--text-dim)]">Enter your email and we'll send you a reset link.</p>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-6 w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15"
            />
            {error && <p role="alert" className="mt-3 text-xs text-[var(--error)]">{error}</p>}
            <button type="submit" disabled={loading} className="mt-4 w-full rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#426957] disabled:opacity-50">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--text)]">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
