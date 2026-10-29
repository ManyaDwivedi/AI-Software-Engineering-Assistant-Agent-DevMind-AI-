import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard, FolderKanban, Code2, Lightbulb, Bug, SearchCheck,
  Sparkles, FlaskConical, RefreshCw, FileText, BrainCircuit, Network,
  Dna, MessageSquare, History as HistoryIcon, Settings, HelpCircle,
  User, LogOut, ChevronsLeft, ChevronsRight, Cpu,
} from 'lucide-react'
import { useAuth } from '../../lib/auth.jsx'

const SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/workspace', label: 'Code Workspace', icon: Code2 },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { to: '/tools/explain', label: 'Explain Code', icon: Lightbulb },
      { to: '/tools/debug', label: 'Debug Code', icon: Bug },
      { to: '/tools/review', label: 'Code Review', icon: SearchCheck },
      { to: '/tools/generate', label: 'Generate Code', icon: Sparkles },
      { to: '/tools/tests', label: 'Generate Tests', icon: FlaskConical },
      { to: '/tools/refactor', label: 'Refactor', icon: RefreshCw },
      { to: '/tools/docs', label: 'Documentation', icon: FileText },
    ],
  },
  {
    label: 'Project Intelligence',
    items: [
      { to: '/intelligence/project-ai', label: 'Project AI', icon: BrainCircuit },
      { to: '/intelligence/galaxy', label: 'Project Galaxy', icon: Network },
      { to: '/intelligence/dna', label: 'Code DNA', icon: Dna },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/chat', label: 'AI Chat', icon: MessageSquare },
      { to: '/history', label: 'History', icon: HistoryIcon },
    ],
  },
]

const SYSTEM_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

function NavItem({ to, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'border border-[rgba(124,195,175,0.45)] bg-[var(--surface-strong)] text-[var(--text)] shadow-[0_10px_24px_rgba(6,17,22,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]'
            : 'border border-transparent text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              'absolute left-1 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-full transition-all duration-200',
              isActive ? 'bg-[var(--accent)] opacity-100' : 'opacity-0'
            )}
          />
          <Icon
            size={17}
            strokeWidth={1.8}
            className={clsx(
              'shrink-0 transition-all duration-200',
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text)] group-hover:translate-y-[-0.5px]'
            )}
          />
          {!collapsed && <span className="truncate">{label}</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg border border-[var(--sidebar-border)] bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--text)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={clsx(
        'glass-panel relative flex h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-[0_28px_60px_rgba(12,22,27,0.18),0_4px_18px_rgba(12,22,27,0.08)] backdrop-blur-xl transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[264px]'
      )}
    >
      {/* Brand */}
      <div className={clsx('flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.18)] px-4 py-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(124,195,175,0.28)] bg-[var(--surface-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <Cpu size={17} className="text-[var(--accent)]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.08em] text-[var(--text)]">
              AI SOFTWARE<br />ENGINEERING ASSISTANT
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-faint)]">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System */}
      <div className="border-t border-[rgba(255,255,255,0.18)] px-2.5 py-3">
        <div className="flex flex-col gap-0.5">
          {SYSTEM_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
          <button
            onClick={logout}
            className={clsx(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-dim)] transition-all duration-200 hover:text-[var(--error)] hover:bg-[var(--surface-muted)]'
            )}
          >
            <LogOut size={17} strokeWidth={1.8} className="shrink-0 text-[var(--text-faint)] transition-transform duration-200 group-hover:translate-y-[-0.5px] group-hover:text-[var(--text)]" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg border border-[var(--sidebar-border)] bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--text)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
                Logout
              </span>
            )}
          </button>
        </div>

        <div className={clsx('mt-3 flex items-center gap-2 border-t border-[rgba(255,255,255,0.18)] pt-3', collapsed && 'justify-center')}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(124,195,175,0.18)] text-xs font-medium text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            {(user?.name || 'D')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-[var(--text)]">{user?.name || 'Developer'}</div>
              <div className="truncate text-[10px] text-[var(--text-faint)]">{user?.email}</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-muted)]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
