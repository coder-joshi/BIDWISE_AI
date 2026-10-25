# BIDWISE AI: Forensics & Verification Service

FastAPI microservice for the Smart India Hackathon prototype. It (1) answers registry checks (GST, Udyam, UDIN)
through **mock adapters**, (2) produces an **ELA heatmap** for a human reviewer to inspect, and (3) runs
**PDF metadata and structure checks**. Every result is an alert for committee verification, never a fraud finding.

## What is real and what is mock
| Part | Status |
|---|---|
| GST / Udyam / UDIN lookups | **Mock.** Responses are hardcoded per bidder (`is_mock: true`). `verifiers/base.py` defines the interface a live adapter would implement. |
| `/demo/bidders/{id}/forensics` | **Seeded** story from `mock_data.json` for the three demo bidders. |
| `/forensics/ela` | **Real computation, but only a visual aid.** Returns a heatmap. It does not decide anything. |
| `/forensics/metadata` | **Real checks** on the uploaded PDF (see below). |

## Run locally (Git Bash on Windows)
```
python -m venv venv
source venv/Scripts/activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Open http://127.0.0.1:8000/docs. Run the tests with `pytest`. With the server running, `python smoke_test.py` checks the live endpoints.
`python make_demo_pdfs.py` creates `samples/astranet_clean.pdf` and `samples/shivalik_tampered.pdf` for the metadata demo.

## Docker
```
docker build -t bidwise-forensics .
docker run -p 8000:8000 bidwise-forensics
```

## Response format (all endpoints)
`status` (`valid`, `warning`, `invalid`, `info`), `source`, `is_mock`, `checked_at`, `confidence` (`low`/`medium`/`high`),
`explanation`, `processing_ms`, `disclaimer`, and optional `evidence {value, page, bbox}`.
`bbox` is `[x, y, w, h]` as fractions (0 to 1) of the image or page size, so a frontend can draw it at any size.
Latency is also sent in the `X-Process-Time-Ms` header.

## Endpoints
| Method and path | Purpose |
|---|---|
| `GET /verify/gst/{gstin}`, `/verify/udyam/{reg_no}`, `/verify/udin/{udin}` | Mock registry checks. A name hint in the id (`ASTRA`, `NEXUS`, `SHIVALIK`) selects the demo story. |
| `GET /demo/bidders/{bidder_id}/forensics` | Seeded demo result. Ids: `AstraNet`, `Nexus_Global`, `Shivalik_Digitech` (case and underscores are ignored; `nexus` also works). |
| `POST /forensics/ela` | Upload a JPEG/PNG/WebP (max 10 MB). Returns `status: "info"` and a heatmap URL in `evidence.value`. `bbox` is set **only** for the seeded sample `sample_for_cv_forged.jpg`, where it is a manual annotation of the edited expiry date. |
| `POST /forensics/metadata` | Upload a `.pdf` (max 10 MB). Finding codes are returned in `evidence.value`. |

## PDF checks (`forensics_metadata.py`)
Modified long after creation (dates are parsed, with a 2 minute tolerance), modified before creation, an editing tool in
Producer/Creator, incremental saves (more than one `%%EOF`), and data added after a digital signature's `/ByteRange`.
These are **signals**. An honest document can trigger them, and a careful forger can avoid all of them.
The service does **not** cryptographically validate signatures.

## Limits we know about
* **ELA is unreliable as an automatic detector.** We tested the original score (std/mean of the ELA image) on labelled
  synthetic JPEGs: AUC 0.50 (a coin flip), because a re-saved region can look brighter *or* darker depending on the file's
  earlier compression. ELA also needs a JPEG: converting PNG/WebP to JPEG erases the evidence. So ELA is shown for human review only.
* Registry results are mock until real GSTN / Udyam / ICAI integrations are authorised.
* The metadata checks do not prove authenticity, only highlight reasons for a human to look closer.