import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Zap, Copy, Download, RefreshCw as RegenIcon } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import AICore from '../components/3d/AICore.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { analyzeCode } from '../lib/api.js'

const DEFAULT_CODE = `def login(user, password):
    record = db.find_user(user)
    if record and record.password == password:
        token = create_token(record.id)
        return {"ok": True, "token": token}
    return {"ok": False}
`

export default function CodeWorkspace() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('python')
  const { running, stageIndex, result, error, coreState, run } = useAnalysisRun(() => analyzeCode(code, language))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Code Workspace</h1>
        <p className="mt-1 text-sm text-[var(--text-dim)]">A project-aware editor for exploring and analyzing code.</p>
      </div>
      <AnalysisError message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Glass3DFrame padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--text)]">login.py</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded border border-[var(--border-bright)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-dim)] outline-none">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
              </select>
            </div>
            <GlowButton icon={Zap} onClick={run} disabled={running}>
              {running ? 'Analyzing…' : 'Analyze'}
            </GlowButton>
          </div>
          <Editor
            height="480px"
            language={language}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 16 }, fontFamily: 'JetBrains Mono, monospace' }}
          />
        </Glass3DFrame>

        <div className="flex flex-col gap-5">
          {running || result ? (
            <Glass3DFrame>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                {running ? 'AI Processing Pipeline' : 'Analysis Result'}
              </div>
              {running && <ThinkingPipeline currentIndex={stageIndex} />}
              {result && !running && (
                <div className="flex flex-col gap-3 text-sm">
                  <StatusBadge tone="success">Analysis Complete</StatusBadge>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-[var(--border)] p-3">
                      <div className="text-[10px] uppercase text-[var(--text-faint)]">Complexity</div>
                      <div className="mt-1 font-medium">{result.complexity}</div>
                    </div>
                    <div className="rounded border border-[var(--border)] p-3">
                      <div className="text-[10px] uppercase text-[var(--text-faint)]">Issues Found</div>
                      <div className="mt-1 font-medium">{result.issues}</div>
                    </div>
                  </div>
                  <p className="text-[var(--text-dim)]">{result.summary}</p>
                  <div className="flex gap-2 pt-1">
                    <GlowButton variant="secondary" icon={Copy}>Copy</GlowButton>
                    <GlowButton variant="secondary" icon={Download}>Download</GlowButton>
                    <GlowButton variant="ghost" icon={RegenIcon} onClick={run}>Regenerate</GlowButton>
                  </div>
                </div>
              )}
            </Glass3DFrame>
          ) : (
            <Glass3DFrame padded={false} className="overflow-hidden">
              <AICore state={coreState} height={260} />
              <p className="border-t border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--text-faint)]">
                Click Analyze to run the code through the AI pipeline.
              </p>
            </Glass3DFrame>
          )}
        </div>
      </div>
    </div>
  )
}
