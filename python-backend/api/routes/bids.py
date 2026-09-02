from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

# Global in-memory DB for the prototype
MOCK_BIDS = [
    {
        "id": 'BID-2026-0841',
        "bidderName": 'Bharat Engineering Solutions Pvt. Ltd.',
        "tenderId": 'GeM/2026/TENDER/005821',
        "createdAt": '2026-08-28T10:00:00Z',
        "status": 'verified',
        "riskScore": 23,
        "complianceScore": 94,
        "bidderDetails": {
            "name": 'Bharat Engineering Solutions Pvt. Ltd.',
            "shortName": 'Bharat Engineering',
            "gst": '27AABCB1234F1Z5',
            "pan": 'AABCB1234F',
            "udyam": 'UDYAM-MH-01-0012345',
            "cin": 'U31200MH2008PTC183921',
            "turnover": '₹28.4 Cr',
            "experience": '12 years',
            "state": 'Maharashtra'
        },
        "fraudAlerts": [],
        "complianceRequirements": [
            { "id": 'CR-01', "requirement": 'GST Registration', "bidderValue": '27AABCB1234F1Z5 (Active)', "status": 'pass', "aiNote": 'GST number validated against GSTN portal. Status: Active. No pending returns.' },
            { "id": 'CR-02', "requirement": 'Annual Turnover ≥ ₹20 Cr', "bidderValue": '₹28.4 Cr (FY 2024–25)', "status": 'pass', "aiNote": 'Turnover meets the ₹20 Cr threshold. Audited balance sheet verified.' },
            { "id": 'CR-03', "requirement": 'Experience ≥ 5 Years', "bidderValue": '12 Years (since 2014)', "status": 'pass', "aiNote": 'Company incorporated in 2012. Experience certificates verified for railway projects.' }
        ]
    },
    {
        "id": 'BID-2026-0843',
        "bidderName": 'Rajveer Tech Solutions',
        "tenderId": 'GeM/2026/TENDER/005821',
        "createdAt": '2026-08-29T14:45:00Z',
        "status": 'failed',
        "riskScore": 88,
        "complianceScore": 38,
        "bidderDetails": {
            "name": 'Rajveer Tech Solutions',
            "shortName": 'Rajveer Tech',
            "gst": '07AABCR9012H1Z3',
            "pan": 'AABCR9012H',
            "udyam": 'UDYAM-DL-07-0098765',
            "cin": 'U72200DL2019OPC356712',
            "turnover": '₹9.2 Cr',
            "experience": '3 years',
            "state": 'Delhi'
        },
        "fraudAlerts": [
            { "id": 'FA-001', "type": 'Edited PDF', "severity": 'high', "document": 'GST Certificate', "detail": 'PDF metadata shows content modification after signing.', "confidence": 97 },
            { "id": 'FA-002', "type": 'Font Manipulation', "severity": 'high', "document": 'PAN Card Copy', "detail": 'Inconsistent font embedding detected.', "confidence": 91 }
        ],
        "complianceRequirements": [
            { "id": 'CR-01', "requirement": 'GST Registration', "bidderValue": '07AABCR9012H1Z3', "status": 'pass', "aiNote": 'GST found.' },
            { "id": 'CR-02', "requirement": 'Annual Turnover ≥ ₹20 Cr', "bidderValue": '₹9.2 Cr', "status": 'fail', "aiNote": 'Turnover is below the required ₹20 Cr threshold.' },
            { "id": 'CR-03', "requirement": 'Experience ≥ 5 Years', "bidderValue": '3 Years', "status": 'fail', "aiNote": 'Experience is below the 5-year requirement.' }
        ]
    }
]

@router.get("/")
async def get_all_bids():
    return {"status": "success", "data": MOCK_BIDS}

@router.get("/{bid_id}")
async def get_bid_by_id(bid_id: str):
    for bid in MOCK_BIDS:
        if bid["id"] == bid_id:
            return {"status": "success", "data": bid}
    return {"status": "error", "message": "Bid not found"}, 404


class BidProcessResponse(BaseModel):
    task_id: str
    message: str

