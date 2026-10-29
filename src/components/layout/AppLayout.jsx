import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const syncCollapsed = (event) => setCollapsed(event.matches)
    media.addEventListener('change', syncCollapsed)
    return () => media.removeEventListener('change', syncCollapsed)
  }, [])

  return (
    <div className="page-shell flex h-screen w-full overflow-hidden bg-grid">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
