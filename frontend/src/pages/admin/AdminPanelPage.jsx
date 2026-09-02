import { useState } from 'react'
import { Users, FileText, Settings, Globe, List, Shield, Network } from 'lucide-react'

const TABS = [
  { id: 'users',     label: 'Users',           Icon: Users },
  { id: 'collusion', label: 'Collusion Graph', Icon: Network },
  { id: 'apis',      label: 'Government APIs', Icon: Globe },
  { id: 'logs',      label: 'System Logs',     Icon: List },
]

const USERS = [
  { id: 'PO-2026-0041', name: 'Arjun Sharma', email: 'arjun.sharma@railways.gov.in', role: 'procurement_officer', designation: 'Senior Procurement Officer', department: 'Ministry of Railways', status: 'active', lastActive: '2 mins ago' },
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
    <div className="w-full">
      <div className="mb-8 border-b border-[#dee2e6] pb-6">
        <h1 className="font-display font-bold text-3xl text-[#212529] tracking-tight">System Administration</h1>
        <p className="text-[#6c757d] font-body text-sm mt-1">Platform management, API integrations, and access logs</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white inline-flex rounded border border-[#dee2e6] shadow-sm">
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

      {/* Tab content */}
      <div className="bg-white border border-[#dee2e6] rounded shadow-sm overflow-hidden">
        {tab === 'users' && (
          <div className="divide-y divide-[#dee2e6]">
            <div className="bg-[#f8f9fa] px-6 py-3 border-b border-[#dee2e6] flex items-center font-bold text-xs uppercase text-[#6c757d] tracking-wider">
              <div className="flex-1 ml-14">User Details</div>
              <div className="w-32 hidden md:block">ID</div>
              <div className="w-24">Status</div>
              <div className="w-32 hidden md:block text-right">Last Active</div>
            </div>
            {USERS.map((u) => (
              <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#f8f9fa] transition-colors">
                <div className="w-10 h-10 rounded bg-[#e3f2fd] border border-[#003c8f] flex items-center justify-center text-xs font-bold text-[#003c8f] font-display uppercase">
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#212529] font-body">{u.name}</p>
                  <p className="text-xs text-[#6c757d] font-body">{u.email} · {u.designation}</p>
                </div>
                <div className="w-32 font-mono text-xs text-[#003c8f] hidden md:block">{u.id}</div>
                <div className="w-24">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    u.status === 'active' ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' : 'bg-[#e2e3e5] text-[#383d41] border border-[#d6d8db]'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-[#155724]' : 'bg-[#383d41]'}`} />
                    {u.status}
                  </span>
                </div>
                <div className="w-32 text-xs font-bold text-[#6c757d] font-body hidden md:block text-right">{u.lastActive}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'collusion' && (
          <div className="p-16 flex flex-col items-center justify-center min-h-[400px] bg-[#f8f9fa]">
            <div className="w-16 h-16 rounded-full bg-white border border-[#dee2e6] flex items-center justify-center mb-6 shadow-sm">
              <Network size={32} className="text-[#003c8f]" />
            </div>
            <h3 className="text-[#212529] font-bold font-display text-xl mb-3">Collusion Network Graph</h3>
            <p className="text-[#6c757d] text-sm max-w-md text-center leading-relaxed">
              Visualizing shared directors, IP addresses, and contact details between bidders. 
              <br/><br/>
              <span className="inline-block px-3 py-1 bg-[#fff3cd] text-[#856404] border border-[#ffeeba] rounded font-bold text-xs uppercase tracking-wider">Module Pending Activation</span>
            </p>
          </div>
        )}

        {tab === 'apis' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-[#f8f9fa]">
            {APIS.map((api) => (
              <div key={api.name} className="bg-white border border-[#dee2e6] rounded p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#dee2e6]">
                  <Globe size={20} className="text-[#003c8f]" />
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${api.status === 'online' ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' : 'bg-[#fff3cd] text-[#856404] border border-[#ffeeba]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${api.status === 'online' ? 'bg-[#155724]' : 'bg-[#856404]'}`} />
                    {api.status}
                  </div>
                </div>
                <h3 className="font-display font-bold text-[#212529] text-base mb-1">{api.name}</h3>
                <p className="font-mono text-xs text-[#003c8f] bg-[#e3f2fd] px-2 py-1 rounded border border-[#bbdefb] mb-4 truncate w-max max-w-full">{api.endpoint}</p>
                <div className="flex justify-between text-sm font-body pt-4">
                  <span className="text-[#6c757d] font-bold">Latency: <span className="text-[#212529] font-mono">{api.latency}</span></span>
                  <span className="text-[#6c757d] font-bold">Uptime: <span className={`${api.uptime.startsWith('99') ? 'text-[#138808]' : 'text-[#dc3545]'} font-mono`}>{api.uptime}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'logs' && (
          <div className="font-mono text-xs divide-y divide-[#dee2e6]">
            <div className="bg-[#f8f9fa] px-6 py-3 border-b border-[#dee2e6] flex items-center font-bold text-[10px] uppercase text-[#6c757d] tracking-wider font-body">
              <div className="w-24">Timestamp</div>
              <div className="w-20">Level</div>
              <div className="flex-1">Message</div>
            </div>
            {LOGS.map((log, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#f8f9fa] transition-colors">
                <span className="text-[#6c757d] w-24 flex-shrink-0">{log.time}</span>
                <span className={`w-20 flex-shrink-0 font-bold px-2 py-1 rounded text-center border ${
                  log.level === 'ERROR' ? 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]' : log.level === 'WARN' ? 'bg-[#fff3cd] text-[#856404] border-[#ffeeba]' : 'bg-[#e2e3e5] text-[#383d41] border-[#d6d8db]'
                }`}>{log.level}</span>
                <span className="text-[#212529]">{log.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
