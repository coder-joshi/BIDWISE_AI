import { Link } from 'react-router-dom'

import {
  ShieldCheck, Zap, Search, FileText, AlertTriangle, BarChart3,
  ChevronRight, ArrowRight, CheckCircle2, Globe, Lock, Cpu,
  Building2, Award, Users, TrendingUp, Star
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'

// ── Feature cards data ────────────────────────────────────────
const FEATURES = [
  {
    icon: Cpu,
    color: 'from-gem-blue/20 to-gem-blue/5',
    iconColor: 'text-gem-blue-light',
    title: 'AI Document Extraction',
    desc: 'Automatically reads GST, PAN, Udyam, ISO, and experience certificates from PDF/DOCX with 97%+ OCR accuracy.'
  },
  {
    icon: Globe,
    color: 'from-gem-green/20 to-gem-green/5',
    iconColor: 'text-gem-green-light',
    title: 'Live Government Verification',
    desc: 'Cross-checks every extracted value against GSTN, MCA21, Udyam, EPFO, ESIC, and DigiLocker APIs in real time.'
  },
  {
    icon: AlertTriangle,
    color: 'from-gem-amber/20 to-gem-amber/5',
    iconColor: 'text-gem-amber',
    title: 'Fraud Detection Engine',
    desc: 'Detects edited PDFs, fake signatures, font manipulation, metadata changes, and duplicate certificates.'
  },
  {
    icon: BarChart3,
    color: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
    title: 'Risk Scoring (0–100)',
    desc: 'Multi-factor risk model combining compliance gaps, fraud signals, and database mismatches into a single auditable score.'
  },
  {
    icon: ShieldCheck,
    color: 'from-gem-green/20 to-gem-green/5',
    iconColor: 'text-gem-green-light',
    title: 'Tender Compliance Matrix',
    desc: 'Compares each bidder document to tender requirements with AI-generated pass/fail explanations.'
  },
  {
    icon: FileText,
    color: 'from-gem-blue/20 to-gem-blue/5',
    iconColor: 'text-gem-blue-light',
    title: 'Audit-Ready Reports',
    desc: 'One-click PDF report generation with company details, verification summary, compliance matrix, and officer sign-off.'
  },
]

// ── How it works steps ────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Upload Bid Documents',
    desc: 'Drag and drop the bidder\'s PDF/DOCX package. The platform immediately queues it for AI processing.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'AI Extraction & OCR',
    desc: 'Eight document types extracted simultaneously — certificates, registrations, financials — with structured data output.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Government Database Checks',
    desc: 'Real-time API calls to 7 government portals validate every extracted number against official registries.',
    icon: Globe,
  },
  {
    step: '04',
    title: 'Risk & Fraud Analysis',
    desc: 'ML model evaluates 40+ signals to detect document tampering, inconsistencies, and compliance failures.',
    icon: Search,
  },
  {
    step: '05',
    title: 'Score & Report',
    desc: 'A comprehensive audit report with risk score, compliance matrix, and final recommendation is ready in seconds.',
    icon: ShieldCheck,
  },
]

