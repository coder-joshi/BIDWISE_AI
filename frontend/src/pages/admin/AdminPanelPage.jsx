import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, Globe, List, Network, Trash2, CheckCircle2, XCircle, RefreshCw, Plus, ShieldAlert, ExternalLink
} from 'lucide-react'
import { AI_API_BASE_URL, fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

const TABS = [
  { id: 'bids',      label: 'Evaluated Bids DB', Icon: FileText },
  { id: 'collusion', label: 'Collusion Graph',   Icon: Network },
  { id: 'apis',      label: 'Government APIs',   Icon: Globe },
  { id: 'logs',      label: 'System Logs',       Icon: List },
  { id: 'users',     label: 'Officers & Access', Icon: Users },
]

const INITIAL_USERS = [
  { id: 'PO-2026-0041', name: 'Arjun Sharma', email: 'arjun.sharma@railways.gov.in', role: 'admin', designation: 'Chief Procurement Administrator', department: 'Ministry of Railways', status: 'active', lastActive: 'Online now' },
  { id: 'PO-2026-0039', name: 'Meera Pillai', email: 'meera.pillai@railways.gov.in', role: 'procurement_officer', designation: 'Senior Procurement Officer', department: 'Ministry of Railways', status: 'active', lastActive: '14 mins ago' },
  { id: 'PO-2026-0033', name: 'Suresh Gupta', email: 'suresh.gupta@meity.gov.in', role: 'procurement_officer', designation: 'Technical Evaluation Officer', department: 'MeitY', status: 'active', lastActive: '2 hrs ago' },
]

export default function AdminPanelPage() {
  const navigate = useNavigate()
  const { setSelectedBidId } = useUIStore()
  const [tab, setTab] = useState('bids')
  const [bids, setBids] = useState([])
  const [apis, setApis] = useState([])
  const [collusionSignals, setCollusionSignals] = useState([])
  const [logs, setLogs] = useState([])
  const [logFilter, setLogFilter] = useState('ALL')
  const [users, setUsers] = useState(INITIAL_USERS)
  const [newOfficerName, setNewOfficerName] = useState('')
  const [newOfficerEmail, setNewOfficerEmail] = useState('')
  const [newOfficerDept, setNewOfficerDept] = useState('Ministry of Railways')
  const [loading, setLoading] = useState(true)

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ bids: allBids }, adminRes] = await Promise.all([
        fetchBidsFromDb(),
        fetch(`${AI_API_BASE_URL}/api/v1/dashboard/admin`).then((r) => r.json()).catch(() => null),
      ])
      setBids(allBids || [])

      if (adminRes?.data) {
        setApis(adminRes.data.apis || [])
        setCollusionSignals(adminRes.data.collusionSignals || [])
        setLogs(adminRes.data.logs || [])
      } else {
        // Compute fallback dynamic telemetry directly from allBids if python-backend wasn't restarted yet
        const safeBids = allBids || []
        const computedLogs = []
        safeBids.forEach((b) => {
          const ts = (b.createdAt || '').slice(11, 19) || '10:15:00'
          ;(b.fraudAlerts || []).forEach((a) => {
            computedLogs.push({
              time: ts,
              level: a.severity === 'high' ? 'ERROR' : 'WARN',
              msg: `[${b.id}] Forensic alert ${a.id} (${a.type}): ${a.detail}`,
            })
          })
          computedLogs.push({
            time: ts,
            level: b.status === 'verified' ? 'INFO' : 'WARN',
            msg: `[${b.id}] Evaluated ${b.bidderName} · Compliance ${b.complianceScore}% · Risk ${b.riskScore}/100`,
          })
        })
        setLogs(computedLogs)
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  const handleToggleBidStatus = async (bid) => {
    const nextStatus = bid.status === 'verified' ? 'failed' : 'verified'
    try {
      await fetch(`${AI_API_BASE_URL}/api/v1/bids/${bid.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      await loadAdminData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteBid = async (bidId) => {
    try {
      await fetch(`${AI_API_BASE_URL}/api/v1/bids/${bidId}`, {
        method: 'DELETE',
      })
      await loadAdminData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    )
  }

  const handleAddOfficer = (e) => {
    e.preventDefault()
    if (!newOfficerName.trim() || !newOfficerEmail.trim()) return
    const nextUser = {
      id: `PO-2026-00${users.length + 45}`,
      name: newOfficerName.trim(),
      email: newOfficerEmail.trim(),
      role: 'procurement_officer',
      designation: 'Procurement Officer',
      department: newOfficerDept,
      status: 'active',
      lastActive: 'Just added',
    }
    setUsers((prev) => [nextUser, ...prev])
    setNewOfficerName('')
    setNewOfficerEmail('')
  }

  const verifiedCount = bids.filter((b) => b.status === 'verified').length
  const failedCount = bids.filter((b) => b.status === 'failed').length
  const totalFraudAlerts = bids.reduce((acc, b) => acc + (b.fraudAlerts?.length || 0), 0)
  const filteredLogs = logs.filter((l) => logFilter === 'ALL' || l.level === logFilter)

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dee2e6] pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-[#212529] tracking-tight m-0">
            System Administration & Telemetry
          </h1>
          <p className="text-[#6c757d] font-body text-sm mt-1 m-0">
            Live database management, cross-bid collusion analytics, government API telemetry, and audit logs.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded bg-[#003c8f] hover:bg-[#002b66] text-white text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Live Data
        </button>
      </div>

      {/* Live Admin KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-[#6c757d] font-bold m-0">Total DB Records</p>
          <p className="text-2xl font-display font-bold text-[#003c8f] mt-1 m-0">{bids.length}</p>
        </div>
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-[#6c757d] font-bold m-0">Qualified / Verified</p>
          <p className="text-2xl font-display font-bold text-[#138808] mt-1 m-0">{verifiedCount}</p>
        </div>
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-[#6c757d] font-bold m-0">Failed / Disqualified</p>
          <p className="text-2xl font-display font-bold text-[#dc3545] mt-1 m-0">{failedCount}</p>
        </div>
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-[#6c757d] font-bold m-0">Active Forensic Alerts</p>
          <p className="text-2xl font-display font-bold text-amber-600 mt-1 m-0">{totalFraudAlerts}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-white inline-flex rounded border border-[#dee2e6] shadow-sm">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold font-body transition-colors ${
              tab === id ? 'bg-[#003c8f] text-white' : 'text-[#495057] hover:bg-[#e3f2fd] hover:text-[#003c8f]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-[#dee2e6] rounded shadow-sm overflow-hidden">
        {/* TAB 1: EVALUATED BIDS DB MANAGEMENT */}
        {tab === 'bids' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-[#f8f9fa] border-b border-[#dee2e6] text-xs uppercase text-[#6c757d] font-bold">
                <tr>
                  <th className="text-left px-4 py-3">Audit ID</th>
                  <th className="text-left px-4 py-3">Bidder Name</th>
                  <th className="text-left px-4 py-3">GST / PAN</th>
                  <th className="text-left px-4 py-3">Compliance</th>
                  <th className="text-left px-4 py-3">Risk Score</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee2e6]">
                {bids.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#003c8f]">{b.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#212529] m-0">{b.bidderName}</p>
                      <p className="text-xs text-[#6c757d] font-mono m-0">{b.tenderId}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#495057]">
                      {b.gstNumber || 'N/A'} · {b.panNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-xs">
                      <span className={b.complianceScore >= 70 ? 'text-[#138808]' : 'text-[#dc3545]'}>
                        {b.complianceScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-xs">
                      <span className={b.riskScore <= 35 ? 'text-[#138808]' : 'text-[#dc3545]'}>
                        {b.riskScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          b.status === 'verified'
                            ? 'bg-[#d4edda] text-[#155724]'
                            : 'bg-[#f8d7da] text-[#721c24]'
                        }`}
                      >
                        {b.status === 'verified' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBidId(b.id)
                            navigate('/risk')
                          }}
                          className="px-2.5 py-1 rounded border border-[#003c8f] text-[#003c8f] hover:bg-[#e3f2fd] text-xs font-bold flex items-center gap-1"
                        >
                          Inspect <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={() => handleToggleBidStatus(b)}
                          className="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-700"
                          title="Override Status"
                        >
                          {b.status === 'verified' ? 'Mark Failed' : 'Approve Override'}
                        </button>
                        <button
                          onClick={() => handleDeleteBid(b.id)}
                          className="p-1.5 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete Bid Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DYNAMIC COLLUSION & CROSS-BID GRAPH */}
        {tab === 'collusion' && (
          <div className="p-6 space-y-4 bg-[#f8f9fa]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#212529] font-bold font-display text-lg m-0">
                  Live Cross-Bid Collusion & Cover-Bidding Analysis
                </h3>
                <p className="text-xs text-[#6c757d] m-0 mt-1">
                  Automatically correlates PDF metadata signatures, GST state clusters, and dummy/cover bid submissions across {bids.length} evaluated packages.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#d4edda] text-[#155724] border border-[#c3e6cb] rounded font-bold text-xs uppercase tracking-wider">
                Active Engine · {collusionSignals.length} Signal(s)
              </span>
            </div>

            {collusionSignals.length === 0 ? (
              <div className="bg-white border border-[#dee2e6] rounded p-8 text-center text-sm text-[#6c757d]">
                No cross-bid collusion patterns detected in current dataset.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {collusionSignals.map((sig) => (
                  <div key={sig.id} className="bg-white border border-[#dee2e6] rounded-lg p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert
                          size={18}
                          className={sig.severity === 'high' ? 'text-[#dc3545]' : 'text-amber-600'}
                        />
                        <span className="font-mono text-xs font-bold text-[#003c8f] bg-[#e3f2fd] px-2 py-0.5 rounded">
                          {sig.id}
                        </span>
                        <h4 className="font-display font-bold text-base text-[#212529] m-0">{sig.title}</h4>
                      </div>
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${
                          sig.severity === 'high'
                            ? 'bg-[#f8d7da] text-[#721c24]'
                            : 'bg-[#fff3cd] text-[#856404]'
                        }`}
                      >
                        {sig.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-[#495057] mb-3 leading-relaxed">{sig.detail}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-gray-600">Linked Bidders:</span>
                        {(sig.bidders || []).map((bLabel) => (
                          <span
                            key={bLabel}
                            className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 font-semibold text-gray-800"
                          >
                            {bLabel}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-[#003c8f] font-semibold">
                        Signal: {sig.sharedAttribute}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DYNAMIC GOVERNMENT API TELEMETRY */}
        {tab === 'apis' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-[#f8f9fa]">
            {apis.map((api) => (
              <div key={api.name} className="bg-white border border-[#dee2e6] rounded p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#dee2e6]">
                  <Globe size={20} className="text-[#003c8f]" />
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      api.status === 'online'
                        ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]'
                        : 'bg-[#fff3cd] text-[#856404] border border-[#ffeeba]'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        api.status === 'online' ? 'bg-[#155724]' : 'bg-[#856404]'
                      }`}
                    />
                    {api.status}
                  </div>
                </div>
                <h3 className="font-display font-bold text-[#212529] text-base mb-1">{api.name}</h3>
                <p className="font-mono text-xs text-[#003c8f] bg-[#e3f2fd] px-2 py-1 rounded border border-[#bbdefb] mb-4 truncate w-max max-w-full">
                  {api.endpoint}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center bg-[#f8f9fa] p-2.5 rounded border border-gray-200 mb-3">
                  <div>
                    <div className="text-xs font-bold text-[#138808] font-mono">{api.matches ?? 0}</div>
                    <div className="text-[10px] text-[#6c757d] uppercase">Matched</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#dc3545] font-mono">{api.mismatches ?? 0}</div>
                    <div className="text-[10px] text-[#6c757d] uppercase">Flagged</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-600 font-mono">{api.pending ?? 0}</div>
                    <div className="text-[10px] text-[#6c757d] uppercase">Pending</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-body pt-2">
                  <span className="text-[#6c757d] font-bold">
                    Latency: <span className="text-[#212529] font-mono">{api.latency}</span>
                  </span>
                  <span className="text-[#6c757d] font-bold">
                    Uptime:{' '}
                    <span className={`${(api.uptime || '').startsWith('99') ? 'text-[#138808]' : 'text-amber-600'} font-mono`}>
                      {api.uptime}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: LIVE SYSTEM LOGS */}
        {tab === 'logs' && (
          <div>
            <div className="bg-[#f8f9fa] px-6 py-3 border-b border-[#dee2e6] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6c757d]">
                Live Audit & Forensic Event Stream ({filteredLogs.length})
              </span>
              <div className="flex gap-1.5">
                {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      logFilter === lvl
                        ? 'bg-[#003c8f] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="font-mono text-xs divide-y divide-[#dee2e6] max-h-[460px] overflow-y-auto">
              {filteredLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#f8f9fa] transition-colors">
                  <span className="text-[#6c757d] w-20 flex-shrink-0">{log.time}</span>
                  <span
                    className={`w-20 flex-shrink-0 font-bold px-2 py-0.5 rounded text-center border ${
                      log.level === 'ERROR'
                        ? 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]'
                        : log.level === 'WARN'
                        ? 'bg-[#fff3cd] text-[#856404] border-[#ffeeba]'
                        : 'bg-[#d4edda] text-[#155724] border-[#c3e6cb]'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-[#212529]">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: OFFICERS & ACCESS CONTROL */}
        {tab === 'users' && (
          <div>
            <form
              onSubmit={handleAddOfficer}
              className="bg-[#f8f9fa] p-4 border-b border-[#dee2e6] flex flex-wrap items-center gap-3"
            >
              <input
                type="text"
                placeholder="Officer Full Name"
                value={newOfficerName}
                onChange={(e) => setNewOfficerName(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm flex-1 min-w-[180px]"
              />
              <input
                type="email"
                placeholder="Official Gov Email (@gov.in)"
                value={newOfficerEmail}
                onChange={(e) => setNewOfficerEmail(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm flex-1 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Ministry / Department"
                value={newOfficerDept}
                onChange={(e) => setNewOfficerDept(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm w-48"
              />
              <button
                type="submit"
                className="bg-[#138808] hover:bg-[#0f6b06] text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Officer
              </button>
            </form>

            <div className="divide-y divide-[#dee2e6]">
              {users.map((u) => (
                <div key={u.id} className="px-6 py-4 flex flex-wrap items-center gap-4 hover:bg-[#f8f9fa] transition-colors">
                  <div className="w-10 h-10 rounded bg-[#e3f2fd] border border-[#003c8f] flex items-center justify-center text-xs font-bold text-[#003c8f] font-display uppercase">
                    {u.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-bold text-[#212529] font-body m-0">{u.name}</p>
                    <p className="text-xs text-[#6c757d] font-body m-0">
                      {u.email} · {u.designation} ({u.department})
                    </p>
                  </div>
                  <div className="w-32 font-mono text-xs text-[#003c8f] hidden md:block">{u.id}</div>
                  <div className="w-28">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        u.status === 'active'
                          ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]'
                          : 'bg-[#e2e3e5] text-[#383d41] border border-[#d6d8db]'
                      }`}
                      title="Click to toggle status"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'active' ? 'bg-[#155724]' : 'bg-[#383d41]'
                        }`}
                      />
                      {u.status}
                    </button>
                  </div>
                  <div className="w-28 text-xs font-bold text-[#6c757d] font-body hidden md:block text-right">
                    {u.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
