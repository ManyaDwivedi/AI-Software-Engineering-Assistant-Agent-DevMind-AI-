import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, FileText } from 'lucide-react'
import Glass3DFrame from '../components/ui/Glass3DFrame.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { chatWithAI, getProjects } from '../lib/api.js'
import clsx from 'clsx'

export default function Chat() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const project = projects.find((item) => item.id === projectId)

  useEffect(() => {
    getProjects()
      .then((items) => {
        setProjects(items)
        const first = items[0]
        if (first) {
          setProjectId(first.id)
          setMessages([{ role: 'assistant', text: `Project AI is active for ${first.name}. Ask me anything about its indexed files.`, sources: [] }])
        } else {
          setMessages([{ role: 'assistant', text: 'Import a project to ask questions about your codebase.', sources: [] }])
        }
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  async function send() {
    if (!input.trim() || sending) return
    const text = input.trim()
    setMessages((current) => [...current, { role: 'user', text }])
    setInput('')
    setSending(true)
    setError('')
    try {
      const response = await chatWithAI(text, projectId || null)
      setMessages((current) => [...current, { role: 'assistant', text: response.reply, sources: response.sources }])
    } catch (caught) {
      setError(caught.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="text-[var(--accent)]" size={20} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">AI Chat</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 0 && (
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3 py-2 text-sm">
              {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}
          {project && <StatusBadge tone="success">{project.files} files indexed</StatusBadge>}
          <StatusBadge tone="accent">Project AI enabled</StatusBadge>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">{error}</p>}

      <Glass3DFrame className="flex flex-1 flex-col overflow-hidden" padded={false}>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading && <p className="text-xs text-[var(--text-faint)]">Loading your projects…</p>}
          {messages.map((message, index) => (
            <div key={index} className={clsx('flex flex-col gap-1.5', message.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={clsx('max-w-[75%] whitespace-pre-wrap rounded-md px-4 py-2.5 text-sm',
                message.role === 'user' ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--text)]' : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]')}>
                {message.text}
              </div>
              {message.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Project context used</span>
                  {message.sources.map((source) => (
                    <span key={source} className="flex items-center gap-1 rounded border border-[var(--border-bright)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]">
                      <FileText size={10} /> {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {sending && <div className="text-xs text-[var(--text-faint)] animate-pulse">Searching indexed source files…</div>}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-[var(--border)] p-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && send()}
            placeholder={project ? `Ask about ${project.name}…` : 'Ask about your workspace…'}
            className="flex-1 rounded-md border border-[var(--border-bright)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
          />
          <button onClick={send} disabled={sending || !input.trim()} className="flex items-center justify-center rounded-md bg-[var(--accent)] px-4 text-white shadow-sm transition-colors hover:bg-[#426957] disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </Glass3DFrame>
    </div>
  )
}
