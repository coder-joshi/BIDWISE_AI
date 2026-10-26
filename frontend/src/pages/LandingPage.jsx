import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Activity, FileCheck2, BarChart, ArrowRight, FileWarning, Globe
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { fetchBidsFromDb } from '../lib/api'
import { useLanguage } from '../store/languageStore'

export default function LandingPage() {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetchBidsFromDb()
      .then(({ bids: allBids }) => {
        setBids(allBids || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    const total = bids.length
    const verified = bids.filter((b) => b.status === 'verified').length
    const failed = bids.filter((b) => b.status === 'failed').length
    const totalAlerts = bids.reduce((acc, b) => acc + (b.fraudAlerts?.length || 0), 0)
    const avgCompliance =
      total > 0 ? Math.round(bids.reduce((acc, b) => acc + (b.complianceScore || 0), 0) / total) : 0
    return { total, verified, failed, totalAlerts, avgCompliance }
  }, [bids])

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#003c8f] selection:text-white flex flex-col font-body text-[#212529]">
      <Navbar />

      {/* Main Content with ID for skip-to-main link */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8 mt-24">
        {/* Top Banner */}
        <div className="bg-white border border-[#dee2e6] rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e3f2fd] text-[#003c8f] text-xs font-bold rounded mb-4 uppercase tracking-wider w-max">
              <Globe size={14} /> {t('landing_badge', 'Government e-Marketplace · Secure Officer Portal')}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#003c8f] mb-4 tracking-tight">
              {t('hero_title', 'AI-Powered Integrated Bid Compliance Verification Platform')}
            </h1>
            <p className="text-[#495057] text-base mb-6 leading-relaxed">
              {t('hero_subtitle', 'Welcome to the official Government e-Marketplace (GeM) BidVerify portal. This system automates the verification of government procurement bid documents, detects fraud, evaluates compliance, and generates audit-ready reports in a confidential, role-protected environment.')}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="bg-[#003c8f] hover:bg-[#002b66] text-white px-6 py-2.5 rounded font-bold transition-colors inline-flex items-center gap-2"
              >
                {t('officer_login', 'Procurement Officer Login')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Aggregate Anonymized Live System Metrics */}
          <div className="bg-[#f1f3f5] p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-[#dee2e6] flex flex-col justify-center gap-5">
            <div className="flex items-center justify-between border-b border-[#dee2e6] pb-2">
              <h3 className="font-display font-bold text-lg text-[#003c8f] m-0">
                {t('system_live_metrics', 'System Live Metrics')}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#138808] bg-[#d4edda] px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" /> {t('live_db', 'LIVE DB')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-white border border-[#dee2e6] flex items-center justify-center text-[#138808]">
                <FileCheck2 size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">
                  {loading ? '...' : metrics.total}{' '}
                  <span className="text-xs font-sans font-semibold text-[#138808]">
                    ({metrics.verified} {t('verified', 'Verified')} · {metrics.failed} {t('flagged', 'Flagged')})
                  </span>
                </div>
                <div className="text-xs text-[#6c757d] uppercase tracking-wider font-bold">
                  {t('total_bids_evaluated', 'Total Bids Evaluated')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-white border border-[#dee2e6] flex items-center justify-center text-[#ff9933]">
                <FileWarning size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{loading ? '...' : metrics.totalAlerts}</div>
                <div className="text-xs text-[#6c757d] uppercase tracking-wider font-bold">
                  {t('forensic_anomalies', 'Forensic Anomalies Detected')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-white border border-[#dee2e6] flex items-center justify-center text-[#003c8f]">
                <BarChart size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{loading ? '...' : `${metrics.avgCompliance}%`}</div>
                <div className="text-xs text-[#6c757d] uppercase tracking-wider font-bold">
                  {t('avg_compliance_rate', 'Avg. Tender Compliance Rate')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid / Guidelines Section */}
        <section id="guidelines" className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-28">
          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#e3f2fd] text-[#003c8f] flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">
              {t('feature_1_title', 'Live Verification')}
            </h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              {t('feature_1_desc', 'The AI engine cross-checks vendor documents directly with 7 government databases including GSTN, MCA21, and Udyam in real-time.')}
            </p>
          </div>

          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#fff3cd] text-[#ff9933] flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">
              {t('feature_2_title', 'Fraud Detection')}
            </h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              {t('feature_2_desc', 'Detects edited PDFs, fake digital signatures, metadata tampering, and non-procurement documents automatically.')}
            </p>
          </div>

          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded bg-[#e6f4ea] text-[#138808] flex items-center justify-center mb-4">
              <BarChart size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#212529]">
              {t('feature_3_title', 'Automated Audit')}
            </h3>
            <p className="text-sm text-[#495057] leading-relaxed">
              {t('feature_3_desc', 'Generates printable, immutable audit-ready reports instantly for procurement officers to review and approve.')}
            </p>
          </div>
        </section>
      </main>

      {/* Footer — Exclusive location for Privacy Policy & Terms */}
      <footer className="bg-white border-t border-[#dee2e6] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#003c8f]" />
            <span className="font-display font-bold text-[#003c8f] tracking-wide">
              {t('gem_bidverify', 'GeM BidVerify')}
            </span>
          </div>
          <div className="text-sm text-[#6c757d]">
            {t('sih_footer', 'SIH 2026 (SIH26100) · Designed for Government of India')}
          </div>
          <div className="flex gap-4 text-sm text-[#003c8f] font-bold">
            <Link to="/privacy-policy" className="hover:underline">
              {t('privacy_policy', 'Privacy Policy')}
            </Link>
            <Link to="/terms-of-use" className="hover:underline">
              {t('terms_of_use', 'Terms of Use')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
