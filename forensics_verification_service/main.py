import json
import os
import shutil
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from models import ForensicsResponse, Evidence
from forensics_ela import generate_ela_heatmap
from forensics_metadata import analyze_pdf_metadata
app = FastAPI(title="Forensics & Verification API", version="1.0")

@app.get("/verify/gst/{gstin}", response_model=ForensicsResponse)
def verify_gst(gstin: str):
    # Mock data routing based on the GSTIN provided
    if "NEXUS" in gstin.upper():
        status, explanation = "valid", "GSTIN Active. Taxpayer registered as Nexus Global."
    elif "SHIVALIK" in gstin.upper():
        status, explanation = "warning", "GSTIN Active. Flagged for recent principal place of business change."
    else: 
        # AstraNet or default fallback
        status, explanation = "valid", "GSTIN Active. Regular Taxpayer verified."
        
    return ForensicsResponse(
        status=status,
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation=explanation
    )

@app.get("/verify/udyam/{reg_no}", response_model=ForensicsResponse)
def verify_udyam(reg_no: str):
    # Nexus Global specific failure case
    if "NEXUS" in reg_no.upper():
        return ForensicsResponse(
            status="invalid",
            checked_at=datetime.utcnow().isoformat() + "Z",
            confidence="high",
            explanation="Udyam Registry mismatch: Registered as NIC 46510 (Trading). Trading companies are ineligible."
        )
    
    # Default pass for AstraNet/Shivalik
    return ForensicsResponse(
        status="valid",
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation="Udyam Registration verified as Manufacturing entity."
    )

@app.get("/verify/udin/{udin}", response_model=ForensicsResponse)
def verify_udin(udin: str):
    # AstraNet specific pass case
    return ForensicsResponse(
        status="valid",
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation="UDIN mathematically verified and active on portal."
    )
@app.post("/forensics/ela", response_model=ForensicsResponse)
def analyze_ela(file: UploadFile = File(...)):
    # 1. Create a safe temporary location for the incoming file
    os.makedirs("temp", exist_ok=True)
    input_path = f"temp/{file.filename}"
    output_path = f"temp/heatmap_{file.filename}"
    
    # 2. Save the uploaded file to disk
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 3. Run the OpenCV Error Level Analysis
    try:
        generate_ela_heatmap(input_path, output_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
    # 4. Return the standard API contract response
    return ForensicsResponse(
        status="warning",
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation="Image processing complete. Heatmap generated successfully.",
        evidence=Evidence(
            value=f"Generated: {output_path}",
            page=1,
            bbox=[0.0, 0.0, 1.0, 1.0]
        )
    )
@app.post("/forensics/metadata", response_model=ForensicsResponse)
def analyze_metadata(file: UploadFile = File(...)):
    # 1. Save uploaded PDF temporarily
    os.makedirs("temp", exist_ok=True)
    input_path = f"temp/{file.filename}"
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Run the metadata analyzer
    status, explanation = analyze_pdf_metadata(input_path)
    
    # 3. Clean up the temp file
    if os.path.exists(input_path):
        os.remove(input_path)
        
    # 4. Return the standard API response
    return ForensicsResponse(
        status=status,
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation=explanation
    )

@app.get("/demo/bidders/{bidder_id}/forensics", response_model=ForensicsResponse)
def get_demo_results(bidder_id: str):
    with open("mock_data.json", "r") as f:
        data = json.load(f)
        
    if bidder_id not in data:
        raise HTTPException(status_code=404, detail="Bidder not found in mock data")
        
    result = data[bidder_id]
    
    return ForensicsResponse(
        status=result["status"],
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence=result["confidence"],
        explanation=result["explanation"],
        evidence=result.get("evidence")
    )