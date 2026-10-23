import json
import os
import shutil
import time
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models import ForensicsResponse, Evidence
from forensics_ela import generate_ela_heatmap
from forensics_metadata import analyze_pdf_metadata
from verifiers.base import MockGSTVerifier, MockUdyamVerifier, MockUDINVerifier
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse

app = FastAPI(title="Forensics & Verification API", version="1.0")

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    
    # Process the actual request
    response = await call_next(request)
    
    # Calculate the elapsed time in milliseconds
    process_time_ms = round((time.time() - start_time) * 1000, 2)
    
    # Inject it into the response headers
    response.headers["X-Process-Time-Ms"] = str(process_time_ms)
    
    return response

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "confidence": "high",
            "explanation": str(exc.detail)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "confidence": "high",
            "explanation": "Invalid request parameters or missing file.",
            "details": exc.errors()
        }
    )

# Mount the temp directory so frontend can load heatmaps via URL
os.makedirs("temp", exist_ok=True)
app.mount("/temp", StaticFiles(directory="temp"), name="temp")

# Instantiate the adapters
gst_verifier = MockGSTVerifier()
udyam_verifier = MockUdyamVerifier()
udin_verifier = MockUDINVerifier()

@app.get("/verify/gst/{gstin}", response_model=ForensicsResponse)
def verify_gst(gstin: str):
    return gst_verifier.verify(gstin)

@app.get("/verify/udyam/{reg_no}", response_model=ForensicsResponse)
def verify_udyam(reg_no: str):
    return udyam_verifier.verify(reg_no)

@app.get("/verify/udin/{udin}", response_model=ForensicsResponse)
def verify_udin(udin: str):
    return udin_verifier.verify(udin)
@app.post("/forensics/ela", response_model=ForensicsResponse)
def analyze_ela(file: UploadFile = File(...)):
    input_path = f"temp/{file.filename}"
    output_path = f"temp/heatmap_{file.filename}"
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Unpack the new tuple returned by the ELA engine
        final_output_path, score = generate_ela_heatmap(input_path, output_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
    # The frontend can now use this exact URL in an <img src="..."> tag
    static_url = f"http://127.0.0.1:8000/{final_output_path}"
    
    status = "warning" if score > 0.60 else "valid"
    
    return ForensicsResponse(
        status=status,
        checked_at=datetime.utcnow().isoformat() + "Z",
        confidence="high",
        explanation=f"ELA Analysis complete. Anomaly score: {score}",
        evidence=Evidence(
            value=f"Heatmap URL: {static_url}",
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