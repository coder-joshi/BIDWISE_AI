import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, Loader2, Clock, FileText, Globe, ShieldCheck, Brain, BarChart3, FileOutput } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const STEPS = [
  { id: 'extract', label: 'Document Extraction', desc: 'Running OCR on uploaded PDFs to extract text and tables', icon: FileText, duration: 2500 },
  { id: 'verify', label: 'Government API Verification', desc: 'Cross-checking GST, PAN, and MCA databases', icon: Globe, duration: 3000 },
  { id: 'compliance', label: 'Tender Compliance Check', desc: 'Evaluating extracted data against GeM tender requirements', icon: ShieldCheck, duration: 2000 },
  { id: 'fraud', label: 'Fraud Detection Models', desc: 'Analyzing metadata, signatures, and anomaly detection', icon: Brain, duration: 3500 },
  { id: 'risk', label: 'Risk Scoring', desc: 'Calculating unified risk profile and compliance score', icon: BarChart3, duration: 1500 },
  { id: 'report', label: 'Generating Audit Report', desc: 'Compiling final tamper-proof verification report', icon: FileOutput, duration: 2000 },
]

export default function AiProcessingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { processingState, setProcessingState } = useUIStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Use the uploaded file name if available, else fallback
  const uploadedFiles = location.state?.uploadedFiles || []
  const bidderName = uploadedFiles.length > 0 ? uploadedFiles[0].replace('.pdf', '').replace('.docx', '') : 'Unknown Bidder'
  
  const hasInvalidFormat = uploadedFiles.some(f => f.toLowerCase().endsWith('.ppt') || f.toLowerCase().endsWith('.pptx'))

  useEffect(() => {
    let idx = 0
    let timeoutId
    let redirectId
    setCompleted(false)
    setFailed(false)
    setCurrentStep(0)

    const runStep = () => {
      if (idx === 2 && hasInvalidFormat) {
        setFailed(true)
        const errMsg = `Verification failed: Expected PDF/DOCX containing valid certificates. Received unsupported format (.ppt).`
        setErrorMsg(errMsg)
        setProcessingState('failed', errMsg)
        return
      }

      if (idx >= STEPS.length) {
        setCompleted(true)
        setProcessingState('completed')

        // Auto-navigate to history on completion after a brief pause
        redirectId = setTimeout(() => {
          navigate('/history')
        }, 1200)

        return
      }

      setCurrentStep(idx)
      timeoutId = setTimeout(() => { idx++; runStep() }, STEPS[idx]?.duration || 1500)
    }

    setProcessingState('processing')
    timeoutId = setTimeout(runStep, 300)
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(redirectId)
    }
  }, [hasInvalidFormat, setProcessingState, navigate])

  const progress = failed ? Math.round((2 / STEPS.length) * 100) : completed ? 100 : Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="font-display font-bold text-2xl text-[#212529]">AI Verification Pipeline</h1>
        <p className="text-[#6c757d] font-body text-sm mt-1">
          Processing bid from <span className="text-[#212529] font-bold">{bidderName}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-[#dee2e6] rounded-xl p-6 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[#003c8f] font-body">
            {completed ? 'Verification Complete' : STEPS[currentStep]?.label}
          </span>
          <span className="font-mono text-sm font-bold text-[#003c8f]">{progress}%</span>
        </div>
        <div className="w-full bg-[#e9ecef] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#138808] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!completed && (
          <p className="text-xs text-[#6c757d] font-body mt-2">{STEPS[currentStep]?.desc}</p>
        )}
      </div>

      {/* Steps */}
      <div className="bg-white border border-[#dee2e6] rounded-xl overflow-hidden divide-y divide-[#dee2e6] shadow-sm">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isDone = (completed || i < currentStep) && !failed
          const isActive = (!completed && !failed) && i === currentStep
          const isFailed = failed && i === currentStep
          
          return (
            <div key={step.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${isActive ? 'bg-[#f8f9fa]' : ''} ${isFailed ? 'bg-[#f8d7da]' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isDone ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' :
                isFailed ? 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]' :
                isActive ? 'bg-[#e3f2fd] text-[#003c8f] border border-[#003c8f]' :
                'bg-[#e9ecef] text-[#6c757d]'
              }`}>
                {isDone
                  ? <CheckCircle2 size={18} />
                  : isFailed
                  ? <Loader2 size={18} className="animate-spin" /> 
                  : isActive
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Clock size={16} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold font-body ${isDone ? 'text-[#212529]' : isActive ? 'text-[#003c8f]' : isFailed ? 'text-[#721c24]' : 'text-[#6c757d]'}`}>
                  {step.label}
                </p>
                <p className={`text-xs font-body truncate mt-0.5 ${isFailed ? 'text-[#721c24]' : 'text-[#6c757d]'}`}>{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {failed && (
        <div className="mt-5 p-4 rounded bg-[#f8d7da] border border-[#f5c6cb] shadow-sm animate-fade-in">
          <p className="text-sm text-[#721c24] font-bold font-body m-0">{errorMsg}</p>
          <div className="mt-4">
            <button className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-2 rounded text-sm font-bold transition-colors" onClick={() => navigate('/upload')}>
              Upload New Package
            </button>
          </div>
        </div>
      )}

      {completed && !failed && (
        <div className="mt-6 flex flex-col items-center animate-fade-in">
          <Loader2 size={24} className="text-[#003c8f] animate-spin mb-2" />
          <p className="text-sm font-bold text-[#003c8f]">Redirecting to Verification History...</p>
        </div>
      )}
    </div>
  )
}
