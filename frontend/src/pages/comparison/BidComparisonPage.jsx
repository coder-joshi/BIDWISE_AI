import { CheckCircle2, XCircle, Clock, Award } from 'lucide-react'
import { BIDDERS } from '../../data/dummyData'
import { RiskBadge, StatusBadge } from '../../components/ui/Badge'

const ROWS = [
  { label: 'Compliance Score', keyA: 'complianceScore', keyB: 'complianceScore', keyC: 'complianceScore', unit: '/100' },
  { label: 'Risk Score',       keyA: 'riskScore',       keyB: 'riskScore',       keyC: 'riskScore',       unit: '/100' },
  { label: 'GST Status',       valA: 'Active',          valB: 'Active',          valC: 'Suspended',       type: 'status' },
  { label: 'Annual Turnover',  keyA: 'turnover',        keyB: 'turnover',        keyC: 'turnover' },
  { label: 'Experience',       keyA: 'experience',      keyB: 'experience',      keyC: 'experience' },
  { label: 'Risk Level',       keyA: 'riskLevel',       keyB: 'riskLevel',       keyC: 'riskLevel',       type: 'risk' },
]

function CellVal({ row, bidder }) {
  const val = row[`val${bidder}`] ?? BIDDERS[bidder]?.[row[`key${bidder}`]]
  if (row.type === 'risk') {
    const score = BIDDERS[bidder]?.riskScore
    const color = score <= 30 ? 'text-gem-green-light' : score <= 60 ? 'text-gem-amber' : 'text-gem-red'
    return <span className={`font-semibold font-body ${color} capitalize`}>{val}</span>
  }
  if (row.type === 'status') {
    const ok = val === 'Active'
    return <span className={`font-semibold font-body ${ok ? 'text-gem-green-light' : 'text-gem-red'}`}>{val}</span>
  }
  return <span className="text-gem-white font-body">{val}{row.unit || ''}</span>
}

export default function BidComparisonPage() {
  const bidders = [BIDDERS.A, BIDDERS.B, BIDDERS.C]
  const winner = BIDDERS.A

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Bid Comparison</h1>
        <p className="text-gem-muted font-body text-sm mt-1">Side-by-side analysis of all bidders for GeM/2026/TENDER/005821</p>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-4 text-gem-muted text-xs uppercase tracking-wide font-semibold w-40">Parameter</th>
              {bidders.map((b) => (
                <th key={b.id} className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1.5">
                    {b.id === winner.id && (
                      <span className="flex items-center gap-1 text-[10px] text-gem-amber font-semibold">
                        <Award size={10} /> Recommended
                      </span>
                    )}
                    <span className="font-display font-semibold text-gem-white text-sm text-center">{b.shortName}</span>
                    <span className="font-mono text-[10px] text-gem-muted">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {ROWS.map((row) => (
              <tr key={row.label} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-4 text-gem-muted font-semibold text-xs">{row.label}</td>
                {['A', 'B', 'C'].map((key) => (
                  <td key={key} className="px-5 py-4 text-center">
                    <CellVal row={row} bidder={key} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-gem-blue/5 border-t border-gem-blue/20">
              <td className="px-5 py-4 text-gem-muted font-semibold text-xs">Recommendation</td>
              {bidders.map((b) => (
                <td key={b.id} className="px-5 py-4 text-center">
                  {b.id === winner.id
                    ? <span className="badge-verified font-semibold">✓ Recommend</span>
                    : <span className="badge-failed">✗ Not Recommended</span>
                  }
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
