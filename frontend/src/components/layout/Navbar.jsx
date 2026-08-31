import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'

const NAV_LINKS = [
  { label: 'Features',   href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About',      href: '#about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-blur' : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gem-blue flex items-center justify-center shadow-gem-glow group-hover:shadow-gem-glow transition-shadow">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-gem-white text-base leading-none block">GeM BidVerify</span>
              <span className="font-mono text-[10px] text-gem-muted leading-none block">SIH26100</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-body text-gem-muted hover:text-gem-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm" iconRight={ChevronRight}>
                Start Verification
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gem-muted hover:text-gem-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden nav-blur border-t border-white/6">
          <div className="section-container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-body text-gem-muted hover:text-gem-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/6 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" fullWidth>Sign In</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" fullWidth>Start Verification</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
