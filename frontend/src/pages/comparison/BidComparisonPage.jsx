import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Award, BarChart2, ShieldAlert, Zap } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { AI_API_BASE_URL } from '../../lib/api'

const ROWS = [
  { label: 'Compliance Score', key: 'complianceScore', unit: '/100', icon: CheckCircle2, color: 'text-[#003c8f]' },
  { label: 'Risk Score',       key: 'riskScore',       unit: '/100', icon: ShieldAlert, color: 'text-amber-500' },
  { label: 'GST Status',       key: 'gstStatus',       type: 'status', icon: Zap, color: 'text-[#138808]' },
  { label: 'Annual Turnover',  key: 'turnover',        icon: BarChart2, color: 'text-[#003c8f]' },
  { label: 'Experience',       key: 'experience',      icon: Award, color: 'text-amber-500' },
  { label: 'Risk Level',       key: 'riskLevel',       type: 'risk', icon: ShieldAlert, color: 'text-red-500' },
]

function CellVal({ row, bidder }) {
  let val = bidder[row.key]
  
  // mock missing details for demonstration if they don't exist
  if (row.key === 'gstStatus') val = val || (bidder.riskScore > 60 ? 'Suspended' : 'Active')
  if (row.key === 'turnover') val = val || (bidder.riskScore > 60 ? '₹12 Cr' : '₹28 Cr')
  if (row.key === 'experience') val = val || (bidder.riskScore > 60 ? '3 years' : '12 years')
  if (row.key === 'riskLevel') val = bidder.riskScore <= 30 ? 'Low' : bidder.riskScore <= 60 ? 'Medium' : 'High'

  if (row.type === 'risk') {
    const score = bidder.riskScore
    const color = score <= 30 ? 'text-[#138808]' : score <= 60 ? 'text-[#f59e0b]' : 'text-[#dc3545]'
    return <span className={`font-bold font-body ${color} capitalize`}>{val}</span>
  }
  if (row.type === 'status') {
    const ok = val === 'Active'
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ok ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'}`}>
        {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {val}
      </span>
    )
  }
  return <span className="text-gray-900 font-body font-bold">{val}<span className="text-gray-500 text-xs ml-1">{row.unit || ''}</span></span>
}

export default function BidComparisonPage() {
  const [bidders, setBidders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${AI_API_BASE_URL}/api/v1/bids/`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // just pick top 3 for comparison
          setBidders(data.data.slice(0, 3))
        }
      })
      .catch(err => console.error("Failed to fetch bids:", err))
      .finally(() => setLoading(false))
  }, [])

  const winner = bidders.length > 0 ? bidders.reduce((prev, current) => (prev.complianceScore > current.complianceScore) ? prev : current) : null

  if (loading) return <div className="p-10 text-center text-gray-500">Loading bid comparison...</div>
  if (bidders.length === 0) return <div className="p-10 text-center text-red-500">No bids available for comparison</div>

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-200 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#e3f2fd] text-[#003c8f] text-xs font-bold mb-2 uppercase tracking-wide">
            <BarChart2 size={14} /> Evaluation Matrix
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Bid Comparison</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Multi-vendor analysis for <span className="font-bold text-gray-900 font-mono">GeM/2026/TND-005821</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm border-t-4 border-t-[#003c8f]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f9fa]">
                <th className="text-left p-6 text-gray-600 text-xs uppercase tracking-widest font-bold w-48">Parameter</th>
                {bidders.map((b) => {
                  const isWinner = b.id === winner?.id
                  return (
                    <th key={b.id} className={`p-6 relative ${isWinner ? 'bg-[#e3f2fd]' : ''}`}>
                      {isWinner && <div className="absolute top-0 left-0 w-full h-1 bg-[#003c8f]" />}
                      <div className="flex flex-col items-center gap-2">
                        {isWinner ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003c8f] text-white text-xs font-bold uppercase tracking-wider mb-2">
                            <Award size={14} /> Recommended
                          </span>
                        ) : (
                          <div className="h-7 mb-2" />
                        )}
                        <span className="font-display font-bold text-gray-900 text-lg text-center tracking-tight leading-snug max-w-[200px] truncate" title={b.bidderName}>{b.bidderName}</span>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">{b.id}</span>
                        <div className="mt-1"><StatusBadge status={b.status} /></div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ROWS.map((row) => (
                <tr 
                  key={row.label} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-6 border-r border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <row.icon size={16} className={row.color} />
                      </div>
                      <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">{row.label}</span>
                    </div>
                  </td>
                  {bidders.map((b) => {
                    const isWinner = b.id === winner?.id
                    return (
                      <td key={b.id} className={`p-6 text-center border-r border-gray-100 last:border-r-0 ${isWinner ? 'bg-[#e3f2fd]/30' : ''}`}>
                        <CellVal row={row} bidder={b} />
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="bg-[#f8f9fa] border-t-2 border-gray-200">
                <td className="p-6 text-gray-900 font-display font-bold text-sm uppercase tracking-widest border-r border-gray-100">Final Decision</td>
                {bidders.map((b) => {
                  const isWinner = b.id === winner?.id
                  return (
                    <td key={b.id} className={`p-6 text-center border-r border-gray-100 last:border-r-0 ${isWinner ? 'bg-[#e3f2fd] border-l border-r border-gray-200' : ''}`}>
                      {isWinner
                        ? <button className="px-6 py-2.5 rounded bg-[#003c8f] hover:bg-[#002b66] transition-colors text-white font-bold font-body">Proceed with Winner</button>
                        : <span className="inline-flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest"><XCircle size={14} /> Disqualified</span>
                      }
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
