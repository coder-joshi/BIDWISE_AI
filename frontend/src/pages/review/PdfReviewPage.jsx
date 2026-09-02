import { useState } from 'react'
import { ZoomIn, ZoomOut, MessageSquare, Download, ChevronLeft, ChevronRight, FileSearch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ANNOTATIONS = [
  { id: 1, top: '18%', left: '20%', width: '55%', height: '6%',  color: '#dc3545', type: 'mismatch',  note: 'GST number format inconsistency detected — check digit mismatch.' },
  { id: 2, top: '32%', left: '10%', width: '75%', height: '8%',  color: '#f59e0b', type: 'warning',   note: 'Turnover figure differs from audited balance sheet by ₹1.2 Cr.' },
  { id: 3, top: '52%', left: '15%', width: '60%', height: '6%',  color: '#138808', type: 'verified',  note: 'ISO certificate number verified with TÜV SÜD database.' },
  { id: 4, top: '68%', left: '12%', width: '70%', height: '10%', color: '#003c8f', type: 'info',      note: 'Signatory name matches MCA21 director records.' },
]

export default function PdfReviewPage() {
  const [active, setActive] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [page, setPage] = useState(1)
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1))
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, 5))
  
  const handleDownload = () => {
    alert("Downloading verified document PDF...");
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 shrink-0 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#e3f2fd] text-[#003c8f] text-xs font-bold mb-2 uppercase tracking-wide">
            <FileSearch size={14} /> Document Workspace
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Interactive PDF Review</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Analyzing <span className="text-gray-900 font-bold">GST_Certificate_Bharat_Eng.pdf</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f8f9fa] border border-gray-200 rounded px-4 py-2 shadow-sm">
            <button onClick={handlePrevPage} disabled={page === 1} className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-mono text-gray-700 font-bold">Page {page} of 5</span>
            <button onClick={handleNextPage} disabled={page === 5} className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
          </div>
          <div className="flex items-center bg-[#f8f9fa] border border-gray-200 rounded shadow-sm overflow-hidden">
            <button onClick={handleZoomOut} className="p-2 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-200"><ZoomOut size={18} /></button>
            <span className="text-xs font-mono font-bold px-3 text-gray-700">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2 text-gray-600 hover:bg-gray-100 transition-colors border-l border-gray-200"><ZoomIn size={18} /></button>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded bg-[#003c8f] text-white font-bold text-sm hover:bg-[#002b66] transition-colors shadow-sm">
            <Download size={16} /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left — simulated PDF */}
        <div className="lg:col-span-2 bg-[#e5e7eb] rounded border border-gray-300 overflow-hidden relative flex flex-col shadow-inner">
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8 overflow-auto">
            
            {/* The Document Canvas */}
            <div 
              className="relative bg-white shadow-xl flex-shrink-0 transition-transform duration-200 origin-center"
              style={{ width: '700px', height: '990px', transform: `scale(${zoom})` }}
            >
              <div className="absolute inset-0 p-12">
                {/* Simulated document content */}
                {page === 1 ? (
                  <div className="space-y-4 text-gray-800 text-sm font-body">
                    <div className="text-center mb-8">
                      <div className="text-2xl font-bold text-gray-900 tracking-wide m-0">GOODS AND SERVICES TAX</div>
                      <div className="text-base text-gray-600 font-bold mt-1 m-0">Registration Certificate</div>
                      <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold m-0">Government of India · Ministry of Finance</div>
                    </div>
                    <div className="border-t-2 border-gray-900 pt-6">
                      <div className="grid grid-cols-2 gap-6 text-sm leading-relaxed">
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">GSTIN</span><span className="font-mono font-bold text-base text-gray-900">27AABCB1234F1Z5</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Trade Name</span><span className="text-gray-900 font-bold">Bharat Engineering Solutions</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Legal Name</span><span className="text-gray-900 font-bold">Bharat Engineering Solutions Pvt. Ltd.</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Constitution</span><span className="text-gray-900 font-bold">Private Limited Company</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Registration Date</span><span className="text-gray-900 font-bold">12-Mar-2014</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</span><span className="text-[#155724] bg-[#d4edda] font-bold border border-[#c3e6cb] px-2 py-0.5 rounded inline-block">ACTIVE</span></div>
                      </div>
                    </div>
                    <div className="text-sm mt-8">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Principal Place of Business:</div>
                      <div className="text-gray-900 font-bold">Unit 304, Bharat Industrial Estate, Marol, Andheri East, Mumbai — 400059</div>
                    </div>
                    <div className="text-sm mt-6 p-6 bg-[#f8f9fa] border border-gray-200 rounded">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Annual Turnover (FY 2024–25):</div>
                      <div className="font-mono text-gray-900 text-lg font-bold">₹ 28,40,00,000 (Rupees Twenty Eight Crore Forty Lakhs)</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-16 border-t border-gray-200 pt-6 text-center font-bold">
                      This is a computer-generated certificate. Verify at gstin.gov.in
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">
                    Page {page} Content
                  </div>
                )}

                {/* Bounding box overlays (only on page 1 for demo) */}
                {page === 1 && ANNOTATIONS.map((ann) => {
                  const isActive = active?.id === ann.id
                  return (
                    <motion.div
                      key={ann.id}
                      className="absolute cursor-pointer"
                      style={{ top: ann.top, left: ann.left, width: ann.width, height: ann.height }}
                      onClick={() => setActive(isActive ? null : ann)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div
                        className={`w-full h-full rounded transition-all duration-300 ${isActive ? 'border-2 shadow-md bg-opacity-20' : 'border border-dashed opacity-70 hover:opacity-100 hover:border-solid hover:bg-opacity-10'}`}
                        style={{ borderColor: ann.color, backgroundColor: `${ann.color}20` }}
                      />
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl p-4 rounded z-10"
                          >
                            <p className="text-sm text-gray-800 font-body leading-relaxed m-0 font-medium">{ann.note}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* Right — annotations panel */}
        <div className="bg-white flex flex-col overflow-hidden rounded border border-gray-200 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 bg-[#f8f9fa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#003c8f]" />
              <span className="text-sm font-bold tracking-wide text-gray-900 font-display uppercase m-0">AI Extraction Logs</span>
            </div>
            <span className="text-xs font-mono font-bold bg-[#e3f2fd] text-[#003c8f] px-2 py-1 rounded">{ANNOTATIONS.length} Found</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {ANNOTATIONS.map((ann, i) => (
              <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                key={ann.id}
                onClick={() => {
                  setPage(1); // switch to page 1 to show annotation
                  setActive(active?.id === ann.id ? null : ann)
                }}
                className={`w-full text-left rounded p-4 border transition-all ${
                  active?.id === ann.id 
                    ? 'shadow-md border-l-4' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                style={{ 
                  borderColor: active?.id === ann.id ? ann.color : '', 
                  backgroundColor: active?.id === ann.id ? `${ann.color}10` : '' 
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ann.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest m-0" style={{ color: ann.color }}>
                    {ann.type}
                  </span>
                </div>
                <p className={`text-sm font-body leading-relaxed m-0 ${active?.id === ann.id ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                  {ann.note}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-gray-200 bg-[#f8f9fa] grid grid-cols-2 gap-3">
            {[
              { color: '#dc3545', label: 'Mismatch' },
              { color: '#f59e0b', label: 'Warning' },
              { color: '#138808', label: 'Verified' },
              { color: '#003c8f', label: 'Info' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
