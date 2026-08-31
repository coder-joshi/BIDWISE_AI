import { useState } from 'react'
import { ZoomIn, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BIDDERS } from '../../data/dummyData'

const ANNOTATIONS = [
  { id: 1, top: '18%', left: '20%', width: '55%', height: '6%',  color: '#EF4444', type: 'mismatch',  note: 'GST number format inconsistency detected — check digit mismatch.' },
  { id: 2, top: '32%', left: '10%', width: '75%', height: '8%',  color: '#F59E0B', type: 'warning',   note: 'Turnover figure differs from audited balance sheet by ₹1.2 Cr.' },
  { id: 3, top: '52%', left: '15%', width: '60%', height: '6%',  color: '#0D9F6F', type: 'verified',  note: 'ISO certificate number verified with TÜV SÜD database.' },
  { id: 4, top: '68%', left: '12%', width: '70%', height: '10%', color: '#3B82F6', type: 'info',      note: 'Signatory name matches MCA21 director records.' },
]

export default function PdfReviewPage() {
  const [active, setActive] = useState(null)
  const bidder = BIDDERS.A

  return (
    <div className="p-6 lg:p-8 h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gem-white">PDF Review Workspace</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[600px]">
        {/* Left — simulated PDF */}
        <div className="glass-card overflow-hidden relative">
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <span className="text-sm font-semibold text-gem-white font-body">GST_Certificate_Bharat_Eng.pdf</span>
            <ZoomIn size={14} className="text-gem-muted" />
          </div>
          <div className="relative bg-white/95 h-full overflow-auto p-6">
            {/* Simulated document content */}
            <div className="space-y-3 text-gray-800 text-sm font-body">
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-gray-900">GOODS AND SERVICES TAX</div>
                <div className="text-sm text-gray-600">Registration Certificate</div>
                <div className="text-xs text-gray-500 mt-1">Government of India · Ministry of Finance</div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="font-semibold text-gray-700">GSTIN:</span><br /><span className="font-mono">27AABCB1234F1Z5</span></div>
                  <div><span className="font-semibold text-gray-700">Trade Name:</span><br />Bharat Engineering Solutions</div>
                  <div><span className="font-semibold text-gray-700">Legal Name:</span><br />Bharat Engineering Solutions Pvt. Ltd.</div>
                  <div><span className="font-semibold text-gray-700">Constitution:</span><br />Private Limited Company</div>
                  <div><span className="font-semibold text-gray-700">Registration Date:</span><br />12-Mar-2014</div>
                  <div><span className="font-semibold text-gray-700">Status:</span><br /><span className="text-green-700 font-bold">ACTIVE</span></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <div className="font-semibold text-gray-700 mb-1">Principal Place of Business:</div>
                Unit 304, Bharat Industrial Estate, Marol, Andheri East, Mumbai — 400059
              </div>
              <div className="text-xs mt-3">
                <div className="font-semibold text-gray-700 mb-1">Annual Turnover (FY 2024–25):</div>
                <div className="font-mono text-gray-900">₹ 28,40,00,000 (Rupees Twenty Eight Crore Forty Lakhs)</div>
              </div>
              <div className="text-xs text-gray-400 mt-6 border-t border-gray-100 pt-3">
                This is a computer-generated certificate. Verify at gstin.gov.in
              </div>
            </div>

            {/* Bounding box overlays */}
            {ANNOTATIONS.map((ann) => (
              <div
                key={ann.id}
                className="absolute cursor-pointer transition-all"
                style={{ top: ann.top, left: ann.left, width: ann.width, height: ann.height }}
                onClick={() => setActive(active?.id === ann.id ? null : ann)}
              >
                <div
                  className="w-full h-full rounded border-2 opacity-70 hover:opacity-100 transition-opacity"
                  style={{ borderColor: ann.color, backgroundColor: `${ann.color}18` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right — annotations panel */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
            <MessageSquare size={15} className="text-gem-blue-light" />
            <span className="text-sm font-semibold text-gem-white font-body">AI Comments</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ANNOTATIONS.map((ann) => (
              <button
                key={ann.id}
                onClick={() => setActive(active?.id === ann.id ? null : ann)}
                className={`w-full text-left rounded-xl p-4 border transition-all ${
                  active?.id === ann.id ? 'border-gem-blue/40 bg-gem-blue/10' : 'glass-card hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: ann.color }} />
                  <span className="text-xs font-semibold font-body capitalize" style={{ color: ann.color }}>
                    {ann.type === 'mismatch' ? '⚠ Mismatch' : ann.type === 'warning' ? '⚡ Warning' : ann.type === 'verified' ? '✓ Verified' : 'ℹ Info'}
                  </span>
                </div>
                <p className="text-sm text-gem-muted font-body leading-relaxed">{ann.note}</p>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="px-5 py-4 border-t border-white/6 grid grid-cols-2 gap-2">
            {[
              { color: '#EF4444', label: 'Mismatch' },
              { color: '#F59E0B', label: 'Warning' },
              { color: '#0D9F6F', label: 'Verified' },
              { color: '#3B82F6', label: 'Info' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-body text-gem-muted">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
