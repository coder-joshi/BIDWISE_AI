import ApiError from "../../common/utils/api-error.js";

// Mock Data
const MOCK_BIDS = [
  { _id: 'BID-2026-0841', id: 'BID-2026-0841', bidderName: 'Bharat Engineering Solutions Pvt. Ltd.', tenderId: 'GeM/2026/TENDER/005821', createdAt: '2026-08-28T10:00:00Z', status: 'verified', riskScore: 23, complianceScore: 94 },
  { _id: 'BID-2026-0842', id: 'BID-2026-0842', bidderName: 'Nexgen Infrastructure Ltd.',              tenderId: 'GeM/2026/TENDER/005821', createdAt: '2026-08-28T11:00:00Z', status: 'processing', riskScore: 67, complianceScore: 71 },
  { _id: 'BID-2026-0843', id: 'BID-2026-0843', bidderName: 'Rajveer Tech Solutions',                  tenderId: 'GeM/2026/TENDER/005821', createdAt: '2026-08-29T14:45:00Z', status: 'failed',    riskScore: 88, complianceScore: 38 },
  { _id: 'BID-2026-0797', id: 'BID-2026-0797', bidderName: 'Samarth Electricals Pvt. Ltd.',           tenderId: 'GeM/2026/TENDER/005799', createdAt: '2026-08-25T09:15:00Z', status: 'verified', riskScore: 19, complianceScore: 87 },
  { _id: 'BID-2026-0810', id: 'BID-2026-0810', bidderName: 'Delta Systems Corp.',                     tenderId: 'GeM/2026/TENDER/005810', createdAt: '2026-08-26T16:20:00Z', status: 'failed',    riskScore: 81, complianceScore: 29 },
  { _id: 'BID-2026-0756', id: 'BID-2026-0756', bidderName: 'PowerGrid Technologies Ltd.',             tenderId: 'GeM/2026/TENDER/005756', createdAt: '2026-08-20T11:10:00Z', status: 'verified', riskScore: 31, complianceScore: 91 },
  { _id: 'BID-2026-0720', id: 'BID-2026-0720', bidderName: 'Sigma Electronics Pvt. Ltd.',             tenderId: 'GeM/2026/TENDER/005720', createdAt: '2026-08-18T14:30:00Z', status: 'verified', riskScore: 27, complianceScore: 89 },
]

const createBid = async ({ tenderId, bidderName, gstNumber, panNumber, udyamNumber, uploadedBy, files = [] }) => {
  return { id: 'BID-NEW', status: 'processing' };
};

const getAllBids = async (uploadedBy) => {
  return MOCK_BIDS; // Bypassing DB
};

const getBidById = async (id) => {
  const bid = MOCK_BIDS.find(b => b._id === id || b.id === id);
  if (!bid) throw ApiError.notfound("Bid not found");
  
  // Return full detailed mock for specific pages
  return {
    ...bid,
    gstNumber: '27AABCB1234F1Z5',
    panNumber: 'AABCB1234F',
    udyamNumber: 'UDYAM-MH-01-0012345',
    turnover: '₹28.4 Cr',
    experience: '12 years',
    state: 'Maharashtra',
    city: 'Mumbai',
    documents: [
      { type: 'gst', status: 'verified', aiNote: 'Valid GST' },
      { type: 'pan', status: 'verified', aiNote: 'Valid PAN' },
    ],
    complianceRequirements: [
      { id: 'CR-01', requirement: 'GST Registration', bidderValue: 'Active', status: 'pass' },
      { id: 'CR-02', requirement: 'Turnover', bidderValue: '₹28 Cr', status: 'pass' },
      { id: 'CR-08', requirement: 'PAN Link', bidderValue: 'Pending', status: 'pending' },
    ],
    fraudAlerts: bid.riskScore > 50 ? [
      { id: 'FA-01', type: 'Edited PDF', severity: 'high', detail: 'Modified after signing' }
    ] : []
  };
};

const updateBidStatus = async (id, status, updates = {}) => {
  return { id, status, ...updates };
};

export { createBid, getAllBids, getBidById, updateBidStatus };
