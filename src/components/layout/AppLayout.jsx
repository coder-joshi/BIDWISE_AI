import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell, Search, Moon, Sun } from 'lucide-react'
import AppSidebar from './AppSidebar'
import { useAuthStore } from '../../store/authStore'
import { OFFICER } from '../../data/dummyData'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const { user } = useAuthStore()
  const displayUser = user || OFFICER

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen bg-gem-navy flex">
      <AppSidebar collapsed={collapsed} />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? '4rem' : '16rem' }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 nav-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-gem-muted hover:text-gem-white hover:bg-white/8 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gem-muted" />
              <input
                type="text"
                placeholder="Search bids, tenders..."
                className="pl-9 pr-4 py-2 bg-white/6 border border-white/8 rounded-lg text-sm font-body text-gem-white placeholder-gem-muted focus:outline-none focus:ring-1 focus:ring-gem-blue w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gem-muted hover:text-gem-white hover:bg-white/8 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-gem-muted hover:text-gem-white hover:bg-white/8 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gem-red rounded-full" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-blue to-gem-green flex items-center justify-center text-xs font-bold font-display text-white">
                {displayUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gem-white leading-none">{displayUser?.name}</p>
                <p className="text-[10px] text-gem-muted leading-none mt-0.5 capitalize">
                  {(displayUser?.role || 'procurement_officer').replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
