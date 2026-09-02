from fastapi import APIRouter

router = APIRouter()

DASHBOARD_STATS = {
    "totalBids": 247,
    "pendingVerification": 18,
    "verifiedBids": 203,
    "highRiskBids": 14,
    "fraudAlerts": 3,
    "complianceRate": 82,
}

RECENT_ACTIVITY = [
    { "id": 1, "action": 'Bid verified', "bidder": 'Bharat Engineering Solutions Pvt. Ltd.', "tender": 'GeM/2026/TENDER/005821', "time": '2 mins ago', "status": 'verified', "score": 94 },
    { "id": 2, "action": 'Fraud alert triggered', "bidder": 'Rajveer Tech Solutions', "tender": 'GeM/2026/TENDER/005821', "time": '18 mins ago', "status": 'failed', "score": 38 },
    { "id": 3, "action": 'Processing started', "bidder": 'Nexgen Infrastructure Ltd.', "tender": 'GeM/2026/TENDER/005821', "time": '34 mins ago', "status": 'processing', "score": None },
    { "id": 4, "action": 'Bid verified', "bidder": 'Samarth Electricals Pvt. Ltd.', "tender": 'GeM/2026/TENDER/005799', "time": '1 hr ago', "status": 'verified', "score": 87 },
    { "id": 5, "action": 'High risk detected', "bidder": 'Delta Systems Corp.', "tender": 'GeM/2026/TENDER/005810', "time": '2 hrs ago', "status": 'failed', "score": 29 },
]

MONTHLY_BIDS_CHART = [
    { "month": 'Mar', "verified": 18, "failed": 3, "pending": 5 },
    { "month": 'Apr', "verified": 24, "failed": 5, "pending": 7 },
    { "month": 'May', "verified": 31, "failed": 4, "pending": 9 },
    { "month": 'Jun', "verified": 28, "failed": 7, "pending": 6 },
    { "month": 'Jul', "verified": 35, "failed": 6, "pending": 11 },
    { "month": 'Aug', "verified": 41, "failed": 8, "pending": 18 },
]

RISK_DISTRIBUTION = [
    { "label": 'Low Risk', "count": 156, "color": '#0D9F6F' },
    { "label": 'Medium Risk', "count": 67, "color": '#F59E0B' },
    { "label": 'High Risk', "count": 24, "color": '#EF4444' },
]

@router.get("/")
async def get_dashboard_data():
    return {
        "status": "success",
        "data": {
            "stats": DASHBOARD_STATS,
            "recentActivity": RECENT_ACTIVITY,
            "monthlyChart": MONTHLY_BIDS_CHART,
            "riskDistribution": RISK_DISTRIBUTION
        }
    }
