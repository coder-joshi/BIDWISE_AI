# Forensics & Verification Microservice

## How to run (Local)
1. Install dependencies: `pip install -r requirements.txt`
2. Start the server: `uvicorn main:app --reload`
3. The API will run on `http://127.0.0.1:8000`

## Endpoints
- **GET** `/verify/udyam/{udyam_id}` : Returns JSON statutory checks.
  - *Test IDs: UDYAM-ASTRA-001, UDYAM-NEXUS-002, UDYAM-SHIV-003*
- **POST** `/analyze/image` : Upload an image (form-data: `file`). Returns the ELA heatmap image.