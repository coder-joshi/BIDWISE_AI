// ════════════════════════════════════════════════════
//  CONSISTENT DUMMY GOVERNMENT DATA — used across ALL screens
// ════════════════════════════════════════════════════

export const TENDER = {
  id: 'GeM/2026/TENDER/005821',
  title: 'Supply & Installation of Railway Signalling Equipment',
  department: 'Ministry of Railways',
  division: 'Electrical Division — Central Railway',
  publishedOn: '2026-07-15',
  deadline: '2026-08-30',
  estimatedValue: '₹12,45,00,000',
  category: 'Electronics & Electrical',
  gemCategory: 'Signalling & Telecom',
}

export const BIDDERS = {
  A: {
    id: 'BID-2026-0841',
    name: 'Bharat Engineering Solutions Pvt. Ltd.',
    shortName: 'Bharat Engineering',
    gst: '27AABCB1234F1Z5',
    pan: 'AABCB1234F',
    udyam: 'UDYAM-MH-01-0012345',
    cin: 'U31200MH2008PTC183921',
    epfo: 'MH/MUM/012345',
    esic: 'ES/MH/MUMB/0012345/000',
    turnover: '₹28.4 Cr',
    experience: '12 years',
    state: 'Maharashtra',
    city: 'Mumbai',
    riskScore: 23,
    riskLevel: 'low',
    complianceScore: 94,
    status: 'verified',
    uploadedAt: '2026-08-28T09:15:00Z',
    contactEmail: 'bids@bharateng.in',
    authorizedSignatory: 'Rajesh Bharat Kumar',
  },
  B: {
    id: 'BID-2026-0842',
    name: 'Nexgen Infrastructure Ltd.',
    shortName: 'Nexgen Infra',
    gst: '29AADCN5678G1ZB',
    pan: 'AADCN5678G',
    udyam: 'UDYAM-KA-03-0054321',
    cin: 'U45200KA2014PLC074521',
    epfo: 'KA/BLR/054321',
    esic: 'ES/KA/BLRM/0054321/000',
    turnover: '₹41.7 Cr',
    experience: '8 years',
    state: 'Karnataka',
    city: 'Bengaluru',
    riskScore: 67,
    riskLevel: 'medium',
    complianceScore: 71,
    status: 'processing',
    uploadedAt: '2026-08-28T11:30:00Z',
    contactEmail: 'procurement@nexgeninfra.com',
    authorizedSignatory: 'Anamika Sharma',
  },
  C: {
    id: 'BID-2026-0843',
    name: 'Rajveer Tech Solutions',
    shortName: 'Rajveer Tech',
    gst: '07AABCR9012H1Z3',
    pan: 'AABCR9012H',
    udyam: 'UDYAM-DL-07-0098765',
    cin: 'U72200DL2019OPC356712',
    epfo: 'DL/DEL/098765',
    esic: 'ES/DL/DELH/0098765/000',
    turnover: '₹9.2 Cr',
    experience: '3 years',
    state: 'Delhi',
    city: 'New Delhi',
    riskScore: 88,
    riskLevel: 'high',
    complianceScore: 38,
    status: 'failed',
    uploadedAt: '2026-08-29T14:45:00Z',
    contactEmail: 'tenders@rajveertech.in',
    authorizedSignatory: 'Vikram Rajveer Singh',
  },
}

export const OFFICER = {
  id: 'PO-2026-0041',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@railways.gov.in',
  role: 'procurement_officer',
  department: 'Ministry of Railways',
  designation: 'Senior Procurement Officer',
  division: 'Central Railway — Electrical Division',
  avatar: 'AS',
}

export const ADMIN = {
  id: 'ADM-2026-0003',
  name: 'Priya Nair',
  email: 'priya.nair@gem.gov.in',
  role: 'admin',
  department: 'GeM Platform Administration',
  designation: 'Platform Administrator',
  avatar: 'PN',
}

export const DASHBOARD_STATS = {
  totalBids: 247,
  pendingVerification: 18,
  verifiedBids: 203,
  highRiskBids: 14,
  fraudAlerts: 3,
  complianceRate: 82,
}

