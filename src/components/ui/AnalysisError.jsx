export default function AnalysisError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">
      {message}
    </p>
  )
}
