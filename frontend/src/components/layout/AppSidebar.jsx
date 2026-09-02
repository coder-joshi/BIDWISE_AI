import { NavLink, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Upload, Cpu, FileSearch, CheckSquare,
  AlertTriangle, TrendingUp, BarChart2, FileText, History,
  Settings, MessageSquare, ChevronRight, LogOut, Menu
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/upload',        icon: Upload,           label: 'Upload Bid' },
    ],
  },
  {
    label: 'Verification',
    items: [
      { to: '/processing',    icon: Cpu,              label: 'AI Processing' },
      { to: '/documents',     icon: FileSearch,       label: 'Documents' },
      { to: '/gov-verify',    icon: Shield,           label: 'Gov Verification' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { to: '/compliance',    icon: CheckSquare,      label: 'Compliance' },
      { to: '/fraud',         icon: AlertTriangle,    label: 'Fraud Detection' },
      { to: '/risk',          icon: TrendingUp,       label: 'Risk Analysis' },
      { to: '/compare',       icon: BarChart2,        label: 'Bid Comparison' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/pdf-review',    icon: FileText,         label: 'PDF Review' },
      { to: '/audit-report',  icon: FileText,         label: 'Audit Report' },
      { to: '/history',       icon: History,          label: 'History' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/ai-assistant',  icon: MessageSquare,    label: 'AI Assistant' },
      { to: '/admin',         icon: Settings,         label: 'Admin Panel' },
    ],
  },
]

export default function AppSidebar({ collapsed = false, setCollapsed }) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const displayUser = user || { name: 'Officer', role: 'procurement_officer' }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-white dark:bg-black border-r border-gray-200 dark:border-white/10',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-white dark:text-black" />
            </div>
            <div>
              <div className="font-display font-medium text-gray-900 dark:text-white text-sm leading-none">GeM BidVerify</div>
              <div className="font-mono text-[10px] text-gray-500 dark:text-white/40 leading-none mt-1">SIH26100</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-white/30 font-body">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx('sidebar-item', isActive && 'active')
                    }
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-white/10 p-3">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-xs font-bold font-display text-white dark:text-black flex-shrink-0">
            {displayUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{displayUser?.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-white/40 truncate capitalize mt-0.5">
                {(displayUser?.role || 'procurement_officer').replace('_', ' ')}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-gray-500 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
