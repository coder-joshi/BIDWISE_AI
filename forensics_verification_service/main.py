from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
import json
import os
from forensics_ela import run_ela

app = FastAPI(title="BidWise AI - Forensics & Verification API")

# Load mock data
with open("mock_data.json", "r") as f:
    MOCK_DB = json.load(f)

@app.get("/verify/udyam/{udyam_id}")
async def verify_udyam(udyam_id: str):
    """Mock statutory check for Udyam registration"""
    data = MOCK_DB.get(udyam_id)
    if not data:
        return JSONResponse(status_code=404, content={"error": "Udyam ID not found"})
    return data

@app.post("/analyze/image")
async def analyze_tampering(file: UploadFile = File(...)):
    """Runs ELA image processing on the uploaded certificate"""
    contents = await file.read()
    output_path = f"heatmap_{file.filename}"
    
    result = run_ela(contents, output_filename=output_path)
    
    if "error" in result:
        return JSONResponse(status_code=400, content=result)
        
    return FileResponse(output_path)