import { useState, useEffect } from 'react'
import { ShieldAlert, Activity, AlertTriangle, ShieldCheck, PieChart, Info } from 'lucide-react'
import { fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'
import { useLanguage, t as globalT } from '../../store/languageStore'

const ICON_MAP = {
  ShieldCheck,
  ShieldAlert,
  Activity,
  PieChart,
  AlertTriangle,
}

function RiskGauge({ score }) {
  const angle = (score / 100) * 180 - 90
  const color = score <= 30 ? '#138808' : score <= 60 ? '#f59e0b' : '#dc3545'
  const label = score <= 30 ? globalT('low_risk', 'Low Risk') : score <= 60 ? globalT('medium_risk', 'Medium Risk') : globalT('high_risk', 'High Risk')
  const r = 100, cx = 150, cy = 130
  const needleX = cx + r * 0.75 * Math.cos((angle * Math.PI) / 180)
  const needleY = cy + r * 0.75 * Math.sin((angle * Math.PI) / 180)

  return (
    <div className="flex flex-col items-center">
      <svg width="300" height="160" viewBox="0 0 300 160">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#138808" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#dc3545" />
          </linearGradient>
        </defs>
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#374151" />
        <text x="35" y={cy+25} fill="#138808" fontSize="12" fontFamily="Inter" fontWeight="600">Low</text>
        <text x="150" y="20"    fill="#f59e0b" fontSize="12" fontFamily="Inter" fontWeight="600" textAnchor="middle">Mid</text>
        <text x="265" y={cy+25} fill="#dc3545" fontSize="12" fontFamily="Inter" fontWeight="600" textAnchor="end">High</text>
      </svg>
      <div className="text-center -mt-4">
        <div className="font-display font-bold text-6xl drop-shadow-sm" style={{ color }}>{score}</div>
        <div className="text-sm font-bold mt-1 font-body uppercase tracking-widest" style={{ color }}>{label}</div>
      </div>
    </div>
  )
}

export default function RiskAnalysisPage() {
  const { selectedBidId, setSelectedBidId } = useUIStore()
  const { t } = useLanguage()
  const [bids, setBids] = useState([])
  const [bidder, setBidder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchBidsFromDb(selectedBidId)
      .then(({ bids: allBids, activeBid }) => {
        setBids(allBids)
        setBidder(activeBid)
        if (activeBid && !selectedBidId) {
          setSelectedBidId(activeBid.id)
        }
      })
      .catch(err => console.error("Failed to fetch bid details:", err))
      .finally(() => setLoading(false))
  }, [selectedBidId, setSelectedBidId])

  if (loading) return <div className="p-10 text-center text-gray-500">Loading risk data...</div>
  if (!bidder) return <div className="p-10 text-center text-red-500">Failed to load bidder data</div>

  const riskScore = bidder.riskScore ?? 0
  const riskFactors = bidder.riskFactors || []
  const rec = bidder.aiRecommendation || {
    verdict: riskScore <= 30 ? 'APPROVE' : riskScore <= 60 ? 'REVIEW' : 'REJECT',
    level: riskScore <= 30 ? 'low' : riskScore <= 60 ? 'medium' : 'high',
    summary: riskScore <= 30
      ? 'Bidder poses a low systemic risk. All major compliance constraints are satisfied with high confidence. Recommended for technical qualification.'
      : 'Bidder presents elevated compliance or forensic risk signals. Manual TEC review or rejection is advised.'
  }

  const recStyles = rec.level === 'low'
    ? 'bg-[#d4edda] border-[#c3e6cb] text-[#155724]'
    : rec.level === 'medium'
    ? 'bg-[#fff3cd] border-[#ffeeba] text-[#856404]'
    : 'bg-[#f8d7da] border-[#f5c6cb] text-[#721c24]'

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-200 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#fff3cd] text-[#856404] text-xs font-bold mb-2 uppercase tracking-wide">
            <ShieldAlert size={14} /> {t('risk_assessment', 'Risk Assessment')}
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">{t('ai_risk_analysis', 'AI Risk Analysis')}</h1>
          <p className="text-gray-600 font-body text-sm mt-1 m-0">
            {t('risk_profiling_for', 'Comprehensive multi-factor risk profiling for')} <span className="font-bold text-gray-900">{bidder.bidderName}</span> · <span className="font-mono text-xs">{bidder.id}</span>
          </p>
        </div>

        {bids.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="risk-bidder-select" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('active_bid', 'Active Bid:')}
            </label>
            <select
              id="risk-bidder-select"
              value={bidder.id}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#003c8f]"
            >
              {bids.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bidderName} ({b.id}) — Risk {b.riskScore}/100
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm">
            <RiskGauge score={riskScore} />
            <p className="text-xs text-gray-500 font-body mt-8 text-center max-w-xs leading-relaxed m-0">
              Score is dynamically calculated from document forensics, statutory GST/Udyam registries, financial turnover, and tender clause evaluations.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 mb-4 m-0 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info size={18} className="text-[#003c8f]" /> {t('ai_recommendation', 'AI Recommendation')}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded border font-bold uppercase tracking-wider ${recStyles}`}>
                {rec.verdict}
              </span>
            </h3>
            <div className={`p-4 rounded border ${recStyles}`}>
              <p className="text-sm font-body font-bold leading-relaxed m-0">
                {rec.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded p-6 lg:p-8 shadow-sm">
            <h3 className="font-display font-bold text-lg text-gray-900 mb-6 m-0">{t('risk_breakdown', 'Risk Factor Breakdown')}</h3>
            <div className="space-y-6">
              {riskFactors.map((f) => {
                const percentage = Math.min(100, Math.round((f.score / f.weight) * 100))
                const Icon = ICON_MAP[f.iconName] || ShieldCheck
                const isFail = f.status === 'fail'
                const isWarn = f.status === 'warn'
                const colorClass = isFail ? 'text-[#dc3545]' : isWarn ? 'text-[#f59e0b]' : 'text-[#138808]'
                const bgClass = isFail ? 'bg-[#f8d7da]' : isWarn ? 'bg-[#fff3cd]' : 'bg-[#d4edda]'
                const barHex = isFail ? '#dc3545' : isWarn ? '#f59e0b' : '#138808'

                return (
                  <div key={f.factor} className="group">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded ${bgClass} flex items-center justify-center flex-shrink-0 border border-gray-200`}>
                        <Icon size={18} className={colorClass} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 font-body m-0">{f.factor}</h4>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold m-0">Weight: {f.weight}%</span>
                          </div>
                          <span className={`text-lg font-display font-bold m-0 ${colorClass}`}>{f.score}<span className="text-xs text-gray-400 font-body">/{f.weight}</span></span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%`, backgroundColor: barHex }} 
                          />
                        </div>
                        <p className="text-xs text-gray-600 font-body m-0 mt-1">{f.note}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
