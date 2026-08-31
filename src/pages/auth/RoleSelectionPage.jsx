import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Briefcase, Settings, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { OFFICER, ADMIN } from '../../data/dummyData'

const ROLES = [
  {
    id: 'procurement_officer',
    title: 'Procurement Officer',
    subtitle: 'Upload and verify bid documents',
    icon: Briefcase,
    color: 'from-gem-blue/20 to-gem-blue/5',
    borderHover: 'hover:border-gem-blue/50',
    iconColor: 'text-gem-blue-light',
    capabilities: [
      'Upload bid packages',
      'View AI verification results',
      'Review extracted documents',
      'Download audit reports',
      'Use AI Assistant',
    ],
    demoUser: OFFICER,
  },
  {
    id: 'admin',
    title: 'Platform Admin',
    subtitle: 'Manage system settings and users',
    icon: Settings,
    color: 'from-purple-500/20 to-purple-500/5',
    borderHover: 'hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    capabilities: [
      'All Officer capabilities',
      'Manage user accounts',
      'Configure tender templates',
      'Define compliance rules',
      'View system logs & APIs',
    ],
    demoUser: ADMIN,
  },
]

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuthStore()
  const [selected, setSelected] = useState(location.state?.demoRole || null)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)

    // In demo mode — set auth state from dummy data and proceed
    const roleData = ROLES.find(r => r.id === selected)
    useAuthStore.setState({
      user: roleData.demoUser,
      isAuthenticated: true,
      accessToken: 'demo-token',
    })

    setTimeout(() => {
      navigate('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gem-gradient flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gem-hero-gradient" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gem-blue flex items-center justify-center shadow-gem-glow">
              <Shield size={24} className="text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl text-gem-white mb-2">Select Your Role</h1>
          <p className="text-gem-muted font-body text-sm">
            Your role determines what you can access on GeM BidVerify.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                id={`role-card-${role.id}`}
                onClick={() => setSelected(role.id)}
                className={`glass-card p-6 text-left transition-all duration-200 ${role.borderHover} ${
                  isSelected
                    ? 'border-gem-blue/60 bg-gem-blue/10 shadow-gem-glow'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Icon size={22} className={role.iconColor} />
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={20} className="text-gem-blue-light" />
                  )}
                </div>

                <h3 className="font-display font-semibold text-gem-white text-lg mb-1">{role.title}</h3>
                <p className="text-gem-muted text-sm font-body mb-4">{role.subtitle}</p>

                <ul className="space-y-1.5">
                  {role.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-gem-muted font-body">
                      <ChevronRight size={10} className={`${role.iconColor} flex-shrink-0`} />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* Demo user tag */}
                <div className="mt-4 pt-4 border-t border-white/6 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gem-blue to-gem-green flex items-center justify-center text-[9px] font-bold text-white font-display">
                    {role.demoUser.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gem-white font-body">{role.demoUser.name}</p>
                    <p className="text-[10px] text-gem-muted font-body">{role.demoUser.id}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          loading={loading}
          iconRight={ChevronRight}
          onClick={handleContinue}
          id="btn-continue-role"
        >
          Continue to Dashboard
        </Button>

        <p className="text-center text-xs text-gem-muted font-body mt-4">
          Your role is set by your system administrator. Contact support to request a change.
        </p>
      </div>
    </div>
  )
}
