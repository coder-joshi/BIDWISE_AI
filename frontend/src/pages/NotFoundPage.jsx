import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home, ShieldCheck } from 'lucide-react'
import emblemSvg from '../assets/Emblem_of_India.svg'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-body text-[#212529]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={emblemSvg}
              alt="State Emblem of India"
              className="h-10 w-auto object-contain"
              width={29}
              height={40}
            />
            <div>
              <span className="font-display font-bold text-[#003c8f] text-base leading-none block">
                GeM BidVerify
              </span>
              <span className="font-mono text-[10px] text-[#6c757d] leading-none block mt-0.5">
                Government e-Marketplace · Government of India
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6c757d]">
            <ShieldCheck size={16} className="text-[#003c8f]" /> Official Procurement Portal
          </div>
        </div>
      </header>

      {/* Main 404 Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white border border-[#dee2e6] rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fee2e2] text-[#dc2626] mx-auto flex items-center justify-center mb-5">
            <FileQuestion size={32} />
          </div>

          <div className="inline-block px-3 py-1 rounded bg-[#f1f3f5] text-[#495057] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            HTTP 404 — Not Found
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#003c8f] mb-3">
            Document or Page Not Found
          </h1>

          <p className="text-sm text-[#495057] leading-relaxed mb-6">
            The tender, bid verification record, or resource you requested cannot be located.
            It may have been archived, moved, or the URL might contain a typographical error.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#003c8f] hover:bg-[#002b66] text-white px-5 py-2.5 rounded font-bold text-sm transition-colors"
            >
              <Home size={16} /> Return to Public Portal
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f1f3f5] hover:bg-[#e9ecef] text-[#212529] px-5 py-2.5 rounded font-bold text-sm transition-colors border border-[#dee2e6]"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div className="mt-8 pt-4 border-t border-[#dee2e6] text-xs text-[#6c757d]">
            Need assistance? Contact GeM Helpdesk: <span className="font-mono font-bold">1800-419-3436</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#dee2e6] py-4 text-center text-xs text-[#6c757d]">
        SIH 2026 (SIH26100) · GeM BidVerify Platform · Government of India
      </footer>
    </div>
  )
}