import os
import tempfile
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("/upload", response_model=BidProcessResponse)
async def upload_bid(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Endpoint to receive a Bid PDF/DOCX and process it with Gemini.
    """
    task_id = str(uuid.uuid4())
    bid_id = f"BID-2026-{str(uuid.uuid4().int)[:4]}"
    
    # 1. Save file to temporary location
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    try:
        # 2. Upload file to Gemini
        print(f"Uploading {file.filename} to Gemini...")
        uploaded_file = genai.upload_file(path=temp_path)
        
        # 3. Analyze with Gemini
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = """
        Analyze this document. It is supposed to be a government procurement bid.
        Check if it contains valid business documents like a GST Certificate, PAN Card, Udyam Registration, and Financial Turnover details.
        
        Respond ONLY with a raw JSON object (no markdown formatting, no backticks) matching this exact schema:
        {
            "complianceScore": integer (0-100),
            "riskScore": integer (0-100),
            "status": "verified" or "failed",
            "bidderDetails": {
                "name": "extracted company name or Unknown",
                "shortName": "short version",
                "gst": "extracted GST or N/A",
                "pan": "extracted PAN or N/A",
                "udyam": "extracted Udyam or N/A",
                "cin": "extracted CIN or N/A",
                "turnover": "extracted turnover or N/A",
                "experience": "extracted experience or N/A",
                "state": "extracted state or N/A"
            },
            "fraudAlerts": [
                {
                    "id": "FA-XXX",
                    "type": "Missing Document or Edited PDF etc",
                    "severity": "high/medium/low",
                    "document": "which document",
                    "detail": "explanation",
                    "confidence": integer
                }
            ],
            "complianceRequirements": [
                {
                    "id": "CR-01",
                    "requirement": "GST Registration",
                    "bidderValue": "value found",
                    "status": "pass or fail",
                    "aiNote": "explanation"
                }
            ]
        }
        
        If it is NOT a bid document (e.g., just a presentation, random image, or unrelated text) OR if it is missing GST/PAN, give it a very low compliance score (<40) and high risk score (>70), set status to "failed", and populate fraudAlerts indicating missing documents.
        If it looks like a valid bid document with GST and PAN, give it a high compliance score (>80) and low risk score (<30), and set status to "verified". Make up some realistic complianceRequirements based on what you find.
        """
        
        response = model.generate_content([prompt, uploaded_file])
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        print(f"Gemini output: {result_text}")
        
        # Parse JSON
        ai_data = json.loads(result_text)
        
        new_bid = {
            "id": bid_id,
            "bidderName": ai_data.get("bidderDetails", {}).get("name", file.filename.replace('.pdf', '').replace('.pptx', '')),
            "tenderId": 'GeM/2026/TENDER/005821',
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "status": ai_data.get("status", "failed"),
            "riskScore": ai_data.get("riskScore", 85),
            "complianceScore": ai_data.get("complianceScore", 20),
            "bidderDetails": ai_data.get("bidderDetails", {}),
            "fraudAlerts": ai_data.get("fraudAlerts", []),
            "complianceRequirements": ai_data.get("complianceRequirements", [])
        }
        
    except Exception as e:
        print(f"Gemini extraction failed: {e}")
        # Fallback if Gemini fails
        new_bid = {
            "id": bid_id,
            "bidderName": file.filename + " (API Error)",
            "tenderId": 'GeM/2026/TENDER/005821',
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "status": 'failed',
            "riskScore": 99,
            "complianceScore": 0
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    MOCK_BIDS.insert(0, new_bid)
    
    return BidProcessResponse(
        task_id=task_id,
        message="Bid document uploaded and processed by AI."
    )

@router.get("/{task_id}/status")
async def get_processing_status(task_id: str):
    """
    Endpoint to poll for AI extraction and verification status.
    """
    return {
        "task_id": task_id,
        "status": "completed",
        "progress": 100,
        "results": {
            "risk_score": 12,
            "compliance_score": 98,
            "fraud_alerts": 0,
            "documents_extracted": ["GST", "PAN", "Udyam", "Experience"]
        }
    }
