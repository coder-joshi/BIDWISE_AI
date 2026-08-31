import { BIDDERS } from '../../data/dummyData'

function RiskGauge({ score }) {
  const angle = (score / 100) * 180 - 90
  const color = score <= 30 ? '#0D9F6F' : score <= 60 ? '#F59E0B' : '#EF4444'
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Medium Risk' : 'High Risk'
  const r = 70, cx = 100, cy = 90
  const start = { x: cx - r, y: cy }
  const end   = { x: cx + r, y: cy }
  const needleX = cx + r * 0.75 * Math.cos((angle * Math.PI) / 180)
  const needleY = cy + r * 0.75 * Math.sin((angle * Math.PI) / 180)

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0D9F6F" />
            <stop offset="50%"  stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
        {/* Fill */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="white" />
        {/* Labels */}
        <text x="28" y={cy+18} fill="#0D9F6F" fontSize="10" fontFamily="Inter">Low</text>
        <text x="90" y="22"    fill="#F59E0B" fontSize="10" fontFamily="Inter" textAnchor="middle">Mid</text>
        <text x="162" y={cy+18} fill="#EF4444" fontSize="10" fontFamily="Inter">High</text>
      </svg>
      <div className="text-center -mt-2">
        <div className="font-display font-bold text-5xl" style={{ color }}>{score}</div>
        <div className="text-sm font-semibold mt-1 font-body" style={{ color }}>{label}</div>
      </div>
    </div>
  )
}

const RISK_FACTORS = [
  { factor: 'Document Authenticity',   weight: 30, score: 9,  note: 'All documents appear genuine. No tampering detected.' },
  { factor: 'GST Compliance',          weight: 20, score: 4,  note: 'GST active, returns filed, no outstanding dues.' },
  { factor: 'Financial Stability',     weight: 20, score: 5,  note: 'Turnover ₹28.4 Cr meets threshold. Solvency verified.' },
  { factor: 'Experience Match',        weight: 15, score: 3,  note: 'Railway project experience confirmed for 12 years.' },
  { factor: 'Regulatory Compliance',   weight: 10, score: 2,  note: 'EPFO, ESIC filings current. No violations found.' },
  { factor: 'DigiLocker Verification', weight: 5,  score: 0,  note: 'PAN–Aadhaar link unconfirmed. Minor risk.' },
]

export default function RiskAnalysisPage() {
  const bidder = BIDDERS.A
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Risk Analysis</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-8 flex items-center justify-center">
          <RiskGauge score={bidder.riskScore} />
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-gem-white">Risk Factor Breakdown</h3>
          {RISK_FACTORS.map((f) => (
            <div key={f.factor}>
              <div className="flex justify-between text-xs font-body mb-1">
                <span className="text-gem-muted">{f.factor} <span className="text-gem-muted/50">({f.weight}%)</span></span>
                <span className="text-gem-white font-semibold">{f.score}/{f.weight}</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-gem-green-light rounded-full" style={{ width: `${(f.score / f.weight) * 100}%` }} />
              </div>
              <p className="text-[10px] text-gem-muted font-body mt-1">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
