import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Briefcase, Settings, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const OFFICER = {
  id: 'PO-2026-0041',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@railways.gov.in',
  role: 'procurement_officer',
  department: 'Ministry of Railways',
  designation: 'Senior Procurement Officer',
  division: 'Central Railway — Electrical Division',
  avatar: 'AS',
}

const ADMIN = {
  id: 'ADM-2026-0003',
  name: 'Priya Nair',
  email: 'priya.nair@gem.gov.in',
  role: 'admin',
  department: 'GeM Platform Administration',
  designation: 'Platform Administrator',
  avatar: 'PN',
}

const ROLES = [
  {
    id: 'procurement_officer',
    title: 'Procurement Officer',
    subtitle: 'Upload and verify bid documents',
    icon: Briefcase,
    color: 'bg-[#e3f2fd]',
    iconColor: 'text-[#003c8f]',
    capabilities: [
      'Upload bid packages',
      'View AI verification results',
      'Review extracted documents',
      'Download audit reports',
    ],
    demoUser: OFFICER,
  },
  {
    id: 'admin',
    title: 'Platform Administrator',
    subtitle: 'Manage system settings and users',
    icon: Settings,
    color: 'bg-[#f8f9fa]',
    iconColor: 'text-[#212529]',
    capabilities: [
      'All Officer capabilities',
      'Manage user accounts',
      'Configure tender templates',
      'View system logs & APIs',
    ],
    demoUser: ADMIN,
  },
]

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
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
      if (selected === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 selection:bg-[#003c8f] selection:text-white">
      <div className="w-full max-w-2xl bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden p-8">
        
        {/* Header */}
        <div className="text-center mb-10 pb-6 border-b border-[#dee2e6]">
          <div className="w-12 h-12 rounded bg-[#003c8f] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-[#003c8f] mb-2">Select Account Role</h1>
          <p className="text-[#6c757d] font-body text-sm">
            Choose your designated role to access the GeM BidVerify portal.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                id={`role-card-${role.id}`}
                onClick={() => setSelected(role.id)}
                className={`p-6 text-left border rounded-lg transition-colors ${
                  isSelected
                    ? 'border-[#003c8f] bg-[#e3f2fd] ring-1 ring-[#003c8f]'
                    : 'border-[#dee2e6] bg-white hover:border-[#003c8f]'
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded flex items-center justify-center border border-[#dee2e6] ${role.color}`}>
                    <Icon size={22} className={role.iconColor} />
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={24} className="text-[#003c8f]" />
                  )}
                </div>

                <h3 className={`font-display font-bold text-lg mb-1 ${isSelected ? 'text-[#003c8f]' : 'text-[#212529]'}`}>{role.title}</h3>
                <p className="text-[#6c757d] text-sm font-body mb-4">{role.subtitle}</p>

                <ul className="space-y-2 mb-6">
                  {role.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-[#495057] font-body font-semibold">
                      <ChevronRight size={12} className={`${role.iconColor} flex-shrink-0`} />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* Demo user tag */}
                <div className="pt-4 border-t border-[#dee2e6] flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white font-display ${isSelected ? 'bg-[#003c8f]' : 'bg-[#6c757d]'}`}>
                    {role.demoUser.avatar}
                  </div>
                  <div>
                    <p className={`text-xs font-bold font-body ${isSelected ? 'text-[#003c8f]' : 'text-[#212529]'}`}>{role.demoUser.name}</p>
                    <p className="text-[10px] text-[#6c757d] font-body">{role.demoUser.id}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-[#138808] hover:bg-[#0f6b06] disabled:opacity-50 text-white font-bold py-3 rounded font-body transition-colors flex justify-center items-center gap-2"
        >
          {loading ? 'Entering Portal...' : 'Continue to Dashboard'} <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-[#6c757d] font-body mt-6">
          Your role capabilities are restricted by system administrators. Contact IT support for changes.
        </p>
      </div>
    </div>
  )
}
