import json
import os
import re
import time
import uuid

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from forensics_ela import generate_ela_heatmap
from forensics_metadata import analyze_pdf_findings
from models import ForensicsResponse, now_iso
from verifiers.base import MockGSTVerifier, MockUDINVerifier, MockUdyamVerifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
MOCK_DATA_PATH = os.path.join(BASE_DIR, "mock_data.json")
MAX_BYTES = 10 * 1024 * 1024      # 10 MB per upload
TEMP_TTL_SECONDS = 3600           # heatmaps older than this are deleted

app = FastAPI(title="Forensics & Verification API", version="1.1")

@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------- middleware and errors
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time-Ms"] = str(round((time.perf_counter() - start) * 1000, 2))
    return response


ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:4000,http://127.0.0.1:5173,http://127.0.0.1:4000,https://bidwise-ai-n9dm.vercel.app",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-Ms"],
)


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={
        "status": "error", "confidence": "high", "explanation": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={
        "status": "error", "confidence": "high",
        "explanation": "Invalid request parameters or missing file.",
        "details": exc.errors()})


# ---------------------------------------------------------------- shared helpers
os.makedirs(TEMP_DIR, exist_ok=True)
app.mount("/temp", StaticFiles(directory=TEMP_DIR), name="temp")


def ms_since(t0: float) -> float:
    return round((time.perf_counter() - t0) * 1000, 2)


def cleanup_temp():
    """Deletes old files from temp/ so heatmaps do not pile up forever."""
    cutoff = time.time() - TEMP_TTL_SECONDS
    for name in os.listdir(TEMP_DIR):
        path = os.path.join(TEMP_DIR, name)
        try:
            if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
                os.remove(path)
        except OSError:
            pass


def save_upload(file: UploadFile, allowed_ext: set) -> str:
    """
    Saves an upload under a server-chosen unique name and returns the path. The client's filename is
    NEVER used as a path (that allowed '../' tricks), only its extension is checked.
    """
    name = os.path.basename((file.filename or "upload").replace("\\", "/"))
    ext = os.path.splitext(name)[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(sorted(allowed_ext))}")
    path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex[:12]}_in{ext}")
    size = 0
    try:
        with open(path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(status_code=413, detail="File too large (max 10 MB).")
                buffer.write(chunk)
    except Exception:
        if os.path.exists(path):
            os.remove(path)
        raise
    return path


def load_demo_data() -> dict:
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def resolve_bidder(bidder_id: str, data: dict):
    """'AstraNet', 'astranet', 'nexus' and 'Shivalik_Digitech' all work; ambiguous or unknown returns None."""
    n = _norm(bidder_id)
    exact = [k for k in data if _norm(k) == n]
    if exact:
        return exact[0]
    prefix = [k for k in data if n and _norm(k).startswith(n)]
    return prefix[0] if len(prefix) == 1 else None


# ---------------------------------------------------------------- registry verification (mock adapters)
gst_verifier = MockGSTVerifier()
udyam_verifier = MockUdyamVerifier()
udin_verifier = MockUDINVerifier()


def timed(fn, *args) -> ForensicsResponse:
    t0 = time.perf_counter()
    result = fn(*args)
    result.processing_ms = ms_since(t0)
    return result


@app.get("/verify/gst/{gstin}", response_model=ForensicsResponse)
def verify_gst(gstin: str):
    return timed(gst_verifier.verify, gstin)


@app.get("/verify/udyam/{reg_no}", response_model=ForensicsResponse)
def verify_udyam(reg_no: str):
    return timed(udyam_verifier.verify, reg_no)


@app.get("/verify/udin/{udin}", response_model=ForensicsResponse)
def verify_udin(udin: str):
    return timed(udin_verifier.verify, udin)


# ---------------------------------------------------------------- guided demo
DEMO_DATA = load_demo_data()
# ONE source of truth for the demo box: mock_data.json. [x, y, w, h] as fractions of the image.
SHIVALIK_BBOX = DEMO_DATA["Shivalik_Digitech"]["evidence"]["bbox"]
DEMO_BBOXES = {"sample_for_cv_forged.jpg": SHIVALIK_BBOX}


@app.get("/demo/bidders/{bidder_id}/forensics", response_model=ForensicsResponse)
def get_demo_results(bidder_id: str):
    t0 = time.perf_counter()
    data = load_demo_data()
    key = resolve_bidder(bidder_id, data)
    if key is None:
        raise HTTPException(status_code=404, detail=f"Bidder not found. Known bidders: {', '.join(data)}")
    result = data[key]
    return ForensicsResponse(
        status=result["status"], checked_at=now_iso(), confidence=result["confidence"],
        explanation=result["explanation"], evidence=result.get("evidence"),
        processing_ms=ms_since(t0))


# ---------------------------------------------------------------- forensics
ELA_EXT = {".jpg", ".jpeg", ".png", ".webp"}
ELA_STATUS = "info"   # a heatmap is not a verdict. The frontend should show it as neutral, not as an alarm.


@app.post("/forensics/ela", response_model=ForensicsResponse)
def analyze_ela(request: Request, file: UploadFile = File(...)):
    t0 = time.perf_counter()
    cleanup_temp()
    original_name = os.path.basename((file.filename or "").replace("\\", "/"))
    input_path = save_upload(file, ELA_EXT)
    output_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex[:12]}_heatmap.jpg")
    try:
        try:
            final_output_path, _ = generate_ela_heatmap(input_path, output_path)   # score deliberately ignored
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception:
            raise HTTPException(status_code=500, detail="Image processing failed.")
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)           # do not keep uploaded documents on disk

    heatmap_url = f"{str(request.base_url).rstrip('/')}/temp/{os.path.basename(final_output_path)}"
    bbox = DEMO_BBOXES.get(original_name)
    if bbox:
        explanation = ("ELA heatmap generated for reviewer inspection. The highlighted box is a manual "
                       "demo annotation, not an automatic detection.")
    else:
        explanation = ("ELA heatmap generated for reviewer inspection. No automatic tamper detection is "
                       "performed; a human must review the heatmap.")
    return ForensicsResponse(
        status=ELA_STATUS, source="OPENCV_ELA", is_mock=False, checked_at=now_iso(), confidence="low",
        explanation=explanation, processing_ms=ms_since(t0),
        evidence={"value": f"Heatmap URL: {heatmap_url}", "page": 1, "bbox": bbox})


@app.post("/forensics/metadata", response_model=ForensicsResponse)
def analyze_metadata(file: UploadFile = File(...)):
    t0 = time.perf_counter()
    input_path = save_upload(file, {".pdf"})
    try:
        result = analyze_pdf_findings(input_path)
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
    findings = result["findings"]
    return ForensicsResponse(
        status=result["status"], source="PYPDF_METADATA", is_mock=False, checked_at=now_iso(),
        confidence="medium" if result["status"] == "warning" else "low",
        explanation=result["explanation"], processing_ms=ms_since(t0),
        evidence={"value": "; ".join(f["code"] for f in findings) or "NO_FINDINGS", "page": None, "bbox": None})