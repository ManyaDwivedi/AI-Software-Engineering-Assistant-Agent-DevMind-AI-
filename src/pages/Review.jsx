import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { SearchCheck, Zap } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { reviewCode } from '../lib/api.js'

const SAMPLE = `app.post('/orders', async (req, res) => {
  const orders = await db.query('SELECT * FROM orders')
  res.json(orders)
})`

const SEVERITY_TONE = { Critical: 'error', High: 'error', Medium: 'warning', Low: 'accent', Suggestion: 'neutral' }

export default function Review() {
  const [code, setCode] = useState(SAMPLE)
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => reviewCode(code))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <SearchCheck className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Code Review</h1>
      </div>
      <AnalysisError message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Glass3DFrame padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-sm text-[var(--text-dim)]">Code to review</span>
            <GlowButton icon={Zap} onClick={run} disabled={running}>{running ? 'Reviewing…' : 'Review'}</GlowButton>
          </div>
          <Editor height="420px" language="javascript" value={code} onChange={(v) => setCode(v ?? '')} theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono, monospace' }} />
        </Glass3DFrame>

        <Glass3DFrame>
          {running && (
            <>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Reviewing against best practices</div>
              <ThinkingPipeline currentIndex={stageIndex} />
            </>
          )}
          {!running && result && (
            <div className="flex flex-col gap-5 text-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(result.scores).map(([k, v]) => (
                  <div key={k} className="rounded border border-[var(--border)] p-3 text-center">
                    <div className="font-display text-xl font-semibold text-[var(--text)]">{v}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">{k}</div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Issues Found</h3>
                <div className="flex flex-col gap-2">
                  {result.issues.map((issue, i) => (
                    <div key={i} className="rounded border border-[var(--border)] p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <StatusBadge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</StatusBadge>
                        <span className="font-mono text-xs text-[var(--text-faint)]">{issue.file}:{issue.line}</span>
                      </div>
                      <p className="text-[var(--text-dim)]">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!running && !result && <p className="text-sm text-[var(--text-faint)]">Run a review to see quality, security and performance findings.</p>}
        </Glass3DFrame>
      </div>
    </div>
  )
}
