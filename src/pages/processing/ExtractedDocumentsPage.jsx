import { CheckCircle2, XCircle, Clock, FileText, ExternalLink } from 'lucide-react'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { BIDDERS } from '../../data/dummyData'

const DOCUMENTS = [
  { id: 'gst', name: 'GST Registration Certificate', number: '27AABCB1234F1Z5', issuer: 'GSTN Portal', status: 'verified', extractedOn: '2026-08-28', validUntil: 'Perpetual' },
  { id: 'pan', name: 'PAN Card', number: 'AABCB1234F', issuer: 'Income Tax Department', status: 'verified', extractedOn: '2026-08-28', validUntil: 'Perpetual' },
  { id: 'udyam', name: 'Udyam Registration Certificate', number: 'UDYAM-MH-01-0012345', issuer: 'Ministry of MSME', status: 'verified', extractedOn: '2026-08-28', validUntil: 'Perpetual' },
  { id: 'iso', name: 'ISO 9001:2015 Certificate', number: 'ISO-MH-2024-77291', issuer: 'TÜV SÜD South Asia', status: 'verified', extractedOn: '2026-08-28', validUntil: 'Dec 2026' },
  { id: 'exp', name: 'Experience Certificate', number: 'EXP-CRY-2024-0042', issuer: 'Central Railway, Mumbai Division', status: 'verified', extractedOn: '2026-08-28', validUntil: 'N/A' },
  { id: 'bank', name: 'Bank Solvency Letter', number: 'SBI/MUM/SOL/2026/8812', issuer: 'State Bank of India, Fort Branch', status: 'verified', extractedOn: '2026-08-28', validUntil: '2026-10-31' },
  { id: 'oem', name: 'OEM Authorization Letter', number: 'SML/OEM/2026/IND/0034', issuer: 'Siemens Mobility GmbH', status: 'verified', extractedOn: '2026-08-28', validUntil: '2027-03-31' },
]

export default function ExtractedDocumentsPage() {
  const navigate = useNavigate()
  const bidder = BIDDERS.A

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gem-white">Extracted Documents</h1>
          <p className="text-gem-muted font-body text-sm mt-1">
            {bidder.name} · <span className="font-mono">{bidder.id}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/gov-verify')}>
            Gov Verification →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DOCUMENTS.map((doc) => (
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
    </div>
  )
}
