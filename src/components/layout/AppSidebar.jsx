import { NavLink, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Upload, Cpu, FileSearch, CheckSquare,
  AlertTriangle, TrendingUp, BarChart2, FileText, History,
  Settings, MessageSquare, ChevronRight, LogOut, User
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { OFFICER } from '../../data/dummyData'

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

export default function AppSidebar({ collapsed = false }) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const displayUser = user || OFFICER

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-gem-navy border-r border-white/6',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/6 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gem-blue flex items-center justify-center flex-shrink-0 shadow-gem-glow">
          <Shield size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display font-bold text-gem-white text-sm leading-none">GeM BidVerify</div>
            <div className="font-mono text-[10px] text-gem-muted leading-none mt-0.5">SIH26100</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gem-muted/60 font-body">
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
                    {!collapsed && (
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-white/6 p-3">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-blue to-gem-green flex items-center justify-center text-xs font-bold font-display text-white flex-shrink-0">
            {displayUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gem-white truncate">{displayUser?.name}</p>
              <p className="text-[10px] text-gem-muted truncate capitalize">
                {(displayUser?.role || 'procurement_officer').replace('_', ' ')}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-gem-muted hover:text-gem-red hover:bg-gem-red/10 transition-colors"
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
