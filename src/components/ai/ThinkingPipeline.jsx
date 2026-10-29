import { Check } from 'lucide-react'
import clsx from 'clsx'

export const PIPELINE_STAGES = [
  'Parsing AST',
  'Searching Project',
  'Retrieving Context',
  'Building Prompt',
  'AI Reasoning',
  'Generating Solution',
]

export default function ThinkingPipeline({ currentIndex }) {
  return (
    <div className="flex flex-col gap-0">
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const pending = i > currentIndex
        return (
          <div key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono transition-colors',
                  done && 'border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]',
                  active && 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] animate-pulse',
                  pending && 'border-[var(--border-bright)] text-[var(--text-faint)]'
                )}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className={clsx('w-px flex-1 my-1', done ? 'bg-[var(--success)]/40' : 'bg-[var(--border)]')} style={{ minHeight: 20 }} />
              )}
            </div>
            <div className={clsx('pb-5 text-sm', active ? 'text-[var(--text)] font-medium' : done ? 'text-[var(--text-dim)]' : 'text-[var(--text-faint)]')}>
              {stage}
            </div>
          </div>
        )
      })}
    </div>
  )
}
