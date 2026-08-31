import { Download, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { BIDDERS, TENDER, OFFICER, COMPLIANCE_REQUIREMENTS, FRAUD_ALERTS } from '../../data/dummyData'

export default function AuditReportPage() {
  const bidder = BIDDERS.A
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="p-6 lg:p-8 max-w-4xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Audit Report</h1>
          <p className="text-gem-muted font-body text-sm mt-1">Printable · Downloadable</p>
        </div>
        <Button variant="primary" size="md" icon={Download} onClick={() => window.print()}>
          Download PDF
        </Button>
      </div>

      <div className="glass-card p-8 space-y-8 print:bg-white print:text-black">
        {/* Report header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gem-blue flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-gem-white">GeM BidVerify</div>
              <div className="font-mono text-xs text-gem-muted">Compliance Verification Report</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-gem-muted">Report ID: RPT-{bidder.id}</div>
            <div className="font-mono text-xs text-gem-muted">Generated: {today}</div>
            <div className="mt-2 badge-verified">Final Report</div>
          </div>
        </div>

        {/* Company details */}
        <div>
          <h2 className="font-display font-semibold text-gem-white text-lg mb-4 pb-2 border-b border-white/8">1. Company Details</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
            {[
              ['Company Name', bidder.name],
              ['Bid ID', bidder.id],
              ['GST Number', bidder.gst],
              ['PAN Number', bidder.pan],
              ['Udyam Number', bidder.udyam],
              ['CIN', bidder.cin],
              ['State', bidder.state],
              ['Authorized Signatory', bidder.authorizedSignatory],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <span className="text-xs text-gem-muted">{label}</span>
                <span className="font-mono text-gem-white text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification summary */}
        <div>
          <h2 className="font-display font-semibold text-gem-white text-lg mb-4 pb-2 border-b border-white/8">2. Verification Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Compliance Score', value: `${bidder.complianceScore}/100`, color: 'text-gem-green-light' },
              { label: 'Risk Score',       value: `${bidder.riskScore}/100`,       color: 'text-gem-green-light' },
              { label: 'Fraud Signals',    value: '0 (None)',                      color: 'text-gem-green-light' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
                <div className="text-xs text-gem-muted font-body mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance matrix */}
        <div>
          <h2 className="font-display font-semibold text-gem-white text-lg mb-4 pb-2 border-b border-white/8">3. Compliance Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="text-gem-muted border-b border-white/6">
                  <th className="text-left py-2 pr-4">Requirement</th>
                  <th className="text-left py-2 pr-4">Submitted Value</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {COMPLIANCE_REQUIREMENTS.map((req) => (
                  <tr key={req.id}>
                    <td className="py-2 pr-4 text-gem-white">{req.requirement}</td>
                    <td className="py-2 pr-4 text-gem-muted">{req.bidderValue}</td>
                    <td className="py-2">
                      {req.status === 'pass'
                        ? <span className="text-gem-green-light font-semibold">✓ Pass</span>
                        : req.status === 'fail'
                        ? <span className="text-gem-red font-semibold">✗ Fail</span>
                        : <span className="text-gem-amber">⏳ Pending</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final recommendation */}
        <div className="rounded-xl bg-gem-green/10 border border-gem-green/25 p-5">
          <h2 className="font-display font-semibold text-gem-green-light text-base mb-2 flex items-center gap-2">
            <CheckCircle2 size={16} /> Final Recommendation: APPROVE
          </h2>
          <p className="text-sm text-gem-muted font-body">
            Bharat Engineering Solutions Pvt. Ltd. has satisfied all mandatory compliance criteria for Tender {TENDER.id}.
            Risk score of {bidder.riskScore}/100 (Low) and compliance score of {bidder.complianceScore}/100 are within acceptable thresholds.
            No fraud signals detected. Recommended for award consideration.
          </p>
          <div className="mt-4 text-xs text-gem-muted font-body">
            Verified by: {OFFICER.name} · {OFFICER.designation} · {today}
          </div>
        </div>
      </div>
    </div>
  )
}
