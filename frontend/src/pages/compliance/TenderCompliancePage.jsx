import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Search, Filter, ShieldCheck, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

export default function TenderCompliancePage() {
  const navigate = useNavigate()
  const { selectedBidId, setSelectedBidId } = useUIStore()
  const [bids, setBids] = useState([])
  const [bidder, setBidder] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchBidsFromDb(selectedBidId)
      .then(({ bids: allBids, activeBid }) => {
        setBids(allBids)
        setBidder(activeBid)
        setRequirements(activeBid?.complianceRequirements || [])
        if (activeBid && !selectedBidId) {
          setSelectedBidId(activeBid.id)
        }
      })
      .catch(err => console.error("Failed to fetch bid details:", err))
      .finally(() => setLoading(false))
  }, [selectedBidId, setSelectedBidId])

  const passed = requirements.filter(r => r.status === 'pass').length
  const failed = requirements.filter(r => r.status === 'fail').length
  const pending = requirements.filter(r => r.status === 'pending').length

  const filteredRequirements = requirements.filter(r => {
    const matchText =
      (r.requirement || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.bidderValue || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.aiNote || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchText && matchStatus
  })

  const getStatusColor = (status) => {
    if (status === 'pass') return 'text-[#155724] bg-[#d4edda] border-[#c3e6cb]'
    if (status === 'fail') return 'text-[#721c24] bg-[#f8d7da] border-[#f5c6cb]'
    return 'text-[#856404] bg-[#fff3cd] border-[#ffeeba]'
  }

  const getStatusIcon = (status) => {
    if (status === 'pass') return <CheckCircle2 size={14} className="text-[#155724]" />
    if (status === 'fail') return <XCircle size={14} className="text-[#721c24]" />
    return <Clock size={14} className="text-[#856404]" />
  }

  return (
    <div className="animate-fade-in w-full space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-200 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#e3f2fd] text-[#003c8f] text-xs font-bold mb-2 uppercase tracking-wide">
            <ShieldCheck size={14} /> Compliance Verification
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Tender Requirements</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Evaluating <span className="font-bold text-gray-900">{bidder?.bidderName || 'Bidder'}</span> against Tender <span className="font-mono">{bidder?.tenderId || 'GeM/2026/TENDER/005821'}</span>
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
                  {b.bidderName} ({b.complianceScore}% Compliance)
                </option>
              ))}
            </select>
          )}
          <div className="px-5 py-3 rounded bg-white border border-gray-200 flex flex-col items-center justify-center min-w-[100px] shadow-sm">
            <span className="text-2xl font-display font-bold text-[#138808]">{loading ? '-' : passed}</span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">Passed</span>
          </div>
          <div className="px-5 py-3 rounded bg-white border border-gray-200 flex flex-col items-center justify-center min-w-[100px] shadow-sm">
            <span className="text-2xl font-display font-bold text-[#dc3545]">{loading ? '-' : failed}</span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">Failed</span>
          </div>
          <div className="px-5 py-3 rounded bg-white border border-gray-200 flex flex-col items-center justify-center min-w-[100px] shadow-sm">
            <span className="text-2xl font-display font-bold text-amber-500">{loading ? '-' : pending}</span>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">Pending</span>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f9fa] border border-gray-200 rounded p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search compliance points..."
            className="w-full bg-white border border-gray-300 rounded py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#003c8f] focus:ring-1 focus:ring-[#003c8f] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#003c8f]"
          >
            <option value="all">All Statuses</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading compliance data...</div>
        ) : filteredRequirements.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No compliance data available.</div>
        ) : (
          filteredRequirements.map((req) => (
            <div 
              key={req.id} 
              className="group bg-white border border-gray-200 rounded p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">{req.id}</span>
                    <h3 className="font-display font-bold text-gray-900 m-0">{req.requirement}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-[#f8f9fa] rounded p-3 border border-gray-200">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold m-0">Tender Requirement</p>
                      <p className="text-sm font-semibold text-gray-800 m-0">{req.tenderRequirement || 'Strict match required'}</p>
                    </div>
                    <div className="bg-[#f8f9fa] rounded p-3 border border-gray-200">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold m-0">Submitted Value</p>
                      <p className="text-sm font-semibold text-gray-800 m-0">{req.bidderValue}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-5">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-bold ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      <span className="uppercase tracking-wider m-0">{req.status}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-body mt-3 leading-relaxed m-0">
                      <span className="font-bold text-gray-800 block mb-1">AI Reasoning:</span>
                      {req.aiNote || 'Verified automatically against database.'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/pdf-review')}
                    className="mt-4 text-xs font-bold text-[#003c8f] hover:underline transition-colors flex items-center gap-1 w-fit"
                  >
                    View Source Document <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
