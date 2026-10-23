# BIDWISE AI - Forensics & Verification Service

A production-ready FastAPI microservice for the Smart India Hackathon. This service handles government registry verification routing and performs advanced visual and structural forensics on uploaded vendor documents.

## Features
*   **Adapter Architecture:** Seamlessly swaps between mock demo data and live registry APIs (GST, Udyam, UDIN).
*   **Statistical ELA Engine:** Uses Coefficient of Variation on JPEG compression to calculate an anomaly score. Flag threshold set at `>0.60`. Note: ELA proves image resaving/pasting; it is an alert, not a definitive fraud verdict.
*   **Metadata Analyzer:** Extracts hidden PDF dictionaries to detect temporal anomalies (e.g., modified after creation).
*   **Telemetry:** Injects `X-Process-Time-Ms` headers for latency tracking.

## Running Locally

1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/Scripts/activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server: `python -m uvicorn main:app --reload`

## Running via Docker

1. Build the image: `docker build -t bidwise-forensics .`
2. Run the container: `docker run -d -p 8000:8000 bidwise-forensics`

## API Endpoints

Once running, access the interactive Swagger UI at **http://127.0.0.1:8000/docs**.

*   `GET /demo/bidders/{bidder_id}/forensics` - Fetch predefined demo scenarios.
*   `POST /forensics/ela` - Upload a `.jpg` for visual tampering analysis.
*   `POST /forensics/metadata` - Upload a `.pdf` for structural tampering analysis.