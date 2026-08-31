import { LayoutDashboard, TrendingUp, FileCheck, AlertTriangle, Zap, Activity } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge, RiskBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  DASHBOARD_STATS, RECENT_ACTIVITY, MONTHLY_BIDS_CHART, RISK_DISTRIBUTION, OFFICER
} from '../../data/dummyData'

const KPI_CARDS = [
  {
    label: 'Total Bids',
    value: DASHBOARD_STATS.totalBids,
    icon: FileCheck,
    color: 'text-gem-blue-light',
    bg: 'bg-gem-blue/10',
    trend: '+12 this month',
    trendUp: true,
  },
  {
    label: 'Pending Verification',
    value: DASHBOARD_STATS.pendingVerification,
    icon: Activity,
    color: 'text-gem-amber',
    bg: 'bg-gem-amber/10',
    trend: '3 added today',
    trendUp: false,
  },
  {
    label: 'Verified Bids',
    value: DASHBOARD_STATS.verifiedBids,
    icon: FileCheck,
    color: 'text-gem-green-light',
    bg: 'bg-gem-green/10',
    trend: `${DASHBOARD_STATS.complianceRate}% compliance rate`,
    trendUp: true,
  },
  {
    label: 'High Risk Bids',
    value: DASHBOARD_STATS.highRiskBids,
    icon: AlertTriangle,
    color: 'text-gem-red',
    bg: 'bg-gem-red/10',
    trend: '2 fraud alerts',
    trendUp: false,
  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs font-body">
      <p className="text-gem-muted mb-1.5 font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Dashboard</h1>
          <p className="text-gem-muted font-body text-sm mt-1">
            Welcome back, {OFFICER.name} · {OFFICER.department}
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary" size="md" icon={Zap}>
            New Verification
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
                <TrendingUp size={14} className={card.trendUp ? 'text-gem-green-light' : 'text-gem-red'} />
              </div>
              <div className="font-display font-bold text-3xl text-gem-white mb-1">{card.value}</div>
              <div className="text-sm text-gem-muted font-body">{card.label}</div>
              <div className={`text-xs mt-2 font-body ${card.trendUp ? 'text-gem-green-light' : 'text-gem-amber'}`}>
                {card.trend}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart — monthly bids */}
        <div className="glass-card p-5 col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-gem-white text-base">Monthly Bid Activity</h3>
              <p className="text-xs text-gem-muted font-body mt-0.5">Verified vs Failed vs Pending</p>
            </div>
            <Badge variant="info" label="Last 6 months" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_BIDS_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9F6F" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0D9F6F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter', color: '#64748B' }} />
              <Area type="monotone" dataKey="verified" stroke="#0D9F6F" fill="url(#gradVerified)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="failed" stroke="#EF4444" fill="url(#gradFailed)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="pending" stroke="#F59E0B" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution bar */}
        <div className="glass-card p-5">
          <div className="mb-5">
            <h3 className="font-display font-semibold text-gem-white text-base">Risk Distribution</h3>
            <p className="text-xs text-gem-muted font-body mt-0.5">Current active bids</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RISK_DISTRIBUTION} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {RISK_DISTRIBUTION.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {RISK_DISTRIBUTION.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs font-body">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gem-muted">{d.label}</span>
                </div>
                <span className="text-gem-white font-semibold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h3 className="font-display font-semibold text-gem-white">Recent Activity</h3>
          <Link to="/history">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        <div className="divide-y divide-white/4">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/3 transition-colors">
              <div className={`status-dot flex-shrink-0 ${
                item.status === 'verified' ? 'status-dot-green' :
                item.status === 'failed' ? 'status-dot-red' : 'status-dot-blue'
              } animate-pulse-dot`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gem-white font-body truncate">{item.bidder}</p>
                <p className="text-xs text-gem-muted font-body">
                  {item.action} · <span className="font-mono">{item.tender}</span>
                </p>
              </div>
              {item.score !== null && (
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold font-display text-gem-white">{item.score}</div>
                  <div className="text-[10px] text-gem-muted font-body">score</div>
                </div>
              )}
              <StatusBadge status={item.status} />
              <span className="text-xs text-gem-muted font-body whitespace-nowrap hidden md:block">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
