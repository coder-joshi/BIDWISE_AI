import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Menu, X, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../store/languageStore'

const NAV_LINKS = [
  { key: 'guidelines', label: 'Guidelines', href: '/#guidelines', external: false },
  { key: 'about_gem', label: 'About GeM', href: 'https://gem.gov.in/aboutus', external: true },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const adjustFontSize = (scale) => {
    document.documentElement.style.fontSize = `${scale}px`
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-[#dee2e6]' : 'bg-[#f8f9fa]'
      }`}
    >
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

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded bg-[#003c8f] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-[#003c8f] text-base leading-none block">GeM BidVerify</span>
              <span className="font-mono text-[10px] text-[#6c757d] leading-none block mt-0.5">{t('gov_of_india', 'Government of India')}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="px-4 py-2 text-sm font-bold font-body text-[#495057] hover:text-[#003c8f] transition-colors rounded hover:bg-[#e3f2fd]"
              >
                {t(link.key, link.label)}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="bg-[#003c8f] hover:bg-[#002b66] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors">
              {t('login', 'Login')} <ChevronRight size={16} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-[#495057] hover:text-[#003c8f] hover:bg-[#e3f2fd]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#dee2e6] shadow-md">
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="px-4 py-3 text-sm font-bold font-body text-[#495057] hover:text-[#003c8f] hover:bg-[#e3f2fd] rounded transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key, link.label)}
              </a>
            ))}
            <div className="pt-3 border-t border-[#dee2e6] mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="bg-[#003c8f] text-white px-4 py-3 rounded text-sm font-bold w-full flex justify-center items-center gap-2">
                {t('login', 'Login')} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
