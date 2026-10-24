# AI Service Interface Contract (PROPOSAL)

> **Status:** PROPOSAL for AI Teammate Review & Approval  
> **Document Version:** 1.0.0  
> **Date:** 2026-10-24  
> **Target Service:** Python FastAPI Backend (`AI_SERVICE_URL`, default `http://localhost:8000`)  
> **Consumer:** Node.js Backend (`modules/integrations/ai.client.js`)  

---

## 1. Overview & Architectural Boundary

BidWise AI relies on a clean architectural division of responsibilities:
- **Node.js Express Backend:** Orchestrates the queue, manages database state (MongoDB), handles authentication, runs pure rule evaluations, statutory verifications, and scoring.
- **Python FastAPI AI Backend:** Performs document rendering, multimodal LLM parsing/clause matching against tender criteria, and forensic image analysis (e.g. Error Level Analysis, metadata inspection). Node only calls the Python service over HTTP and persists results.

All calls from Node.js use `fetch` with an abort timeout (`AI_REQUEST_TIMEOUT_MS`, default 120s) and automatic exponential backoff retries on network failures. If the Python service is offline and `MOCK_AI=true` is set, Node.js returns seeded fixtures.

---

## 2. Endpoints

### 2.1. `POST /render`

Converts an uploaded document (PDF or TIFF/image) into rendered page images for frontend highlighting and bounding-box rendering.

- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `file` (Form binary): The raw document file.

- **Response:** `200 OK` (`application/json`)
```json
{
  "pageCount": 3,
  "pages": [
    {
      "pageNumber": 1,
      "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "width": 612,
      "height": 792
    },
    {
      "pageNumber": 2,
      "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "width": 612,
      "height": 792
    }
  ]
}
```

- **Error Codes:**
  - `400 Bad Request`: Unreadable or corrupt document format.
  - `500 Internal Error`: Rendering engine or ghostscript/pdf2image exception.

---

### 2.2. `POST /analyze`

Performs LLM-based clause extraction and document matching. The Python AI service evaluates all submitted bidder documents against the tender criteria and extracted clauses.

- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "tender": {
    "bidNumber": "GEM/2026/B/5489210",
    "organisation": "Ministry of Railways",
    "itemCategory": "Telecom Equipment",
    "estimatedValue": 50000000
  },
  "clauses": [
    {
      "code": "ATC 01",
      "title": "Minimum Average Annual Turnover",
      "category": "turnover",
      "requirement": "The bidder must have minimum average annual turnover of ₹25 Cr over the last 3 financial years (FY 21-22, 22-23, 23-24).",
      "ruleConfig": {
        "minAvgTurnoverCr": 25,
        "years": 3
      },
      "severity": "critical"
    },
    {
      "code": "ATC 02",
      "title": "Make-in-India Preference",
      "category": "mii",
      "requirement": "Class-I Local Supplier (local content >= 50%) required.",
      "ruleConfig": {
        "miiClass": "Class I",
        "localContentThreshold": 50
      },
      "severity": "major"
    }
  ],
  "documents": [
    {
      "id": "660c1d2e4f8b9a001f3e7a12",
      "originalName": "Turnover_CA_Certificate.pdf",
      "type": "other",
      "pageCount": 3
    }
  ]
}
```

- **Response:** `200 OK` (`application/json`)
```json
{
  "evaluations": [
    {
      "clauseCode": "ATC 01",
      "extractedValue": "₹32.5 Cr",
      "extractedFields": {
        "turnoverYears": [
          { "year": "2023-24", "amountCr": 35.0 },
          { "year": "2022-23", "amountCr": 30.5 },
          { "year": "2021-22", "amountCr": 32.0 }
        ],
        "udinNumber": "24054321AAAAAA1234"
      },
      "reasoning": "Chartered Accountant certificate confirms average annual turnover of ₹32.5 Cr across FY 2021-22 to 2023-24.",
      "confidence": 0.96,
      "evidence": [
        {
          "document": "660c1d2e4f8b9a001f3e7a12",
          "page": 1,
          "bbox": {
            "x": 0.12,
            "y": 0.35,
            "w": 0.76,
            "h": 0.08
          },
          "snippet": "We hereby certify that the Average Turnover of M/s ABC Ltd for the preceding three financial years is INR 32.50 Crores."
        }
      ]
    }
  ]
}
```

- **BBox Coordinate Convention:** Normalized values between `0.0` and `1.0` (`x`, `y`, `w`, `h`) relative to the page width and height, enabling resolution-independent frontend canvas rendering.

---

### 2.3. `POST /forensics`

Analyzes submitted documents for document tampering, PDF metadata anomalies, modification traces, font inconsistencies, and Error Level Analysis (ELA) compression artifacts.

- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `file` (Form binary): The raw document file to analyze.

- **Response:** `200 OK` (`application/json`)
```json
{
  "alerts": [
    {
      "page": 1,
      "type": "metadata",
      "severity": "minor",
      "documentValue": "Producer: Adobe PDF Library 15.0; ModDate: 2026-02-10",
      "metadata": {
        "producer": "Adobe PDF Library 15.0",
        "creator": "Adobe Acrobat Pro 2024",
        "creationDate": "2025-11-01T10:00:00Z",
        "modDate": "2026-02-10T14:30:00Z",
        "suspicionScore": 0.12
      },
      "elaImageBase64": null,
      "note": "Document metadata contains modification timestamp subsequent to signing date."
    },
    {
      "page": 2,
      "type": "ela",
      "severity": "critical",
      "documentValue": "Turnover figure pixel anomaly",
      "metadata": {
        "elaScore": 0.88,
        "region": "Table Row 3 (Turnover FY23-24)"
      },
      "elaImageBase64": "data:image/png;base64,iVBORw0KGgo...",
      "note": "High error level analysis variation detected around numerical digits in turnover table indicating digital alteration."
    }
  ]
}
```

- **Severity Values:** `"critical" | "major" | "minor"`
- **Alert Types:** `"ela" | "metadata" | "date_mismatch"`

---

## 3. Feedback & Approval Checklist for AI Teammate

- [ ] Does `POST /render` response structure match pdf2image output?
- [ ] Are bounding-box coordinates (`x, y, w, h`) normalized `0.0 - 1.0` or pixel-based? (Proposal uses normalized `0.0 - 1.0`)
- [ ] For `POST /analyze`, should documents be passed as file URLs/storage keys or binary streams if deployed separately?
- [ ] Are ELA overlay images required as Base64 strings or direct image streams?
- [ ] Any additional forensic alert types to include? (e.g. font mismatch, copy-move forgery).
