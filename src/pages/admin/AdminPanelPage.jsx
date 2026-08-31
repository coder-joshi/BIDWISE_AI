import { useState } from 'react'
import { Users, FileText, Settings, Globe, List, Shield } from 'lucide-react'
import { HISTORY, OFFICER } from '../../data/dummyData'
import { StatusBadge } from '../../components/ui/Badge'

const TABS = [
  { id: 'users',     label: 'Users',           Icon: Users },
  { id: 'templates', label: 'Tender Templates', Icon: FileText },
  { id: 'rules',    label: 'Compliance Rules',  Icon: Settings },
  { id: 'apis',     label: 'Government APIs',   Icon: Globe },
  { id: 'logs',     label: 'System Logs',       Icon: List },
]

const USERS = [
  { ...OFFICER, status: 'active', lastActive: '2 mins ago' },
  { id: 'PO-2026-0039', name: 'Meera Pillai', email: 'meera.pillai@railways.gov.in', role: 'procurement_officer', designation: 'Procurement Officer', department: 'Ministry of Railways', status: 'active', lastActive: '1 hr ago' },
  { id: 'PO-2026-0033', name: 'Suresh Gupta', email: 'suresh.gupta@moca.gov.in', role: 'procurement_officer', designation: 'Procurement Officer', department: 'Ministry of Civil Aviation', status: 'inactive', lastActive: '2 days ago' },
]

const APIS = [
  { name: 'GSTN API', endpoint: 'api.gst.gov.in/v3', status: 'online', latency: '142ms', uptime: '99.9%' },
  { name: 'MCA21 API', endpoint: 'efiling.mca.gov.in/api/v2', status: 'online', latency: '218ms', uptime: '99.7%' },
  { name: 'Udyam API', endpoint: 'udyamregistration.gov.in/api', status: 'online', latency: '189ms', uptime: '99.8%' },
  { name: 'EPFO API', endpoint: 'unifiedportal-emp.epfindia.gov.in/api', status: 'online', latency: '301ms', uptime: '98.2%' },
  { name: 'DigiLocker API', endpoint: 'api.digitallocker.gov.in/public', status: 'degraded', latency: '1240ms', uptime: '94.1%' },
]

const LOGS = [
  { time: '09:16:35', level: 'INFO', msg: 'Verification completed: BID-2026-0841 · Score 94' },
  { time: '09:16:29', level: 'WARN', msg: 'DigiLocker API response slow: 1240ms latency' },
  { time: '09:15:12', level: 'ERROR', msg: 'ESIC API timeout on BID-2026-0843 — retrying' },
  { time: '09:14:44', level: 'INFO', msg: 'Fraud alert generated: FA-001 · Rajveer Tech Solutions' },
  { time: '09:12:00', level: 'INFO', msg: 'Upload received: BID-2026-0843 · 5 documents' },
]

export default function AdminPanelPage() {
  const [tab, setTab] = useState('users')

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gem-white">Admin Panel</h1>
        <p className="text-gem-muted font-body text-sm mt-1">Platform management</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 glass-card inline-flex rounded-xl">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${
              tab === id ? 'bg-gem-blue text-white shadow-sm' : 'text-gem-muted hover:text-gem-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'users' && (
        <div className="glass-card divide-y divide-white/5">
          {USERS.map((u) => (
            <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gem-blue to-gem-green flex items-center justify-center text-xs font-bold text-white font-display">
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gem-white font-body">{u.name}</p>
                <p className="text-xs text-gem-muted font-body">{u.email} · {u.designation}</p>
              </div>
              <span className="font-mono text-xs text-gem-muted">{u.id}</span>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${u.status === 'active' ? 'text-gem-green-light' : 'text-gem-muted'}`}>
                <div className={`status-dot ${u.status === 'active' ? 'status-dot-green' : ''}`} />
                {u.status}
              </div>
              <span className="text-xs text-gem-muted font-body hidden md:block">{u.lastActive}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'apis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {APIS.map((api) => (
            <div key={api.name} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Globe size={16} className="text-gem-blue-light" />
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${api.status === 'online' ? 'text-gem-green-light' : 'text-gem-amber'}`}>
                  <div className={`status-dot ${api.status === 'online' ? 'status-dot-green' : 'status-dot-amber'}`} />
                  {api.status}
                </div>
              </div>
              <h3 className="font-display font-semibold text-gem-white text-sm mb-1">{api.name}</h3>
              <p className="font-mono text-[10px] text-gem-muted mb-3">{api.endpoint}</p>
              <div className="flex justify-between text-xs font-body">
                <span className="text-gem-muted">Latency: <span className="text-gem-white">{api.latency}</span></span>
                <span className="text-gem-muted">Uptime: <span className={api.uptime.startsWith('99') ? 'text-gem-green-light' : 'text-gem-amber'}>{api.uptime}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div className="glass-card font-mono text-xs divide-y divide-white/5">
          {LOGS.map((log, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-white/3">
              <span className="text-gem-muted w-16 flex-shrink-0">{log.time}</span>
              <span className={`w-12 flex-shrink-0 font-semibold ${
                log.level === 'ERROR' ? 'text-gem-red' : log.level === 'WARN' ? 'text-gem-amber' : 'text-gem-blue-light'
              }`}>{log.level}</span>
              <span className="text-gem-muted">{log.msg}</span>
            </div>
          ))}
        </div>
      )}

      {(tab === 'templates' || tab === 'rules') && (
        <div className="glass-card p-12 text-center">
          <Shield size={32} className="text-gem-muted mx-auto mb-3" />
          <p className="text-gem-muted font-body">
            {tab === 'templates' ? 'Tender template management' : 'Compliance rule editor'} — coming in Phase 7.
          </p>
        </div>
      )}
    </div>
  )
}
