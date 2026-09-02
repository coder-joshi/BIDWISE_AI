import { Link } from 'react-router-dom'
import {
  ShieldCheck, FileText, Search, Activity, Users, FileCheck2, BarChart, ExternalLink, ArrowRight, BookOpen, FileWarning, Globe, Building2
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#003c8f] selection:text-white flex flex-col font-body text-[#212529]">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8 mt-16">
        
        {/* Top Banner */}
        <div className="bg-white border border-[#dee2e6] rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e3f2fd] text-[#003c8f] text-xs font-bold rounded mb-4 uppercase tracking-wider w-max">
              <Globe size={14} /> Ministry of Railways
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#003c8f] mb-4 tracking-tight">
              AI-Powered Integrated Bid Compliance Verification Platform
            </h1>
            <p className="text-[#495057] text-base mb-6 leading-relaxed">
              Welcome to the official Government e-Marketplace (GeM) BidVerify portal. 
              This system automates the verification of government procurement bid documents, 
              detects fraud, evaluates compliance, and generates audit-ready reports.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="bg-[#003c8f] hover:bg-[#002b66] text-white px-6 py-2.5 rounded font-bold transition-colors inline-flex items-center gap-2">
                Procurement Officer Login <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          
          {/* Stats Box */}
          <div className="bg-[#f1f3f5] p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-[#dee2e6] flex flex-col justify-center gap-6">
            <h3 className="font-display font-bold text-lg text-[#003c8f] border-b border-[#dee2e6] pb-2">
              System Live Metrics
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-white border border-[#dee2e6] flex items-center justify-center text-[#138808]">
                <FileCheck2 size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">1,492</div>
                <div className="text-xs text-[#6c757d] uppercase tracking-wider font-bold">Bids Verified Today</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-white border border-[#dee2e6] flex items-center justify-center text-[#ff9933]">
                <FileWarning size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">47</div>
                <div className="text-xs text-[#6c757d] uppercase tracking-wider font-bold">Anomalies Detected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#e3f2fd] text-[#003c8f] flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">Live Verification</h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              The AI engine cross-checks vendor documents directly with 7 government databases including GSTN, MCA21, and Udyam in real-time.
            </p>
          </div>

          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#fff3cd] text-[#ff9933] flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">Fraud Detection</h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              Detects edited PDFs, fake digital signatures, metadata tampering, and forged document structures with 97%+ accuracy.
            </p>
          </div>

          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#e6f4ea] text-[#138808] flex items-center justify-center mb-4">
              <BarChart size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">Automated Audit</h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              Generates printable, immutable audit-ready reports instantly for procurement officers to review and approve.
            </p>
          </div>
        </div>

        {/* Public Tenders (Mock) */}
        <div className="bg-white border border-[#dee2e6] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#003c8f] text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <FileText size={20} /> Active Public Tenders
            </h3>
            <button className="text-sm font-bold text-[#e3f2fd] hover:text-white flex items-center gap-1 transition-colors">
              View All <ExternalLink size={14} />
            </button>
          </div>
          <div className="divide-y divide-[#dee2e6]">
            {[
              { id: 'GeM/2026/TENDER/005821', title: 'Supply and Installation of Solar Panels (500KW) for Central Secretariat', due: 'Oct 15, 2026', org: 'Ministry of Railways' },
              { id: 'GeM/2026/TENDER/006192', title: 'Procurement of High-Speed Servers for Data Center Expansion', due: 'Oct 22, 2026', org: 'MeitY' },
              { id: 'GeM/2026/TENDER/007304', title: 'Annual Maintenance Contract for CCTV Surveillance Systems', due: 'Nov 01, 2026', org: 'Home Ministry' },
            ].map((tender, i) => (
              <div key={i} className="p-4 sm:px-6 hover:bg-[#f8f9fa] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#003c8f] font-mono mb-1">{tender.id}</div>
                  <div className="font-bold text-[#212529] mb-1">{tender.title}</div>
                  <div className="text-xs text-[#6c757d] flex items-center gap-2">
                    <Building2 size={12} /> {tender.org}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right sm:text-right text-left mt-2 sm:mt-0">
                  <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1">Closing Date</div>
                  <div className="text-sm font-bold text-[#dc3545]">{tender.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#dee2e6] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#003c8f]" />
            <span className="font-display font-bold text-[#003c8f] tracking-wide">
              GeM BidVerify
            </span>
          </div>
          <div className="text-sm text-[#6c757d]">
            SIH 2026 (SIH26100) · Designed for Government of India
          </div>
          <div className="flex gap-4 text-sm text-[#003c8f] font-bold">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
