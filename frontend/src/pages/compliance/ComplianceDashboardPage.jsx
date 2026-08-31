import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { COMPLIANCE_REQUIREMENTS, BIDDERS } from '../../data/dummyData'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

export default function ComplianceDashboardPage() {
  const bidder = BIDDERS.A
  const score = bidder.complianceScore
  const passed = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'pass').length
  const failed = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'fail').length
  const pending = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'pending').length
  const total = COMPLIANCE_REQUIREMENTS.length

  const gaugeData = [{ name: 'score', value: score, fill: score >= 80 ? '#0D9F6F' : score >= 50 ? '#F59E0B' : '#EF4444' }]

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Compliance Dashboard</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score gauge */}
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
          <div className="mt-3 badge-verified text-base px-4 py-2">Compliant</div>
        </div>

        {/* Counts */}
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
                  <span className="font-semibold text-gem-white">{count} / {total}</span>
                </div>
                <div className="mt-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="glass-card p-6 overflow-y-auto max-h-80">
          <h3 className="font-display font-semibold text-gem-white mb-4">Checklist</h3>
          <ul className="space-y-2">
            {COMPLIANCE_REQUIREMENTS.map((req) => (
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
