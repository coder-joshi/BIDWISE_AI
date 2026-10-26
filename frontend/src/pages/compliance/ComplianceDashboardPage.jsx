import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

export default function ComplianceDashboardPage() {
  const { selectedBidId, setSelectedBidId } = useUIStore()
  const [bids, setBids] = useState([])
  const [bidder, setBidder] = useState({ name: 'Loading...', complianceScore: 0 })
  const [requirements, setRequirements] = useState([])

  useEffect(() => {
    fetchBidsFromDb(selectedBidId)
      .then(({ bids: allBids, activeBid }) => {
        setBids(allBids)
        if (activeBid) {
          setBidder({
            id: activeBid.id,
            name: activeBid.bidderName,
            complianceScore: activeBid.complianceScore ?? 0,
            status: activeBid.status
          })
          setRequirements(activeBid.complianceRequirements || [])
          if (!selectedBidId) setSelectedBidId(activeBid.id)
        }
      })
      .catch(err => console.error(err))
  }, [selectedBidId, setSelectedBidId])

  const score = bidder.complianceScore
  const passed = requirements.filter(r => r.status === 'pass').length
  const failed = requirements.filter(r => r.status === 'fail').length
  const pending = requirements.filter(r => r.status === 'pending').length
  const total = requirements.length || 1

  const gaugeData = [{ name: 'score', value: score, fill: score >= 80 ? '#0D9F6F' : score >= 50 ? '#F59E0B' : '#EF4444' }]

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Compliance Dashboard</h1>
          <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
        </div>
        {bids.length > 0 && (
          <select
            value={bidder.id || ''}
            onChange={(e) => setSelectedBidId(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#003c8f]"
          >
            {bids.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bidderName} ({b.complianceScore}%)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-display font-semibold text-gem-white mb-4">Overall Compliance Score</h3>
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart innerRadius={60} outerRadius={80} data={gaugeData} startAngle={180} endAngle={-180}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-4xl text-gem-white">{score}</span>
              <span className="text-xs text-gem-muted font-body">/ 100</span>
            </div>
          </div>
          <div className={`mt-3 text-base px-4 py-2 ${score >= 70 && failed === 0 ? 'badge-verified' : 'bg-[#f8d7da] text-[#721c24] rounded font-bold'}`}>
            {score >= 70 && failed === 0 ? 'Compliant' : 'Non-Compliant'}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-gem-white">Parameter Breakdown</h3>
          {[
            { label: 'Passed', count: passed, color: 'text-gem-green-light', bg: 'bg-gem-green/10', Icon: CheckCircle2 },
            { label: 'Failed', count: failed, color: 'text-gem-red', bg: 'bg-gem-red/10', Icon: XCircle },
            { label: 'Pending', count: pending, color: 'text-gem-amber', bg: 'bg-gem-amber/10', Icon: Clock },
          ].map(({ label, count, color, bg, Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-gem-muted">{label}</span>
                  <span className="font-semibold text-gem-white">{count} / {requirements.length}</span>
                </div>
                <div className="mt-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 overflow-y-auto max-h-80">
          <h3 className="font-display font-semibold text-gem-white mb-4">Checklist</h3>
          <ul className="space-y-2">
            {requirements.map((req) => (
              <li key={req.id} className="flex items-center gap-2.5 text-sm font-body">
                {req.status === 'pass'
                  ? <CheckCircle2 size={14} className="text-gem-green-light flex-shrink-0" />
                  : req.status === 'fail'
                  ? <XCircle size={14} className="text-gem-red flex-shrink-0" />
                  : <Clock size={14} className="text-gem-amber flex-shrink-0" />
                }
                <span className={req.status === 'pass' ? 'text-gem-white' : req.status === 'fail' ? 'text-gem-red/80' : 'text-gem-amber/80'}>
                  {req.requirement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
