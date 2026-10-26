import { useState, useEffect } from 'react'
import { fetchBidsFromDb } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

const GOV_DATABASES = [
  { id: 'gstn',       name: 'GSTN Portal',    description: 'GST Network verification', icon: '🏛️' },
  { id: 'pan',        name: 'Income Tax PAN', description: 'PAN card validation via IT Dept', icon: '📋' },
  { id: 'mca21',      name: 'MCA21',          description: 'Ministry of Corporate Affairs', icon: '🏢' },
  { id: 'udyam',      name: 'Udyam Portal',   description: 'MSME registration verification', icon: '⚙️' },
  { id: 'epfo',       name: 'EPFO',           description: 'Employee provident fund registry', icon: '👥' },
  { id: 'esic',       name: 'ESIC',           description: 'Employee state insurance check', icon: '🏥' },
  { id: 'digilocker', name: 'DigiLocker',     description: 'Document authenticity via Aadhaar', icon: '🔒' },
]

export default function GovVerificationPage() {
  const { selectedBidId, setSelectedBidId } = useUIStore()
  const [bids, setBids] = useState([])
  const [bidder, setBidder] = useState(null)

  useEffect(() => {
    fetchBidsFromDb(selectedBidId)
      .then(({ bids: allBids, activeBid }) => {
        setBids(allBids)
        setBidder(activeBid)
        if (activeBid && !selectedBidId) {
          setSelectedBidId(activeBid.id)
        }
      })
      .catch(err => console.error(err))
  }, [selectedBidId, setSelectedBidId])

  const verifications = bidder?.verifications || []

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Government Verification</h1>
          <p className="text-gem-muted font-body text-sm mt-1">
            {bidder?.bidderName || 'Loading...'} · <span className="font-mono">{bidder?.id || ''}</span>
          </p>
        </div>
        {bids.length > 0 && (
          <select
            value={bidder?.id || ''}
            onChange={(e) => setSelectedBidId(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#003c8f]"
          >
            {bids.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bidderName} ({b.id})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {verifications.map((v) => {
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
