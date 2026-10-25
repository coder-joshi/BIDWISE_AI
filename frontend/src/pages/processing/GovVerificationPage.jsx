import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { AI_API_BASE_URL } from '../../lib/api'

const GOV_DATABASES = [
  { id: 'gstn',     name: 'GSTN Portal',    description: 'GST Network verification', icon: '🏛️', status: 'active' },
  { id: 'pan',      name: 'Income Tax PAN', description: 'PAN card validation via IT Dept', icon: '📋', status: 'active' },
  { id: 'mca21',    name: 'MCA21',          description: 'Ministry of Corporate Affairs', icon: '🏢', status: 'active' },
  { id: 'udyam',    name: 'Udyam Portal',   description: 'MSME registration verification', icon: '⚙️', status: 'active' },
  { id: 'epfo',     name: 'EPFO',           description: 'Employee provident fund registry', icon: '👥', status: 'active' },
  { id: 'esic',     name: 'ESIC',           description: 'Employee state insurance check', icon: '🏥', status: 'active' },
  { id: 'digilocker', name: 'DigiLocker',   description: 'Document authenticity via Aadhaar', icon: '🔒', status: 'active' },
]

const VERIFICATIONS = [
  { db: 'gstn',       status: 'match',     detail: 'GST 27AABCB1234F1Z5 active. Returns filed. No dues.', timestamp: '2026-08-28 09:16:02' },
  { db: 'pan',        status: 'match',     detail: 'PAN AABCB1234F linked. Entity: Bharat Engineering Solutions Pvt. Ltd.', timestamp: '2026-08-28 09:16:08' },
  { db: 'mca21',      status: 'match',     detail: 'CIN U31200MH2008PTC183921 active. No strikes off.', timestamp: '2026-08-28 09:16:14' },
  { db: 'udyam',      status: 'match',     detail: 'UDYAM-MH-01-0012345 registered. Category: Small Enterprise.', timestamp: '2026-08-28 09:16:19' },
  { db: 'epfo',       status: 'match',     detail: 'MH/MUM/012345 active. 42 employees enrolled.', timestamp: '2026-08-28 09:16:24' },
  { db: 'esic',       status: 'match',     detail: 'ES/MH/MUMB/0012345/000 active. Coverage current.', timestamp: '2026-08-28 09:16:29' },
  { db: 'digilocker', status: 'pending',   detail: 'DigiLocker fetch pending — PAN–Aadhaar link not confirmed.', timestamp: '2026-08-28 09:16:35' },
]

export default function GovVerificationPage() {
  const [bidder, setBidder] = useState({ name: 'Loading...' })

  useEffect(() => {
    fetch(`${AI_API_BASE_URL}/api/v1/bids/BID-2026-0841`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setBidder({ name: data.data.bidderName })
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Government Verification</h1>
        <p className="text-gem-muted font-body text-sm mt-1">{bidder.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {VERIFICATIONS.map((v) => {
          const db = GOV_DATABASES.find(d => d.id === v.db)
          const isMatch = v.status === 'match'
          const isPending = v.status === 'pending'
          return (
            <div key={v.db} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">{db?.icon}</div>
                  <h3 className="font-display font-semibold text-gem-white text-sm">{db?.name}</h3>
                  <p className="text-xs text-gem-muted font-body">{db?.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`status-dot ${isMatch ? 'status-dot-green' : isPending ? 'status-dot-amber' : 'status-dot-red'}`} />
                  <span className={`text-xs font-semibold font-body ${isMatch ? 'text-gem-green-light' : isPending ? 'text-gem-amber' : 'text-gem-red'}`}>
                    {isMatch ? 'Active' : isPending ? 'Pending' : 'Mismatch'}
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 text-xs font-body mb-3 ${
                isMatch ? 'bg-gem-green/8 border border-gem-green/20' :
                isPending ? 'bg-gem-amber/8 border border-gem-amber/20' :
                'bg-gem-red/8 border border-gem-red/20'
              }`}>
                <span className={isMatch ? 'text-gem-green-light' : isPending ? 'text-gem-amber' : 'text-gem-red'}>
                  {v.detail}
                </span>
              </div>
              <p className="text-[10px] font-mono text-gem-muted">Verified: {v.timestamp}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
