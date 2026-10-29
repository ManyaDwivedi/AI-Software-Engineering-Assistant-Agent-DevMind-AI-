import { useEffect, useState } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)] border border-[var(--border-bright)]'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5 left-0.5' : 'left-0.5'}`} />
    </button>
  )
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-3.5 last:border-none">
      <div>
        <div className="text-sm text-[var(--text)]">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-[var(--text-faint)]">{desc}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ai-swe-theme')
    return saved || 'light'
  })
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [inlineHints, setInlineHints] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ai-swe-theme', theme)
  }, [theme])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <SettingsIcon className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Glass3DFrame>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Appearance</h2>
        <Row label="Theme" desc="Interface color scheme">
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded border border-[var(--border-bright)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs text-[var(--text)] outline-none">
            <option value="light">Light mode</option>
            <option value="dark">Dark mode</option>
          </select>
        </Row>
        <Row label="Reduced motion" desc="Minimize animation across the app">
          <Toggle checked={reducedMotion} onChange={setReducedMotion} />
        </Row>
      </Glass3DFrame>

      <Glass3DFrame>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">AI Preferences</h2>
        <Row label="Auto-suggest fixes" desc="Proactively suggest fixes while you type">
          <Toggle checked={autoSuggest} onChange={setAutoSuggest} />
        </Row>
        <Row label="Inline hints" desc="Show AI hints directly in the editor gutter">
          <Toggle checked={inlineHints} onChange={setInlineHints} />
        </Row>
      </Glass3DFrame>

      <Glass3DFrame>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Notifications</h2>
        <Row label="Weekly email digest" desc="Summary of AI activity across your projects">
          <Toggle checked={emailDigest} onChange={setEmailDigest} />
        </Row>
      </Glass3DFrame>
    </div>
  )
}