// ── Stat tiles ────────────────────────────────────────────────
const STATS = [
  { value: '97.4%', label: 'OCR Accuracy' },
  { value: '<90s', label: 'Avg Verification Time' },
  { value: '7', label: 'Gov. Databases Checked' },
  { value: '40+', label: 'Fraud Signals Detected' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gem-navy overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 bg-gem-gradient overflow-hidden beam-container">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-100" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gem-hero-gradient" />

        {/* Floating orbs */}
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-gem-blue/8 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-16 left-12 w-56 h-56 rounded-full bg-gem-green/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gem-blue/15 border border-gem-blue/30 mb-8">
              <span className="status-dot-green animate-pulse-dot" />
              <span className="text-xs font-semibold text-gem-blue-light font-body tracking-wide uppercase">
                Smart India Hackathon 2026 · SIH26100
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-gem-white leading-[1.08] tracking-tight mb-6">
              Bid Verification,{' '}
              <span className="relative">
                <span className="text-gradient">Automated.</span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gem-muted font-body leading-relaxed max-w-2xl mx-auto mb-10">
              An AI-powered platform that verifies government procurement bids against 7 live databases,
              detects fraud, scores risk from 0–100, and generates audit reports — in under 90 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/login">
                <Button variant="primary" size="xl" iconRight={ArrowRight}>
                  Start Verification
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="xl">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="glass-card px-4 py-4">
                  <div className="font-display font-bold text-2xl text-gem-white">{stat.value}</div>
                  <div className="text-xs text-gem-muted font-body mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gem-navy to-transparent" />
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gem-navy">
        <div className="section-container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gem-blue-light uppercase tracking-widest font-body mb-3">Platform Capabilities</p>
            <h2 className="font-display font-bold text-4xl text-gem-white">
              Everything procurement needs
            </h2>
            <p className="mt-4 text-gem-muted font-body text-lg max-w-xl mx-auto">
              From document upload to final recommendation — a complete verification workflow built for GeM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="glass-card-hover p-6 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={22} className={f.iconColor} />
                  </div>
                  <h3 className="font-display font-semibold text-gem-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gem-muted font-body text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-gem-navy-light">
        <div className="section-container">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gem-green-light uppercase tracking-widest font-body mb-3">Verification Pipeline</p>
            <h2 className="font-display font-bold text-4xl text-gem-white">
              From upload to report in 5 steps
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gem-blue/40 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-5 rounded-xl hover:bg-white/4 transition-colors group"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="relative mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-gem-blue/15 border border-gem-blue/25 flex items-center justify-center group-hover:bg-gem-blue/25 group-hover:border-gem-blue/40 transition-all duration-300">
                        <Icon size={22} className="text-gem-blue-light" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gem-blue text-white text-[10px] font-bold font-display flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-gem-white text-sm mb-2">{step.title}</h3>
                    <p className="text-gem-muted font-body text-xs leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/login">
              <Button variant="primary" size="lg" iconRight={ChevronRight}>
                Try the Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── About Platform ───────────────────────────────── */}
      <section id="about" className="py-24 bg-gem-navy">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-gem-blue-light uppercase tracking-widest font-body mb-4">About the Platform</p>
              <h2 className="font-display font-bold text-4xl text-gem-white mb-6">
                Built for India's{' '}
                <span className="text-gradient">procurement officers</span>
              </h2>
              <p className="text-gem-muted font-body text-base leading-relaxed mb-6">
                Manual bid verification is time-consuming, error-prone, and vulnerable to fraud.
                GeM BidVerify was built to solve this — giving procurement officers an AI co-pilot
                that verifies every document automatically, so they can focus on judgment, not paperwork.
              </p>
              <p className="text-gem-muted font-body text-base leading-relaxed mb-8">
                Developed as part of Smart India Hackathon 2026, SIH26100, under the Ministry of Commerce
                and Industry's GeM initiative to digitize and secure government procurement.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: 'Ministry of Railways' },
                  { icon: Award, label: 'SIH 2026 · Problem SIH26100' },
                  { icon: Users, label: 'For Procurement Officers' },
                  { icon: Lock, label: 'Government-Grade Security' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-gem-muted font-body">
                    <CheckCircle2 size={14} className="text-gem-green-light flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card cluster */}
            <div className="relative">
              <div className="glass-card p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gem-muted font-body">Bid Verification</p>
                    <p className="font-display font-bold text-gem-white text-lg">BID-2026-0841</p>
                  </div>
                  <span className="badge-verified">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'GST Verification', val: 'GSTN Matched', ok: true },
                    { label: 'Compliance Score', val: '94 / 100', ok: true },
                    { label: 'Risk Score', val: '23 (Low)', ok: true },
                    { label: 'Fraud Signals', val: '0 Detected', ok: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-gem-muted font-body">{row.label}</span>
                      <span className={`font-semibold font-body ${row.ok ? 'text-gem-green-light' : 'text-gem-red'}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gem-green/15 border border-gem-green/25 flex items-center justify-center">
                  <TrendingUp size={16} className="text-gem-green-light" />
                </div>
                <div>
                  <p className="text-xs text-gem-muted font-body">Time saved this month</p>
                  <p className="font-display font-bold text-gem-white">≈ 340 officer-hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="py-20 bg-gem-navy-light">
        <div className="section-container text-center">
          <div className="max-w-2xl mx-auto glass-card beam-container p-12">
            <h2 className="font-display font-bold text-3xl text-gem-white mb-4">
              Ready to verify your first bid?
            </h2>
            <p className="text-gem-muted font-body mb-8">
              Sign in as a Procurement Officer or Admin to access the full platform.
            </p>
            <Link to="/login">
              <Button variant="primary" size="xl" iconRight={ArrowRight}>
                Start Verification
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-8 border-t border-white/6 bg-gem-navy">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-gem-blue-light" />
            <span className="font-body text-sm text-gem-muted">
              GeM BidVerify · SIH26100 · Smart India Hackathon 2026
            </span>
          </div>
          <span className="font-body text-xs text-gem-muted/60">
            Built for Government of India — Ministry of Commerce & Industry
          </span>
        </div>
      </footer>
    </div>
  )
}
