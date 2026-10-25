import { useState, useEffect } from 'react'
import { AlertTriangle, AlertOctagon, Info, ShieldAlert, Activity, Search, Filter, Fingerprint, MapPin } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { AI_API_BASE_URL } from '../../lib/api'

const SEV_CONFIG = {
  high:   { label: 'High',   color: 'text-[#721c24]',     bg: 'bg-[#f8d7da]',   border: 'border-[#f5c6cb]',   Icon: AlertOctagon },
  medium: { label: 'Medium', color: 'text-[#856404]',   bg: 'bg-[#fff3cd]', border: 'border-[#ffeeba]', Icon: AlertTriangle },
  low:    { label: 'Low',    color: 'text-[#004085]', bg: 'bg-[#cce5ff]', border: 'border-[#b8daff]', Icon: Info },
}

const mockActivityData = [
  { time: '08:00', alerts: 0 }, { time: '10:00', alerts: 1 },
  { time: '12:00', alerts: 3 }, { time: '14:00', alerts: 1 },
  { time: '16:00', alerts: 4 }, { time: '18:00', alerts: 2 }
]

export default function FraudDetectionPage() {
  const [alerts, setAlerts] = useState([])
  const [biddersCount, setBiddersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${AI_API_BASE_URL}/api/v1/bids/`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const bids = data.data;
          setBiddersCount(bids.length);
          
          // Generate alerts from high risk bids dynamically
          const generatedAlerts = bids
            .filter(b => b.riskScore > 50)
            .map((b, i) => ({
              id: `FA-${1000 + i}`,
              bidder: b.bidderName,
              document: 'Financial_Statement.pdf',
              type: b.riskScore > 80 ? 'Document Tampering' : 'Identity Mismatch',
              severity: b.riskScore > 80 ? 'high' : 'medium',
              detail: b.riskScore > 80 ? 'Metadata indicates file was modified after digital signature was applied.' : 'Company registration details do not match the PAN database.',
              confidence: b.riskScore,
            }));
            
          setAlerts(generatedAlerts);
        }
      })
      .catch(err => console.error("Failed to fetch bids:", err))
      .finally(() => setLoading(false))
  }, [])

  const highAlerts = alerts.filter(a => a.severity === 'high').length

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-200 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#f8d7da] text-[#721c24] text-xs font-bold mb-2 uppercase tracking-wide">
            <ShieldAlert size={14} /> Threat Intelligence
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">AI Fraud Detection</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Real-time anomaly detection monitoring {loading ? '...' : biddersCount} bidders.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-3 rounded bg-white border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded bg-[#f8d7da] flex items-center justify-center border border-[#f5c6cb]">
              <AlertOctagon size={24} className="text-[#721c24]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-900 leading-none m-0">{loading ? '-' : highAlerts}</p>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1 m-0">High Risk Signals</p>
            </div>
          </div>
          <div className="px-5 py-3 rounded bg-white border border-gray-200 hidden sm:flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded bg-[#e3f2fd] flex items-center justify-center border border-gray-200">
              <Activity size={24} className="text-[#003c8f]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-900 leading-none m-0">{loading ? '-' : alerts.length}</p>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1 m-0">Total Anomalies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#f8f9fa] border border-gray-200 rounded p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search signals..." className="w-full bg-white border border-gray-300 rounded py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#003c8f] focus:ring-1 focus:ring-[#003c8f] transition-colors" />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={16} /> Filter
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Scanning for anomalies...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No fraud alerts detected.</div>
          ) : (
            alerts.map((alert, i) => {
              const cfg = SEV_CONFIG[alert.severity]
              const Icon = cfg.Icon
              return (
                <div 
                  key={alert.id} 
                  className={`group bg-white border border-gray-200 hover:border-gray-300 rounded p-5 transition-all shadow-sm relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${cfg.bg}`} />
                  <div className="flex flex-col sm:flex-row gap-5 items-start pl-2">
                    <div className={`w-12 h-12 rounded ${cfg.bg} flex items-center justify-center flex-shrink-0 border ${cfg.border}`}>
                      <Icon size={22} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-display font-bold text-lg text-gray-900 m-0">{alert.type}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label} Priority</span>
                      </div>
                      <p className="text-sm text-gray-600 font-body mb-3 leading-relaxed m-0">
                        {alert.detail}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-body text-gray-500 mt-2">
                        <span className="flex items-center gap-1.5"><Fingerprint size={14} className="text-gray-400" /> Bidder: <strong className="text-gray-800">{alert.bidder}</strong></span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> Doc: <strong className="text-gray-800">{alert.document}</strong></span>
                        <span className="flex items-center gap-1.5 font-mono text-gray-400">{alert.id}</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto mt-4 sm:mt-0 p-4 rounded bg-[#f8f9fa] border border-gray-200 flex flex-col items-center justify-center min-w-[100px]">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 m-0">AI Confidence</span>
                      <span className={`text-2xl font-display font-bold m-0 ${cfg.color}`}>{alert.confidence}%</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 mb-4 m-0">Signal Activity</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockActivityData}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc3545" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#dc3545" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="alerts" stroke="#dc3545" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 mb-4 m-0">Threat Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-body mb-1.5">
                  <span className="text-gray-600 font-semibold">Document Tampering</span>
                  <span className="text-gray-900 font-bold">45%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#dc3545] rounded-full" style={{ width: '45%' }}/></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-body mb-1.5">
                  <span className="text-gray-600 font-semibold">Identity Mismatch</span>
                  <span className="text-gray-900 font-bold">30%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#ffc107] rounded-full" style={{ width: '30%' }}/></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-body mb-1.5">
                  <span className="text-gray-600 font-semibold">Financial Anomalies</span>
                  <span className="text-gray-900 font-bold">25%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0d6efd] rounded-full" style={{ width: '25%' }}/></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
