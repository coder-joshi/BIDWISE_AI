import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { HISTORY } from '../../data/dummyData'
import { StatusBadge, RiskBadge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'

export default function VerificationHistoryPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = HISTORY.filter((h) => {
    const matchSearch = h.bidder.toLowerCase().includes(query.toLowerCase()) ||
      h.tender.toLowerCase().includes(query.toLowerCase()) ||
      h.id.toLowerCase().includes(query.toLowerCase())
    const matchStatus = statusFilter === 'all' || h.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gem-white">Verification History</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{HISTORY.length} records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-60">
          <Input placeholder="Search by bidder, tender, ID..." icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select
          className="input-base w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-white/6 text-xs text-gem-muted uppercase tracking-wide">
                {['Bid ID', 'Bidder', 'Tender', 'Date', 'Status', 'Risk', 'Compliance', 'Officer'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-white/3 transition-colors cursor-pointer">
                  <td className="px-5 py-3 font-mono text-xs text-gem-blue-light">{row.id}</td>
                  <td className="px-5 py-3 font-semibold text-gem-white max-w-[180px] truncate">{row.bidder}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gem-muted">{row.tender}</td>
                  <td className="px-5 py-3 text-gem-muted">{row.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-3"><RiskBadge score={row.risk} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gem-green-light rounded-full" style={{ width: `${row.compliance}%` }} />
                      </div>
                      <span className="text-gem-white font-semibold">{row.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gem-muted">{row.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gem-muted font-body">
            No records match your search.
          </div>
        )}
      </div>
    </div>
  )
}
