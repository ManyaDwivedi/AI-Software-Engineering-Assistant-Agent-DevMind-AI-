import { useState } from 'react'
import { FileText, Zap, Copy, Download } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { generateDocumentation } from '../lib/api.js'

const TYPES = [
  { id: 'function', label: 'Function Documentation' },
  { id: 'api', label: 'API Documentation' },
  { id: 'readme', label: 'README' },
  { id: 'project', label: 'Project Documentation' },
]

const SAMPLE_CODE = `def validate_schema(payload, schema):
    errors = []
    for field, rules in schema.items():
        if rules.get("required") and payload.get(field) is None:
            errors.append(f"{field} is required")
    return errors`

export default function Documentation() {
  const [type, setType] = useState('function')
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => generateDocumentation(SAMPLE_CODE, type, 'python'))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <FileText className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Documentation</h1>
      </div>
      <AnalysisError message={error} />

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${type === t.id ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-bright)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}>
            {t.label}
          </button>
        ))}
        <GlowButton icon={Zap} onClick={run} disabled={running} className="ml-auto">{running ? 'Writing…' : 'Generate Docs'}</GlowButton>
      </div>

      {running && (
        <Glass3DFrame>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Drafting documentation</div>
          <ThinkingPipeline currentIndex={stageIndex} />
        </Glass3DFrame>
      )}

      {!running && result && (
        <Glass3DFrame padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-sm text-[var(--text-dim)]">{TYPES.find((t) => t.id === type)?.label}</span>
            <div className="flex gap-1.5">
              <GlowButton variant="ghost" icon={Copy}>Copy</GlowButton>
              <GlowButton variant="ghost" icon={Download}>Download</GlowButton>
            </div>
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed text-[var(--text-dim)]">{result}</pre>
        </Glass3DFrame>
      )}
    </div>
  )
}
