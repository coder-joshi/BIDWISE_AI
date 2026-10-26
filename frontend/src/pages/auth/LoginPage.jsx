import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../store/languageStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { language, setLanguage, t } = useLanguage()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const adjustFontSize = (scale) => {
    document.documentElement.style.fontSize = `${scale}px`
  }

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

  // Demo login shortcut
  const demoLogin = (role) => {
    navigate('/role-select', { state: { demoRole: role } })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between selection:bg-[#003c8f] selection:text-white">
      {/* Topmost utility bar */}
      <div className="w-full bg-[#f1f1f1] border-b border-gray-300 px-4 py-1 text-xs text-gray-700 flex flex-wrap justify-between items-center gap-x-4 min-h-8">
        <div className="flex gap-4 items-center">
          <span className="font-bold">{t('gov_of_india', 'GOVERNMENT OF INDIA')}</span>
          <a href="#main-content" className="hover:underline text-[#003c8f]">
            {t('skip_to_main', 'Skip to main content')}
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 items-center border-r border-gray-400 pr-4">
            <button
              type="button"
              onClick={() => adjustFontSize(14)}
              className="px-1 hover:bg-gray-200"
              title={t('decrease_font', 'Decrease Text Size')}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => adjustFontSize(16)}
              className="px-1 hover:bg-gray-200"
              title={t('normal_font', 'Normal Text Size')}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => adjustFontSize(18)}
              className="px-1 hover:bg-gray-200"
              title={t('increase_font', 'Increase Text Size')}
            >
              A+
            </button>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border border-gray-300 rounded px-1.5 py-0.5 text-xs outline-none ml-2 cursor-pointer font-medium text-gray-800"
            aria-label="Language selection"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      <div id="main-content" className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#003c8f] p-6 text-center">
            <div className="w-12 h-12 rounded bg-white flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} className="text-[#003c8f]" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white">{t('gem_bidverify', 'GeM BidVerify')}</h2>
            <p className="text-[#e3f2fd] text-sm font-body mt-1">{t('authorized_login', 'Authorized Personnel Login')}</p>
          </div>

          <div className="p-8">
            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-[#f8d7da] border border-[#f5c6cb] mb-6">
                <AlertCircle size={16} className="text-[#721c24] flex-shrink-0" />
                <p className="text-sm text-[#721c24] font-bold m-0">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#212529] mb-1.5 font-body">{t('email_address', 'Email Address')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-[#6c757d]" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@railways.gov.in"
                    className="w-full pl-10 pr-4 py-2 border border-[#dee2e6] rounded bg-white text-[#212529] placeholder-[#6c757d] focus:outline-none focus:ring-2 focus:ring-[#003c8f] focus:border-transparent transition-colors font-body text-sm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#212529] mb-1.5 font-body">{t('password', 'Password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-[#6c757d]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 border border-[#dee2e6] rounded bg-white text-[#212529] placeholder-[#6c757d] focus:outline-none focus:ring-2 focus:ring-[#003c8f] focus:border-transparent transition-colors font-body text-sm"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6c757d] hover:text-[#003c8f] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-[#495057] font-body">
                  <input type="checkbox" className="rounded border-[#dee2e6] text-[#003c8f] focus:ring-[#003c8f]" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-[#003c8f] font-bold hover:underline font-body">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#138808] hover:bg-[#0f6b06] disabled:opacity-50 text-white font-bold py-2.5 rounded font-body transition-colors flex justify-center items-center gap-2 mt-2"
              >
                {loading ? t('signing_in', 'Signing in...') : t('sign_in', 'Sign In')} <ChevronRight size={18} />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#dee2e6]" />
              <span className="text-xs text-[#6c757d] font-body uppercase tracking-wider font-bold">{t('demo_access', 'Demo Access Shortcuts')}</span>
              <div className="flex-1 h-px bg-[#dee2e6]" />
            </div>

            {/* Demo shortcuts */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('procurement_officer')}
                className="p-3 text-left border border-[#dee2e6] rounded bg-[#f8f9fa] hover:border-[#003c8f] transition-colors group"
              >
                <div className="text-xs font-bold text-[#003c8f] font-body mb-0.5">{t('procurement_officer', 'Procurement Officer')}</div>
                <div className="text-[10px] text-[#6c757d] font-body">Arjun Sharma</div>
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className="p-3 text-left border border-[#dee2e6] rounded bg-[#f8f9fa] hover:border-[#003c8f] transition-colors group"
              >
                <div className="text-xs font-bold text-[#003c8f] font-body mb-0.5">{t('system_admin', 'Administrator')}</div>
                <div className="text-[10px] text-[#6c757d] font-body">Priya Nair</div>
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-[#6c757d] font-body mt-6">
          Government e-Marketplace · Ministry of Railways <br />
          <Link to="/" className="text-[#003c8f] font-bold hover:underline">{t('back_to_home', 'Return to Public Portal')}</Link>
        </p>
      </div>

      <footer className="w-full bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        {t('all_rights_reserved', '© 2026 Government of India. All rights reserved.')}
      </footer>
    </div>
  )
}
