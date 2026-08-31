import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, Clock, FileText, Globe, ShieldCheck, Brain, BarChart3, FileOutput } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { BIDDERS } from '../../data/dummyData'

const STEPS = [
  { id: 1, label: 'Reading Documents',        desc: 'Parsing PDF/DOCX structure and extracting text layers', icon: FileText,    duration: 1500 },
  { id: 2, label: 'OCR Processing',           desc: 'Optical character recognition on scanned certificates', icon: FileText,    duration: 2000 },
  { id: 3, label: 'Extracting Certificates',  desc: 'Identifying GST, PAN, Udyam, ISO, and other documents', icon: ShieldCheck, duration: 2000 },
  { id: 4, label: 'Government Verification',  desc: 'Cross-checking GSTN, MCA21, Udyam, EPFO, ESIC portals', icon: Globe,       duration: 3000 },
  { id: 5, label: 'AI Tender Analysis',       desc: 'Comparing extracted data against tender requirements',    icon: Brain,       duration: 2500 },
  { id: 6, label: 'Risk Calculation',         desc: 'Computing multi-factor risk score across 40+ signals',   icon: BarChart3,   duration: 2000 },
  { id: 7, label: 'Generating Report',        desc: 'Compiling audit-ready verification report',              icon: FileOutput,  duration: 1500 },
]

export default function AiProcessingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const bidder = BIDDERS.A

  useEffect(() => {
    let idx = 0
    const runStep = () => {
      if (idx >= STEPS.length) { setCompleted(true); return }
      setCurrentStep(idx)
      setTimeout(() => { idx++; runStep() }, STEPS[idx]?.duration || 1500)
    }
    const t = setTimeout(runStep, 300)
    return () => clearTimeout(t)
  }, [])

  const progress = completed ? 100 : Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="p-6 lg:p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">AI Processing</h1>
        <p className="text-gem-muted font-body text-sm mt-1">
          Verifying bid from <span className="text-gem-white font-semibold">{bidder.name}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-6 mb-5 beam-container">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gem-white font-body">
            {completed ? 'Verification Complete' : STEPS[currentStep]?.label}
          </span>
          <span className="font-mono text-sm text-gem-blue-light">{progress}%</span>
        </div>
        <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gem-blue to-gem-green rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!completed && (
          <p className="text-xs text-gem-muted font-body mt-2">{STEPS[currentStep]?.desc}</p>
        )}
      </div>

      {/* Steps */}
      <div className="glass-card divide-y divide-white/5">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isDone = completed || i < currentStep
          const isActive = !completed && i === currentStep
          const isPending = !completed && i > currentStep
          return (
            <div key={step.id} className={`flex items-center gap-4 px-5 py-4 transition-all ${isActive ? 'bg-gem-blue/8' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isDone ? 'bg-gem-green/15 border border-gem-green/25' :
                isActive ? 'bg-gem-blue/20 border border-gem-blue/30' :
                'bg-white/5 border border-white/8'
              }`}>
                {isDone
                  ? <CheckCircle2 size={16} className="text-gem-green-light" />
                  : isActive
                  ? <Loader2 size={16} className="text-gem-blue-light animate-spin" />
                  : <Clock size={14} className="text-gem-muted" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold font-body ${isDone ? 'text-gem-white' : isActive ? 'text-gem-blue-light' : 'text-gem-muted'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gem-muted font-body truncate">{step.desc}</p>
              </div>
              {isDone && <CheckCircle2 size={14} className="text-gem-green-light flex-shrink-0" />}
              {isActive && <div className="status-dot-blue flex-shrink-0 animate-pulse-dot" />}
            </div>
          )
        })}
      </div>

      {completed && (
        <div className="mt-5 flex flex-wrap gap-3 animate-slide-up">
          <Button variant="primary" size="md" onClick={() => navigate('/documents')} iconRight={CheckCircle2}>
            View Extracted Documents
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/audit-report')}>
            View Report
          </Button>
        </div>
      )}
    </div>
  )
}
