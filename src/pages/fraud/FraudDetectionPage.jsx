import { AlertTriangle, AlertOctagon, Info } from 'lucide-react'
import { FRAUD_ALERTS, BIDDERS } from '../../data/dummyData'
import { Badge } from '../../components/ui/Badge'

const SEV_CONFIG = {
  high:   { label: 'High',   color: 'text-gem-red',     bg: 'bg-gem-red/10',   border: 'border-gem-red/25',   Icon: AlertOctagon },
  medium: { label: 'Medium', color: 'text-gem-amber',   bg: 'bg-gem-amber/10', border: 'border-gem-amber/25', Icon: AlertTriangle },
  low:    { label: 'Low',    color: 'text-gem-blue-light', bg: 'bg-gem-blue/10', border: 'border-gem-blue/25', Icon: Info },
}

export default function FraudDetectionPage() {
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Fraud Detection</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{FRAUD_ALERTS.length} signals detected across 3 bidders</p>
      </div>

      <div className="space-y-4">
        {FRAUD_ALERTS.map((alert) => {
          const cfg = SEV_CONFIG[alert.severity]
          const Icon = cfg.Icon
          return (
            <div key={alert.id} className={`glass-card p-5 border ${cfg.border}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-display font-semibold text-sm ${cfg.color}`}>{alert.type}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label} Severity</span>
                    <span className="font-mono text-[10px] text-gem-muted">{alert.id}</span>
                  </div>
                  <p className="text-xs text-gem-muted font-body mb-2">
                    Document: <span className="text-gem-white font-medium">{alert.document}</span> · Bidder: <span className="text-gem-white font-medium">{alert.bidder}</span>
                  </p>
                  <p className="text-sm text-gem-muted font-body">{alert.detail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gem-muted font-body">Confidence</div>
                  <div className={`font-display font-bold text-xl ${cfg.color}`}>{alert.confidence}%</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
