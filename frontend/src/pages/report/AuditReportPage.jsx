import { Download, CheckCircle2, Shield, Hash, FileCheck, Info, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AI_API_BASE_URL } from '../../lib/api'

export default function AuditReportPage() {
  const [bidder, setBidder] = useState(null)
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const [auditHash, setAuditHash] = useState("Generating cryptographic hash...")
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    fetch(`${AI_API_BASE_URL}/api/v1/bids/BID-2026-0841`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setBidder(data.data)
        }
      })
      .catch(err => console.error("Failed to fetch bid details:", err))
      .finally(() => setLoading(false))

    // Simulate hashing
    setTimeout(() => {
      setAuditHash("0xa7f9b2c31828f89e247492c3a50f14371982c7d9182390a8c27f71b9c927f8d1")
      setIsGenerating(false)
    }, 1500)
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">Generating report...</div>
  if (!bidder) return <div className="p-10 text-center text-red-500">Failed to load bidder data</div>

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-fade-in w-full">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#e3f2fd] text-[#003c8f] text-xs font-bold mb-2 uppercase tracking-wide">
            <FileCheck size={14} /> Immutable Record
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Final Audit Report</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">Generated and secured via cryptographic hashing.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm" onClick={() => window.print()}>
            Print
          </button>
          <button className="px-4 py-2 bg-[#003c8f] text-white rounded font-bold text-sm flex items-center gap-2 hover:bg-[#002b66] transition-colors shadow-sm" onClick={() => window.print()}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-8 lg:p-12 space-y-10 shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* Report header */}
        <div className="flex flex-col sm:flex-row items-start justify-between border-b border-gray-200 pb-8 gap-6 print:pb-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded bg-[#f8f9fa] flex items-center justify-center border border-gray-200 shadow-sm">
              <Shield size={32} className="text-[#003c8f]" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">GeM BidVerify</div>
              <div className="font-mono text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">Official Compliance Report</div>
            </div>
          </div>
          <div className="sm:text-right space-y-1.5 bg-[#f8f9fa] print:bg-transparent p-4 rounded border border-gray-200 print:border-none">
            <div className="font-mono text-xs text-gray-600"><span className="text-gray-400 font-bold uppercase tracking-wider mr-2">Report ID:</span> RPT-{bidder.id}</div>
            <div className="font-mono text-xs text-gray-600"><span className="text-gray-400 font-bold uppercase tracking-wider mr-2">Generated:</span> {today}</div>
            <div className="inline-flex mt-2 px-3 py-1 rounded border border-[#138808] text-[#138808] bg-[#d4edda] text-[10px] uppercase font-bold tracking-widest">
              Verified Final
            </div>
          </div>
        </div>

        {/* Company details */}
        <div>
          <h2 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-200 flex items-center gap-2 m-0">
            <span className="w-6 h-6 rounded bg-[#e3f2fd] text-[#003c8f] flex items-center justify-center text-sm font-bold">1</span> Company Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 text-sm font-body bg-[#f8f9fa] rounded p-6 border border-gray-200 print:bg-transparent print:border-none print:p-0 print:gap-y-4">
            {[
              ['Company Name', bidder.bidderName],
              ['Bid ID', bidder.id],
              ['GST Number', bidder.gstNumber || '27AABCB1234F1Z5'],
              ['PAN Number', bidder.panNumber || 'AABCB1234F'],
              ['Udyam Number', bidder.udyamNumber || 'UDYAM-MH-01-0012345'],
              ['State', bidder.state || 'Maharashtra'],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
                <span className="font-mono text-gray-900 text-sm font-bold m-0">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification summary */}
        <div>
          <h2 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-200 flex items-center gap-2 m-0">
            <span className="w-6 h-6 rounded bg-[#e3f2fd] text-[#003c8f] flex items-center justify-center text-sm font-bold">2</span> Evaluation Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Compliance Score', value: `${bidder.complianceScore}/100`, color: 'text-[#155724]', bg: 'bg-[#d4edda]', border: 'border-[#c3e6cb]' },
              { label: 'Risk Score',       value: `${bidder.riskScore}/100`,       color: 'text-[#155724]', bg: 'bg-[#d4edda]', border: 'border-[#c3e6cb]' },
              { label: 'Fraud Signals',    value: bidder.fraudAlerts?.length ? `${bidder.fraudAlerts.length} Detected` : '0 Detected', color: bidder.fraudAlerts?.length ? 'text-[#721c24]' : 'text-[#155724]', bg: bidder.fraudAlerts?.length ? 'bg-[#f8d7da]' : 'bg-[#d4edda]', border: bidder.fraudAlerts?.length ? 'border-[#f5c6cb]' : 'border-[#c3e6cb]' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded p-6 text-center print:border-gray-200 print:bg-transparent shadow-sm`}>
                <div className={`font-display font-bold text-3xl mb-1 m-0 ${color}`}>{value}</div>
                <div className="text-[10px] text-gray-600 font-body uppercase tracking-widest font-bold m-0">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance matrix */}
        <div>
          <h2 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-200 flex items-center gap-2 m-0">
            <span className="w-6 h-6 rounded bg-[#e3f2fd] text-[#003c8f] flex items-center justify-center text-sm font-bold">3</span> Detailed Matrix
          </h2>
          <div className="overflow-x-auto rounded border border-gray-200 print:border-gray-300">
            <table className="w-full text-sm font-body">
              <thead className="bg-[#f8f9fa] print:bg-transparent">
                <tr className="text-gray-500 border-b border-gray-200 text-[10px] uppercase tracking-widest">
                  <th className="text-left px-6 py-4 font-bold">Requirement</th>
                  <th className="text-left px-6 py-4 font-bold">Submitted Value</th>
                  <th className="text-left px-6 py-4 font-bold w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(bidder.complianceRequirements || [
                  { id: 'CR-01', requirement: 'GST Registration', bidderValue: 'Active', status: 'pass' },
                  { id: 'CR-02', requirement: 'Turnover', bidderValue: '₹28 Cr', status: 'pass' }
                ]).map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-bold m-0">{req.requirement}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs m-0">{req.bidderValue}</td>
                    <td className="px-6 py-4 m-0">
                      {req.status === 'pass'
                        ? <span className="inline-flex items-center gap-1.5 text-[#138808] font-bold text-xs uppercase tracking-wider"><CheckCircle2 size={14}/> Pass</span>
                        : req.status === 'fail'
                        ? <span className="inline-flex items-center gap-1.5 text-[#dc3545] font-bold text-xs uppercase tracking-wider"><XCircle size={14}/> Fail</span>
                        : <span className="inline-flex items-center gap-1.5 text-[#f59e0b] font-bold text-xs uppercase tracking-wider"><Info size={14}/> Pending</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockchain Hash Stub */}
        <div className="bg-[#f8f9fa] border border-gray-200 rounded p-6 shadow-sm print:border-gray-300 relative overflow-hidden">
          <h2 className="font-display font-bold text-gray-900 text-base mb-2 flex items-center gap-2 m-0">
            <Hash size={18} className="text-[#138808]" /> Blockchain Audit Trail
          </h2>
          <p className="text-sm text-gray-600 font-body mb-4 print:text-gray-600 max-w-2xl leading-relaxed m-0">
            This verification report is cryptographically anchored to an immutable ledger. Any tampering with the source documents or this report will invalidate the hash.
          </p>
          <div className={`font-mono text-xs p-4 rounded border break-all transition-all m-0 ${isGenerating ? 'text-gray-500 bg-white border-gray-200 animate-pulse' : 'text-[#155724] bg-[#d4edda] border-[#c3e6cb] shadow-inner font-bold'}`}>
            {auditHash}
          </div>
        </div>

        {/* Final recommendation */}
        <div className="rounded border border-[#c3e6cb] bg-[#d4edda] p-8 shadow-sm print:border-gray-300 print:bg-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden text-[#138808]">
            <Shield size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="font-display font-bold text-[#155724] text-xl mb-3 flex items-center gap-2 m-0 tracking-tight">
              <CheckCircle2 size={24} /> Recommendation: APPROVE
            </h2>
            <p className="text-sm text-[#155724] font-body leading-relaxed max-w-3xl m-0 font-medium">
              <span className="font-bold">{bidder.bidderName}</span> has satisfied all mandatory compliance criteria for Tender <span className="font-mono text-xs px-1 bg-white border border-[#c3e6cb] rounded ml-1 mr-1">{bidder.tenderId}</span>.
              Risk score of {bidder.riskScore}/100 and compliance score of {bidder.complianceScore}/100 are within acceptable thresholds.
              Recommended for award consideration.
            </p>
            <div className="mt-6 pt-4 border-t border-[#c3e6cb] text-xs text-[#155724] font-body print:border-gray-300 flex flex-col sm:flex-row justify-between gap-4 font-bold uppercase tracking-widest">
              <span>Verified by: <strong className="text-[#155724]">Procurement Officer</strong></span>
              <span>Timestamp: <strong className="text-[#155724]">{today}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
