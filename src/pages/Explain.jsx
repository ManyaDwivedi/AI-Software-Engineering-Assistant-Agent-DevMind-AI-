import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Zap, Lightbulb } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { explainCode } from '../lib/api.js'

const SAMPLE = `function authenticate(email, password) {
  const user = db.findByEmail(email)
  if (!user) return null
  const hash = hashPassword(password, user.salt)
  if (hash !== user.passwordHash) return null
  return issueToken(user)
}`

export default function Explain() {
  const [code, setCode] = useState(SAMPLE)
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => explainCode(code))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <Lightbulb className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Explain Code</h1>
      </div>
      <AnalysisError message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Glass3DFrame padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-sm text-[var(--text-dim)]">Paste code to explain</span>
            <GlowButton icon={Zap} onClick={run} disabled={running}>{running ? 'Explaining…' : 'Explain'}</GlowButton>
          </div>
          <Editor height="420px" language="javascript" value={code} onChange={(v) => setCode(v ?? '')} theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono, monospace' }} />
        </Glass3DFrame>

        <Glass3DFrame>
          {running && (
            <>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Reading through the code</div>
              <ThinkingPipeline currentIndex={stageIndex} />
            </>
          )}
          {!running && result && (
            <div className="flex flex-col gap-5 text-sm">
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Overview</h3>
                <p className="text-[var(--text-dim)]">{result.overview}</p>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">How It Works</h3>
                <p className="text-[var(--text-dim)]">{result.howItWorks}</p>
              </section>
              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Function by Function</h3>
                <div className="flex flex-col gap-2">
                  {result.functions.map((f) => (
                    <div key={f.name} className="rounded border border-[var(--border)] p-3">
                      <div className="font-mono text-xs text-[var(--text)]">{f.name}</div>
                      <div className="mt-1 text-xs text-[var(--text-dim)]">{f.detail}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Complexity</h3>
                <p className="text-[var(--text-dim)]">{result.complexity}</p>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--warning)]">Potential Issues</h3>
                <ul className="list-disc pl-4 text-[var(--text-dim)]">
                  {result.issues.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--success)]">Improvements</h3>
                <ul className="list-disc pl-4 text-[var(--text-dim)]">
                  {result.improvements.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </section>
            </div>
          )}
          {!running && !result && (
            <p className="text-sm text-[var(--text-faint)]">The explanation will appear here once you run the code through the AI.</p>
          )}
        </Glass3DFrame>
      </div>
    </div>
  )
}
