import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { FlaskConical, Zap, Copy, Download } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { generateTests } from '../lib/api.js'

const KINDS = ['Unit Tests', 'Integration Tests', 'Edge Cases', 'Negative Cases', 'Boundary Cases']
const SAMPLE = `def validate_schema(payload, schema):
    errors = []
    for field, rules in schema.items():
        if rules.get("required") and payload.get(field) is None:
            errors.append(f"{field} is required")
    return errors`

export default function Tests() {
  const [code] = useState(SAMPLE)
  const [selected, setSelected] = useState(['Unit Tests', 'Edge Cases'])
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => generateTests(code, selected))
  const [tab, setTab] = useState('unit')

  function toggle(kind) {
    setSelected((s) => (s.includes(kind) ? s.filter((k) => k !== kind) : [...s, kind]))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <FlaskConical className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Generate Tests</h1>
      </div>
      <AnalysisError message={error} />

      <Glass3DFrame padded={false} className="overflow-hidden">
        <div className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--text-dim)]">Source</div>
        <Editor height="200px" language="python" value={code} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true, fontFamily: 'JetBrains Mono, monospace' }} />
      </Glass3DFrame>

      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button key={k} onClick={() => toggle(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected.includes(k) ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-bright)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}>
            {k}
          </button>
        ))}
        <GlowButton icon={Zap} onClick={run} disabled={running} className="ml-auto">{running ? 'Generating…' : 'Generate Tests'}</GlowButton>
      </div>

      {running && (
        <Glass3DFrame>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Generating Solution</div>
          <ThinkingPipeline currentIndex={stageIndex} />
        </Glass3DFrame>
      )}

      {!running && result && (
        <Glass3DFrame padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
            <div className="flex gap-1">
              {['unit', 'integration', 'edge'].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? 'bg-[var(--surface-3)] text-[var(--text)]' : 'text-[var(--text-faint)] hover:text-[var(--text-dim)]'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <GlowButton variant="ghost" icon={Copy}>Copy</GlowButton>
              <GlowButton variant="ghost" icon={Download}>Download</GlowButton>
            </div>
          </div>
          <Editor height="240px" language="python" value={result[tab]} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true, fontFamily: 'JetBrains Mono, monospace' }} />
        </Glass3DFrame>
      )}
    </div>
  )
}
