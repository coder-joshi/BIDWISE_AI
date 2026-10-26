import { useState, useEffect } from 'react'
import { ZoomIn, ZoomOut, MessageSquare, Download, ChevronLeft, ChevronRight, FileSearch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

export default function PdfReviewPage() {
  const { selectedBidId, setSelectedBidId } = useUIStore()
  const [bids, setBids] = useState([])
  const [bidder, setBidder] = useState(null)
  const [active, setActive] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchBidsFromDb(selectedBidId)
      .then(({ bids: allBids, activeBid }) => {
        setBids(allBids)
        setBidder(activeBid)
        setActive(null)
        if (activeBid && !selectedBidId) {
          setSelectedBidId(activeBid.id)
        }
      })
      .catch(err => console.error(err))
  }, [selectedBidId, setSelectedBidId])
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1))
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, 5))
  
  const handleDownload = () => {
    window.print()
  }

  const details = bidder?.bidderDetails || {}
  const annotations = bidder?.annotations || []
  const gst = details.gst || bidder?.gstNumber || 'N/A'
  const gstStatus = details.gstStatus || bidder?.gstStatus || 'Active'

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
            Analyzing <span className="text-gray-900 font-bold">{bidder?.bidderName || 'Bidder'} — Certificate Bundle.pdf</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {bids.length > 0 && (
            <select
              value={bidder?.id || ''}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#003c8f]"
            >
              {bids.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bidderName} ({b.id})
                </option>
              ))}
            </select>
          )}
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
                {page === 1 ? (
                  <div className="space-y-4 text-gray-800 text-sm font-body">
                    <div className="text-center mb-8">
                      <div className="text-2xl font-bold text-gray-900 tracking-wide m-0">GOODS AND SERVICES TAX</div>
                      <div className="text-base text-gray-600 font-bold mt-1 m-0">Registration & Statutory Summary Certificate</div>
                      <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold m-0">Government of India · Ministry of Finance</div>
                    </div>
                    <div className="border-t-2 border-gray-900 pt-6">
                      <div className="grid grid-cols-2 gap-6 text-sm leading-relaxed">
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">GSTIN</span><span className="font-mono font-bold text-base text-gray-900">{gst}</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">PAN</span><span className="text-gray-900 font-mono font-bold">{details.pan || bidder?.panNumber || 'N/A'}</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Legal Name</span><span className="text-gray-900 font-bold">{bidder?.bidderName}</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Udyam Registration</span><span className="text-gray-900 font-mono font-bold">{details.udyam || bidder?.udyamNumber || 'N/A'}</span></div>
                        <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">State Jurisdiction</span><span className="text-gray-900 font-bold">{details.state || bidder?.state || 'India'}</span></div>
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</span>
                          <span className={`font-bold border px-2 py-0.5 rounded inline-block ${
                            gstStatus === 'Active' ? 'text-[#155724] bg-[#d4edda] border-[#c3e6cb]' : 'text-[#721c24] bg-[#f8d7da] border-[#f5c6cb]'
                          }`}>
                            {gstStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm mt-8">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tender Reference & Experience:</div>
                      <div className="text-gray-900 font-bold">Tender {bidder?.tenderId} · {details.experience || bidder?.experience || 'N/A'} Execution History</div>
                    </div>
                    <div className="text-sm mt-6 p-6 bg-[#f8f9fa] border border-gray-200 rounded">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audited Annual Turnover:</div>
                      <div className="font-mono text-gray-900 text-lg font-bold">{details.turnover || bidder?.turnover || 'N/A'}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-16 border-t border-gray-200 pt-6 text-center font-bold">
                      Computer-generated verification sheet for Bid ID {bidder?.id}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">
                    Page {page} Content ({bidder?.bidderName})
                  </div>
                )}

                {/* Dynamic Bounding box overlays */}
                {page === 1 && annotations.map((ann) => {
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
            <span className="text-xs font-mono font-bold bg-[#e3f2fd] text-[#003c8f] px-2 py-1 rounded">{annotations.length} Found</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {annotations.map((ann, i) => (
              <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                key={ann.id}
                onClick={() => {
                  setPage(1)
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