export const RECENT_ACTIVITY = [
  { id: 1, action: 'Bid verified', bidder: 'Bharat Engineering Solutions Pvt. Ltd.', tender: 'GeM/2026/TENDER/005821', time: '2 mins ago', status: 'verified', score: 94 },
  { id: 2, action: 'Fraud alert triggered', bidder: 'Rajveer Tech Solutions', tender: 'GeM/2026/TENDER/005821', time: '18 mins ago', status: 'failed', score: 38 },
  { id: 3, action: 'Processing started', bidder: 'Nexgen Infrastructure Ltd.', tender: 'GeM/2026/TENDER/005821', time: '34 mins ago', status: 'processing', score: null },
  { id: 4, action: 'Bid verified', bidder: 'Samarth Electricals Pvt. Ltd.', tender: 'GeM/2026/TENDER/005799', time: '1 hr ago', status: 'verified', score: 87 },
  { id: 5, action: 'High risk detected', bidder: 'Delta Systems Corp.', tender: 'GeM/2026/TENDER/005810', time: '2 hrs ago', status: 'failed', score: 29 },
]

export const MONTHLY_BIDS_CHART = [
  { month: 'Mar', verified: 18, failed: 3, pending: 5 },
  { month: 'Apr', verified: 24, failed: 5, pending: 7 },
  { month: 'May', verified: 31, failed: 4, pending: 9 },
  { month: 'Jun', verified: 28, failed: 7, pending: 6 },
  { month: 'Jul', verified: 35, failed: 6, pending: 11 },
  { month: 'Aug', verified: 41, failed: 8, pending: 18 },
]

export const RISK_DISTRIBUTION = [
  { label: 'Low Risk', count: 156, color: '#0D9F6F' },
  { label: 'Medium Risk', count: 67, color: '#F59E0B' },
  { label: 'High Risk', count: 24, color: '#EF4444' },
]

export const GOV_DATABASES = [
  { id: 'gstn',     name: 'GSTN Portal',    description: 'GST Network verification', icon: '🏛️', status: 'active' },
  { id: 'pan',      name: 'Income Tax PAN', description: 'PAN card validation via IT Dept', icon: '📋', status: 'active' },
  { id: 'mca21',    name: 'MCA21',          description: 'Ministry of Corporate Affairs', icon: '🏢', status: 'active' },
  { id: 'udyam',    name: 'Udyam Portal',   description: 'MSME registration verification', icon: '⚙️', status: 'active' },
  { id: 'epfo',     name: 'EPFO',           description: 'Employee provident fund registry', icon: '👥', status: 'active' },
  { id: 'esic',     name: 'ESIC',           description: 'Employee state insurance check', icon: '🏥', status: 'active' },
  { id: 'digilocker', name: 'DigiLocker',   description: 'Document authenticity via Aadhaar', icon: '🔒', status: 'active' },
]

export const FRAUD_ALERTS = [
  { id: 'FA-001', type: 'Edited PDF', severity: 'high', document: 'GST Certificate', bidder: BIDDERS.C.name, detail: 'PDF metadata shows content modification after signing. Creation date: 2026-07-10, Modified: 2026-08-01.', confidence: 97 },
  { id: 'FA-002', type: 'Font Manipulation', severity: 'high', document: 'PAN Card Copy', bidder: BIDDERS.C.name, detail: 'Inconsistent font embedding detected. PAN number font family differs from document body.', confidence: 91 },
  { id: 'FA-003', type: 'Metadata Mismatch', severity: 'medium', document: 'Experience Certificate', bidder: BIDDERS.C.name, detail: 'Author field in PDF metadata does not match issuing organization.', confidence: 84 },
  { id: 'FA-004', type: 'Duplicate Certificate', severity: 'medium', document: 'ISO Certificate', bidder: BIDDERS.B.name, detail: 'Certificate number ISO-MH-2024-88741 already found in bid BID-2026-0797.', confidence: 78 },
  { id: 'FA-005', type: 'Suspicious Signature', severity: 'low', document: 'Bank Solvency Letter', bidder: BIDDERS.B.name, detail: 'Digital signature certificate expired 14 days before document issuance.', confidence: 65 },
]

