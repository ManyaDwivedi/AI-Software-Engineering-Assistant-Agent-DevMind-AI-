import clsx from 'clsx'

const tones = {
  success: 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30',
  warning: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30',
  error: 'text-[var(--error)] bg-[var(--error)]/10 border-[var(--error)]/30',
  accent: 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/30',
  neutral: 'text-[var(--text-dim)] bg-[var(--surface-3)] border-[var(--border-bright)]',
  violet: 'text-[var(--violet)] bg-[var(--violet)]/10 border-[var(--violet)]/30',
}

export default function StatusBadge({ tone = 'neutral', children, dot = true, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium font-mono', tones[tone], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', {
        'bg-[var(--success)]': tone === 'success',
        'bg-[var(--warning)]': tone === 'warning',
        'bg-[var(--error)]': tone === 'error',
        'bg-[var(--accent)]': tone === 'accent',
        'bg-[var(--text-dim)]': tone === 'neutral',
        'bg-[var(--violet)]': tone === 'violet',
      })} />}
      {children}
    </span>
  )
}
