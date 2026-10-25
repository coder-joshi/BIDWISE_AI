import { useState, useEffect } from 'react'
import { LayoutDashboard, TrendingUp, FileCheck, AlertTriangle, Zap, Activity, ArrowUpRight } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { AI_API_BASE_URL } from '../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 p-3 rounded shadow-md text-xs font-body">
      <p className="text-gray-600 mb-1.5 font-bold">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span className="capitalize">{p.name}</span>
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [bids, setBids] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bidsRes, dashRes] = await Promise.all([
          fetch(`${AI_API_BASE_URL}/api/v1/bids/`),
          fetch(`${AI_API_BASE_URL}/api/v1/dashboard/`)
        ])
        
        const bidsData = await bidsRes.json()
        const dashData = await dashRes.json()
        
        if (bidsData.status === 'success') {
          setBids(bidsData.data)
        }
        if (dashData.status === 'success') {
          setDashboardData(dashData.data)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Dynamic KPIs
  const totalBids = bids.length
  const pendingBids = bids.filter(b => b.status === 'processing').length
  const verifiedBids = bids.filter(b => b.status === 'verified').length
  const highRiskBids = bids.filter(b => b.riskScore > 50).length

  const avgCompliance = totalBids > 0 
    ? Math.round(bids.reduce((acc, curr) => acc + (curr.complianceScore || 0), 0) / totalBids) 
    : 0

  const KPI_CARDS = [
    {
      label: 'Total Bids',
      value: totalBids,
      icon: FileCheck,
      color: 'text-[#003c8f]',
      bg: 'bg-[#e3f2fd]',
      trend: `${totalBids} in system`,
      trendUp: true,
    },
    {
      label: 'Pending Verification',
      value: pendingBids,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      trend: `${pendingBids} currently processing`,
      trendUp: false,
    },
    {
      label: 'Verified Bids',
      value: verifiedBids,
      icon: FileCheck,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: `${avgCompliance}% avg compliance rate`,
      trendUp: true,
    },
    {
      label: 'High Risk Bids',
      value: highRiskBids,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      trend: 'Requires manual review',
      trendUp: false,
    },
  ]

  return (
    <div className="animate-fade-in w-full space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Dashboard Overview</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            Welcome back, {user?.name || 'Officer'} · {user?.department || 'Department'}
          </p>
        </div>
        <Link to="/upload">
          <button className="bg-[#003c8f] hover:bg-[#002b66] text-white px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2 transition-colors">
            <Zap size={16} /> New Verification
          </button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div 
              key={card.label} 
              className="bg-white border border-gray-200 rounded p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center ${card.bg}`}>
                  <Icon size={20} className={card.color} />
                </div>
                {card.trendUp ? (
                  <ArrowUpRight size={18} className="text-green-600" />
                ) : (
                  <ArrowUpRight size={18} className="text-amber-500 rotate-90" />
                )}
              </div>
              <div className="font-display font-bold text-3xl text-gray-900 mb-1">
                {loading ? '...' : card.value}
              </div>
              <div className="text-sm text-gray-600 font-body mb-2">{card.label}</div>
              <div className={`text-xs font-body font-medium ${card.trendUp ? 'text-green-600' : 'text-amber-600'}`}>
                {card.trend}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — monthly bids */}
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg m-0">Activity Overview</h3>
              <p className="text-sm text-gray-500 mt-1 m-0">Verified vs Failed vs Pending</p>
            </div>
            <div className="px-3 py-1 text-xs font-medium bg-gray-100 border border-gray-200 rounded-full text-gray-600">
              Last 6 months
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dashboardData?.monthlyChart || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#138808" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#138808" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc3545" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#dc3545" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
                iconType="circle" 
                formatter={(value) => <span className="text-gray-700 font-medium capitalize">{value}</span>}
              />
              <Area type="monotone" dataKey="verified" stroke="#138808" fill="url(#gradVerified)" strokeWidth={2} dot={{ r: 3, fill: '#138808', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="failed" stroke="#dc3545" fill="url(#gradFailed)" strokeWidth={2} dot={{ r: 3, fill: '#dc3545', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="pending" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution bar */}
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-display font-bold text-gray-900 text-lg m-0">Risk Distribution</h3>
            <p className="text-sm text-gray-500 mt-1 m-0">Current active bids</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dashboardData?.riskDistribution || []} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                {(dashboardData?.riskDistribution || []).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-6">
            {(dashboardData?.riskDistribution || []).map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-700">{d.label}</span>
                </div>
                <span className="text-gray-900 font-bold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="font-display font-bold text-gray-900 text-lg m-0">Recent Activity</h3>
          <Link to="/history" className="text-sm text-[#003c8f] hover:underline font-semibold">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading recent bids...</div>
          ) : bids.length === 0 ? (
             <div className="px-6 py-8 text-center text-gray-500">No recent bids found.</div>
          ) : (
            bids.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="px-6 py-4 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  item.status === 'verified' ? 'bg-[#138808]' :
                  item.status === 'failed' ? 'bg-red-500' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.bidderName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Compliance Score: {item.complianceScore} · <span className="font-mono text-gray-600">{item.tenderId}</span>
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold font-mono text-gray-900">{item.riskScore}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Risk Score</div>
                </div>
                <div className="hidden md:block">
                  <StatusBadge status={item.status} />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap hidden lg:block w-24 text-right">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
