import { useState, useEffect } from 'react'
import { Clock, FileText, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { fetchBidsFromDb } from '../../lib/api'

export default function ExtractedDocumentsPage() {
  const navigate = useNavigate()
  const { processingState, processingError, selectedBidId, setSelectedBidId } = useUIStore()
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
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedBidId, setSelectedBidId])

  const documents = bidder?.documents || []

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Extracted Documents</h1>
          <p className="text-gem-muted font-body text-sm mt-1">
            {bidder?.bidderName || 'Loading...'} · <span className="font-mono">{bidder?.id || '...'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button variant="secondary" size="sm" onClick={() => navigate('/gov-verify')}>
            Gov Verification →
          </Button>
        </div>
      </div>

      {processingState === 'failed' ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-lg font-display font-semibold text-gem-white mb-2">Processing Failed</h2>
          <p className="text-red-400 font-body text-sm mb-6 max-w-md">
            {processingError || 'An error occurred during AI extraction.'}
          </p>
          <Button variant="secondary" size="md" onClick={() => navigate('/upload')}>
            Upload New Package
          </Button>
        </div>
      ) : loading ? (
        <div className="p-10 text-center text-gray-500">Loading extracted documents...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Clock size={24} className="text-gem-muted" />
          </div>
          <h2 className="text-lg font-display font-semibold text-gem-white mb-2">No Documents Available</h2>
          <p className="text-gem-muted font-body text-sm mb-6 max-w-md">
            Please upload a bid package to extract documents.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/upload')}>
            Go to Upload
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gem-blue/15 flex items-center justify-center">
                  <FileText size={18} className="text-gem-blue-light" />
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <h3 className="font-display font-semibold text-gem-white text-sm mb-1">{doc.name}</h3>
              <p className="font-mono text-xs text-gem-blue-light mb-3">{doc.number}</p>
              <div className="space-y-1.5 text-xs font-body">
                <div className="flex justify-between">
                  <span className="text-gem-muted">Issuer</span>
                  <span className="text-gem-white font-medium text-right max-w-[60%]">{doc.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gem-muted">Extracted</span>
                  <span className="text-gem-white">{doc.extractedOn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gem-muted">Valid Until</span>
                  <span className={doc.validUntil === 'Perpetual' || doc.validUntil === 'N/A' ? 'text-gem-muted' : 'text-gem-white'}>{doc.validUntil}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
