import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Menu, X, ChevronRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Tenders',     href: '#' },
  { label: 'Guidelines', href: '#' },
  { label: 'About GeM',        href: '#' },
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
        scrolled ? 'bg-white shadow-sm border-b border-[#dee2e6]' : 'bg-[#f8f9fa]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded bg-[#003c8f] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-[#003c8f] text-base leading-none block">GeM BidVerify</span>
              <span className="font-mono text-[10px] text-[#6c757d] leading-none block mt-0.5">Government of India</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-bold font-body text-[#495057] hover:text-[#003c8f] transition-colors rounded hover:bg-[#e3f2fd]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="bg-[#003c8f] hover:bg-[#002b66] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors">
              Login <ChevronRight size={16} />
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
                className="px-4 py-3 text-sm font-bold font-body text-[#495057] hover:text-[#003c8f] hover:bg-[#e3f2fd] rounded transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[#dee2e6] mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="bg-[#003c8f] text-white px-4 py-3 rounded text-sm font-bold w-full flex justify-center items-center gap-2">
                Login <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
