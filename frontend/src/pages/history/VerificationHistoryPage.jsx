import { useState, useEffect } from 'react'
import { Search, Filter, History, ArrowDownToLine, MoreHorizontal } from 'lucide-react'
import { StatusBadge, RiskBadge } from '../../components/ui/Badge'
import { AI_API_BASE_URL } from '../../lib/api'

export default function VerificationHistoryPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real data from python backend
    fetch(`${AI_API_BASE_URL}/api/v1/bids/`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setHistoryData(data.data)
        }
      })
      .catch(err => console.error("Failed to fetch bids:", err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = historyData.filter((h) => {
    const matchSearch = h.bidderName.toLowerCase().includes(query.toLowerCase()) ||
      h.tenderId.toLowerCase().includes(query.toLowerCase()) ||
      h.id.toLowerCase().includes(query.toLowerCase())
    const matchStatus = statusFilter === 'all' || h.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#e3f2fd] text-[#003c8f] text-xs font-bold mb-2 uppercase tracking-wide">
            <History size={14} /> Audit Trail
          </div>
          <h1 className="font-display font-bold text-2xl text-[#212529] tracking-tight m-0">Verification History</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Immutable log of all AI-processed bid evaluations.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-[#003c8f] text-[#003c8f] text-sm font-semibold flex items-center gap-2 hover:bg-[#e3f2fd] transition-colors bg-white">
            <ArrowDownToLine size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#f8f9fa] border border-gray-200 rounded p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Bidder Name, Tender ID, or Audit ID..." 
            className="w-full bg-white border border-gray-300 rounded py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#003c8f] focus:ring-1 focus:ring-[#003c8f] transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="bg-white border border-gray-300 rounded py-2 pl-10 pr-8 text-sm text-gray-800 focus:outline-none focus:border-[#003c8f] focus:ring-1 focus:ring-[#003c8f] appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified (Passed)</option>
            <option value="failed">Failed Compliance</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-[#003c8f] text-white">
              <tr>
                {['Audit ID', 'Bidder Organization', 'Tender Ref', 'Timestamp', 'Decision', 'Risk Factor', 'Compliance', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-500">Loading backend data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Search size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-800 font-semibold mb-1">No records found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-[#f8f9fa] transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-[#003c8f] bg-[#e3f2fd] px-2 py-1 rounded border border-[#bbdefb]">{row.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800 max-w-[200px] truncate">{row.bidderName}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-600">{row.tenderId}</td>
                    <td className="px-4 py-4 text-gray-600 text-xs whitespace-nowrap">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-4"><RiskBadge score={row.riskScore} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${row.complianceScore >= 60 ? 'bg-[#138808]' : 'bg-[#dc3545]'}`} 
                            style={{ width: `${row.complianceScore}%` }} 
                          />
                        </div>
                        <span className="text-gray-800 font-bold font-mono text-xs">{row.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-[#003c8f] hover:underline text-xs font-semibold">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
