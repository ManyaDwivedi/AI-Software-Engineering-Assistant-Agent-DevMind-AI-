import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { RefreshCw, Zap } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { refactorCode } from '../lib/api.js'

const SAMPLE = `function getTotal(items) {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].qty
  }
  return total
}`

export default function Refactor() {
  const [code, setCode] = useState(SAMPLE)
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => refactorCode(code))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <RefreshCw className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Refactor</h1>
      </div>
      <AnalysisError message={error} />

      <Glass3DFrame padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
          <span className="text-sm text-[var(--text-dim)]">Original Code</span>
          <GlowButton icon={Zap} onClick={run} disabled={running}>{running ? 'Refactoring…' : 'Refactor'}</GlowButton>
        </div>
        <Editor height="180px" language="javascript" value={code} onChange={(v) => setCode(v ?? '')} theme="vs-dark"
          options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono, monospace' }} />
      </Glass3DFrame>

      {running && (
        <Glass3DFrame>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Reworking the implementation</div>
          <ThinkingPipeline currentIndex={stageIndex} />
        </Glass3DFrame>
      )}

      {!running && result && (
        <>
          <Glass3DFrame padded={false} className="overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--success)]">Refactored Code</div>
            <Editor height="150px" language="javascript" value={result.after} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true, fontFamily: 'JetBrains Mono, monospace' }} />
          </Glass3DFrame>
          <Glass3DFrame>
            <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Improvements</h3>
            <ul className="mb-4 list-disc pl-4 text-sm text-[var(--text-dim)]">
              {result.improvements.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">Explanation</h3>
            <p className="text-sm text-[var(--text-dim)]">{result.explanation}</p>
          </Glass3DFrame>
        </>
      )}
    </div>
  )
}
