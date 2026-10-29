import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Sparkles, Zap, Copy, Download, RefreshCw } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import GlowButton from '../components/ui/GlowButton.jsx'
import ThinkingPipeline from '../components/ai/ThinkingPipeline.jsx'
import { useAnalysisRun } from '../lib/useAnalysisRun.js'
import AnalysisError from '../components/ui/AnalysisError.jsx'
import { generateCode } from '../lib/api.js'

export default function Generate() {
  const [prompt, setPrompt] = useState('A function that validates a payload dict against a schema definition, returning a list of error strings.')
  const [language, setLanguage] = useState('python')
  const [framework, setFramework] = useState('none')
  const { running, stageIndex, result, error, run } = useAnalysisRun(() => generateCode(prompt, language, framework))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <Sparkles className="text-[var(--accent)]" size={20} />
        <h1 className="font-display text-2xl font-semibold tracking-tight">Generate Code</h1>
      </div>
      <AnalysisError message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Glass3DFrame className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6}
              className="w-full resize-none rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] p-3 text-sm outline-none focus:border-[var(--accent)]/60" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-dim)]">Framework</label>
              <select value={framework} onChange={(e) => setFramework(e.target.value)} className="w-full rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none">
                <option value="none">None</option>
                <option value="fastapi">FastAPI</option>
                <option value="express">Express</option>
                <option value="react">React</option>
              </select>
            </div>
          </div>
          <GlowButton icon={Zap} onClick={run} disabled={running} className="w-fit">{running ? 'Generating…' : 'Generate'}</GlowButton>
        </Glass3DFrame>

        <Glass3DFrame padded={false} className="overflow-hidden">
          {running && (
            <div className="p-5">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Generating Solution</div>
              <ThinkingPipeline currentIndex={stageIndex} />
            </div>
          )}
          {!running && result && (
            <>
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
                <span className="text-sm text-[var(--text-dim)]">Generated code · {result.language}</span>
                <div className="flex gap-1.5">
                  <GlowButton variant="ghost" icon={Copy}>Copy</GlowButton>
                  <GlowButton variant="ghost" icon={Download}>Download</GlowButton>
                  <GlowButton variant="ghost" icon={RefreshCw} onClick={run}>Regenerate</GlowButton>
                </div>
              </div>
              <Editor height="320px" language={result.language} value={result.code} theme="vs-dark"
                options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true, fontFamily: 'JetBrains Mono, monospace' }} />
              <p className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-faint)]">{result.notes}</p>
            </>
          )}
          {!running && !result && <p className="p-5 text-sm text-[var(--text-faint)]">Describe what you need, then Generate.</p>}
        </Glass3DFrame>
      </div>
    </div>
  )
}