export const COMPLIANCE_REQUIREMENTS = [
  { id: 'CR-01', requirement: 'GST Registration', bidderValue: '27AABCB1234F1Z5 (Active)', status: 'pass', aiNote: 'GST number validated against GSTN portal. Status: Active. No pending returns.' },
  { id: 'CR-02', requirement: 'Annual Turnover ≥ ₹20 Cr', bidderValue: '₹28.4 Cr (FY 2024–25)', status: 'pass', aiNote: 'Turnover meets the ₹20 Cr threshold. Audited balance sheet verified.' },
  { id: 'CR-03', requirement: 'Experience ≥ 5 Years', bidderValue: '12 Years (since 2014)', status: 'pass', aiNote: 'Company incorporated in 2012. Experience certificates verified for railway projects.' },
  { id: 'CR-04', requirement: 'ISO 9001:2015 Certification', bidderValue: 'ISO 9001:2015 (Valid till Dec 2026)', status: 'pass', aiNote: 'Certificate verified with issuing body TÜV SÜD. Scope covers signalling equipment.' },
  { id: 'CR-05', requirement: 'MSME/Udyam Registration', bidderValue: 'UDYAM-MH-01-0012345', status: 'pass', aiNote: 'Udyam certificate verified. Category: Small Enterprise.' },
  { id: 'CR-06', requirement: 'OEM Authorization Letter', bidderValue: 'Submitted (Siemens Mobility)', status: 'pass', aiNote: 'OEM authorization from Siemens valid for product category HS 8530.' },
  { id: 'CR-07', requirement: 'EMD ₹12,45,000 Deposited', bidderValue: 'DD No. 0012334 — SBI', status: 'pass', aiNote: 'DD details match. Bank confirmation received.' },
  { id: 'CR-08', requirement: 'PAN–Aadhaar Linked', bidderValue: 'Not confirmed', status: 'pending', aiNote: 'DigiLocker verification pending. Manual review recommended.' },
  { id: 'CR-09', requirement: 'No Blacklisting on GeM', bidderValue: 'N/A', status: 'pass', aiNote: 'Bidder not found in GeM debarment list or DPIIT blacklist.' },
  { id: 'CR-10', requirement: 'EPFO Compliance', bidderValue: 'Active (42 employees)', status: 'pass', aiNote: 'EPFO registration active. ECR filings current for last 24 months.' },
]

export const HISTORY = [
  { id: 'BID-2026-0841', bidder: 'Bharat Engineering Solutions Pvt. Ltd.', tender: 'GeM/2026/TENDER/005821', date: '2026-08-28', status: 'verified', risk: 23, compliance: 94, officer: 'Arjun Sharma' },
  { id: 'BID-2026-0842', bidder: 'Nexgen Infrastructure Ltd.',              tender: 'GeM/2026/TENDER/005821', date: '2026-08-28', status: 'processing', risk: 67, compliance: 71, officer: 'Arjun Sharma' },
  { id: 'BID-2026-0843', bidder: 'Rajveer Tech Solutions',                  tender: 'GeM/2026/TENDER/005821', date: '2026-08-29', status: 'failed',    risk: 88, compliance: 38, officer: 'Arjun Sharma' },
  { id: 'BID-2026-0797', bidder: 'Samarth Electricals Pvt. Ltd.',           tender: 'GeM/2026/TENDER/005799', date: '2026-08-25', status: 'verified', risk: 19, compliance: 87, officer: 'Meera Pillai' },
  { id: 'BID-2026-0810', bidder: 'Delta Systems Corp.',                     tender: 'GeM/2026/TENDER/005810', date: '2026-08-26', status: 'failed',    risk: 81, compliance: 29, officer: 'Suresh Gupta' },
  { id: 'BID-2026-0756', bidder: 'PowerGrid Technologies Ltd.',             tender: 'GeM/2026/TENDER/005756', date: '2026-08-20', status: 'verified', risk: 31, compliance: 91, officer: 'Arjun Sharma' },
  { id: 'BID-2026-0720', bidder: 'Sigma Electronics Pvt. Ltd.',             tender: 'GeM/2026/TENDER/005720', date: '2026-08-18', status: 'verified', risk: 27, compliance: 89, officer: 'Kavitha Rao' },
]
