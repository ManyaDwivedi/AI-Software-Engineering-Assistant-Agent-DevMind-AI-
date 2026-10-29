import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Bug, Zap, FileText } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { debugCode } from '../lib/api.js'

const SAMPLE_CODE = `function loginRequest(credentials) {
  return fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }).then(res => {
    const headers = { Authorization: \`Bearer \${getToken()}\` }
    return res
  })
}`

const SAMPLE_TRACE = `AuthError: missing bearer token
  at verifyToken (auth.js:22)
  at /api/auth/login (routes.js:14)`

export default function Debug() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [trace, setTrace] = useState(SAMPLE_TRACE)
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => debugCode(code, trace))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <Bug className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Debug Code</h1>
      </div>
      <AnalysisError message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Glass3DFrame padded={false} className="overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--text-dim)]">Code</div>
            <Editor height="260px" language="javascript" value={code} onChange={(v) => setCode(v ?? '')} theme="vs-dark"
              options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono, monospace' }} />
          </Glass3DFrame>
          <Glass3DFrame padded={false} className="overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--text-dim)]">Error / Stack Trace</div>
            <textarea value={trace} onChange={(e) => setTrace(e.target.value)} rows={5}
              className="w-full resize-none bg-[var(--surface-2)] p-4 font-mono text-xs text-[var(--error)] outline-none" />
          </Glass3DFrame>
          <GlowButton icon={Zap} onClick={run} disabled={running} className="w-fit">
            {running ? 'Debugging…' : 'Debug Code'}
          </GlowButton>
        </div>

        <Glass3DFrame>
          {running && (
            <>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">AI Debug Analysis</div>
              <ThinkingPipeline currentIndex={stageIndex} />
            </>
          )}
          {!running && result && (
            <div className="flex flex-col gap-5 text-sm">
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--error)]">Problem</h3>
                <p className="text-[var(--text-dim)]">{result.problem}</p>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--warning)]">Root Cause</h3>
                <p className="text-[var(--text-dim)]">{result.rootCause}</p>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--success)]">Suggested Fix</h3>
                <pre className="overflow-x-auto rounded border border-[var(--border)] bg-[var(--surface-2)] p-3 font-mono text-xs text-[var(--text)]">{result.fix}</pre>
                <GlowButton variant="secondary" className="mt-2">Apply Fix</GlowButton>
              </section>
              <section>
                <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Explanation</h3>
                <p className="text-[var(--text-dim)]">{result.explanation}</p>
              </section>
              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Relevant Files</h3>
                <div className="flex flex-wrap gap-2">
                  {result.files.map((f) => (
                    <button key={f} className="flex items-center gap-1.5 rounded border border-[var(--border-bright)] px-2.5 py-1 text-xs text-[var(--text-dim)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]">
                      <FileText size={12} /> {f}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
          {!running && !result && <p className="text-sm text-[var(--text-faint)]">Run Debug Code to see the root-cause analysis here.</p>}
        </Glass3DFrame>
      </div>
    </div>
  )
}
