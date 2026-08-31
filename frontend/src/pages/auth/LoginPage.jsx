import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Shield, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/role-select')
    } catch (err) {
      setError(err?.response?.data?.msg || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login shortcut — no actual backend needed
  const demoLogin = (role) => {
    navigate('/role-select', { state: { demoRole: role } })
  }

  return (
    <div className="min-h-screen bg-gem-gradient flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden beam-container">
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute inset-0 bg-gem-hero-gradient" />
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-gem-blue/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 rounded-full bg-gem-green/8 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gem-blue flex items-center justify-center shadow-gem-glow">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-gem-white text-lg">GeM BidVerify</div>
              <div className="font-mono text-xs text-gem-muted">SIH26100</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="font-display font-bold text-4xl text-gem-white leading-tight mb-4">
            Secure. Automated.<br />
            <span className="text-gradient">Audit-Ready.</span>
          </h1>
          <p className="text-gem-muted font-body text-base leading-relaxed mb-8">
            AI-powered bid compliance verification for Government e-Marketplace procurement.
            Verify 7 government databases in under 90 seconds.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              '97.4% OCR accuracy on government documents',
              'Live GSTN, MCA21, Udyam & EPFO checks',
              'Fraud detection across 40+ signals',
              'Audit-ready PDF report in one click',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-sm font-body text-gem-muted">
                <div className="w-5 h-5 rounded-full bg-gem-green/15 border border-gem-green/25 flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={10} className="text-gem-green-light" />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gem-blue to-gem-green flex items-center justify-center text-xs font-bold text-white font-display">
            AS
          </div>
          <div>
            <p className="text-sm font-semibold text-gem-white font-body">Arjun Sharma</p>
            <p className="text-xs text-gem-muted font-body">Senior Procurement Officer · Ministry of Railways</p>
          </div>
          <span className="ml-auto badge-verified">
            <span className="status-dot-green" /> Active
          </span>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gem-blue flex items-center justify-center shadow-gem-glow">
              <Shield size={18} className="text-white" />
            </div>
            <div className="font-display font-bold text-gem-white">GeM BidVerify</div>
          </div>

          <h2 className="font-display font-bold text-3xl text-gem-white mb-1">Sign in</h2>
          <p className="text-gem-muted font-body text-sm mb-8">
            Access the GeM Bid Compliance Platform
          </p>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-gem-red/10 border border-gem-red/25 mb-5">
              <AlertCircle size={15} className="text-gem-red flex-shrink-0" />
              <p className="text-sm text-gem-red font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@railways.gov.in"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gem-muted hover:text-gem-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gem-border-dark bg-gem-slate" />
                <span className="text-gem-muted font-body">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-gem-blue-light hover:text-gem-blue font-body transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} iconRight={ChevronRight}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-gem-muted font-body">or continue as demo</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Demo shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => demoLogin('procurement_officer')}
              className="glass-card p-3 text-left hover:border-gem-blue/40 transition-all group"
            >
              <div className="text-xs font-semibold text-gem-white font-body mb-0.5 group-hover:text-gem-blue-light">Procurement Officer</div>
              <div className="text-[10px] text-gem-muted font-body">Arjun Sharma · PO-2026-0041</div>
            </button>
            <button
              onClick={() => demoLogin('admin')}
              className="glass-card p-3 text-left hover:border-gem-blue/40 transition-all group"
            >
              <div className="text-xs font-semibold text-gem-white font-body mb-0.5 group-hover:text-gem-blue-light">Admin</div>
              <div className="text-[10px] text-gem-muted font-body">Priya Nair · ADM-2026-0003</div>
            </button>
          </div>

          <p className="text-center text-xs text-gem-muted font-body mt-6">
            Ministry of Railways · Government of India · Secured by GeM
          </p>
        </div>
      </div>
    </div>
  )
}
