import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { COMPLIANCE_REQUIREMENTS, BIDDERS } from '../../data/dummyData'

export default function TenderCompliancePage() {
  const bidder = BIDDERS.A
  const passed = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'pass').length
  const failed = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'fail').length
  const pending = COMPLIANCE_REQUIREMENTS.filter(r => r.status === 'pending').length

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gem-white">Tender Compliance</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="badge-verified">{passed} Passed</div>
        <div className="badge-failed">{failed} Failed</div>
        <div className="badge-pending">{pending} Pending</div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-white/6 text-xs font-semibold text-gem-muted uppercase tracking-wide">
                <th className="text-left px-5 py-3 w-8">#</th>
                <th className="text-left px-5 py-3">Requirement</th>
                <th className="text-left px-5 py-3">Submitted Value</th>
                <th className="text-left px-5 py-3 w-24">Status</th>
                <th className="text-left px-5 py-3">AI Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {COMPLIANCE_REQUIREMENTS.map((req, i) => (
                <tr key={req.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 text-gem-muted font-mono text-xs">{i + 1}</td>
                  <td className="px-5 py-4 font-semibold text-gem-white">{req.requirement}</td>
                  <td className="px-5 py-4 text-gem-muted">{req.bidderValue}</td>
                  <td className="px-5 py-4">
                    {req.status === 'pass'
                      ? <span className="badge-verified"><CheckCircle2 size={10} /> Pass</span>
                      : req.status === 'fail'
                      ? <span className="badge-failed"><XCircle size={10} /> Fail</span>
                      : <span className="badge-pending"><Clock size={10} /> Pending</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-gem-muted text-xs max-w-xs">{req.aiNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
