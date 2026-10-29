import clsx from 'clsx'

export default function GlowButton({ children, variant = 'primary', className, icon: Icon, ...rest }) {
  const base = 'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[#426957] active:scale-[0.98] shadow-sm hover:shadow-md',
    secondary: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border-bright)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]',
    ghost: 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
    danger: 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30 hover:bg-[var(--error)]/20',
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  )
}
