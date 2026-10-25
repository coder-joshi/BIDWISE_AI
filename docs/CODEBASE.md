# BidWise AI — Codebase Inherit Report

> **Inherit Audit Date:** 2026-10-25  
> **Repository:** `BIDWISE_AI` (`gem-bidverify-sih26100`)  
> **Status:** Post-Merge Audit (66 Commits)  
> **Verification Status:** All facts verified against active repository code. Missing confirmations marked with `[NEEDS FACT]`.

---

## 1. Stack and Installed Versions

### Root Workspace
* **Orchestrator:** `gem-bidverify-sih26100` v1.0.0 (npm scripts for parallel execution).

### Frontend (`frontend/`)
* **Framework:** React 18.3.1 with React DOM 18.3.1.
* **Build Tool:** Vite 4.5.5 (`@vitejs/plugin-react` 4.3.1).
* **Routing:** React Router DOM 6.26.2 (`createBrowserRouter`).
* **State Management:** Zustand 5.0.0 (`persist` middleware to `localStorage`).
* **Styling:** Tailwind CSS 3.4.11, PostCSS 8.4.45, Autoprefixer 10.4.20.
* **Icons & Animation:** Lucide React 0.441.0, Framer Motion 11.5.4.
* **Data Visualization:** Recharts 2.12.7.
* **HTTP Client:** Axios 1.7.7.
* **Linter:** ESLint 9.9.0.

### Node.js Backend (`backend/`)
* **Runtime:** Node.js (ESM `"type": "module"`).
* **Web Framework:** Express 5.2.1.
* **Database ODM:** Mongoose 9.9.3 (MongoDB).
* **Validation:** Joi 18.2.5.
* **Authentication:** JSONWebToken 9.0.3, Bcryptjs 3.0.3, Cookie-Parser 1.4.7.
* **Security & Infrastructure:** Helmet 8.3.0, Express-Rate-Limit 8.7.1, Cors 2.8.6.
* **Logging:** Pino 10.4.0, Pino-HTTP 11.0.0.
* **File Handling & PDF:** Multer 2.3.0, File-Type 22.2.0, PDFKit 0.20.2, PDF-Lib 1.17.1.
* **API Documentation:** Swagger-UI-Express 5.0.1, YAMLJS 0.3.0.
* **Email Service:** Nodemailer 9.0.6, Mailtrap 4.9.0.
* **Test Runner:** Node.js native test runner (`node --test`, 49 passing tests).

### Forensics & Verification Microservice (`forensics_verification_service/`)
* **Runtime:** Python 3.11 / 3.14.
* **Web Framework:** FastAPI 0.162.0, Uvicorn 0.54.0.
* **Computer Vision & Forensics:** OpenCV (`opencv-python-headless` 5.0.0.93), Pillow 13.0.0, PyPDF 6.21.2.
* **HTTP Client:** HTTPX 0.28.1.
* **Data & Math:** NumPy 2.5.4, Pydantic (via FastAPI).
* **Testing:** Pytest 9.1.1.

### AI / Data Engine Prototype (`python-backend/`)
* **Framework:** FastAPI, Uvicorn, Pydantic.
* **Generative AI:** Google Generative AI (`google-generativeai`).
* **Dependencies in requirements:** Celery, Redis, SQLAlchemy, psycopg2-binary, networkx [NEEDS FACT: Celery/Redis are unconfigured in `main.py`].

### Hosting & Deployment Method
* **Forensics Microservice:** Dockerfile present (`python:3.11-slim`, exposes port 8000, runs Uvicorn).
* **Node.js Backend & Frontend:** No Dockerfile or CI deployment configuration currently exists in the repository [NEEDS FACT]. Target deployment appears to be Linux VM / local server for Smart India Hackathon [NEEDS FACT].

---

## 2. Folder Map

```text
BIDWISE_AI/
├── README.md                                # Project overview, architecture diagram, and feature summary
├── package.json                             # Root orchestrator package for frontend/backend scripts
├── docs/
│   ├── ai-service-contract.md               # Proposed contract for AI endpoints (render, analyze, forensics)
│   └── CODEBASE.md                          # Current inherited codebase audit report
├── backend/
│   ├── package.json                         # Node Express dependencies and test scripts
│   ├── server.js                            # Server entrypoint, DB connection, job worker initialization
│   ├── src/
│   │   ├── app.js                           # Express application configuration, rate limiters, route mounts
│   │   ├── common/                          # Shared utilities, middleware, DTOs, configs, and logger
│   │   │   ├── config/                      # Database (db.js) and Pino logger (logger.js)
│   │   │   ├── constants/                   # Shared enum values (statuses.js)
│   │   │   ├── dto/                         # Joi base DTO and shared parameter validation schemas
│   │   │   ├── middleware/                  # Error handler, rate limiters, multer upload, and DTO validator
│   │   │   └── utils/                       # ApiError, ApiResponse, cookie, JWT, and pagination helpers
│   │   └── modules/                         # Domain-driven backend modules
│   │       ├── audit/                       # Audit logging model (audit-log.model.js)
│   │       ├── auth/                        # User authentication, password reset, JWT tokens, and RBAC
│   │       ├── bids/                        # Bid creation, status updates, query service, and hardened upload
│   │       ├── clauses/                     # Tender clause schema (clause.model.js)
│   │       ├── documents/                   # File upload service, magic byte validation, page rendering
│   │       ├── evaluations/                 # Clause evaluation model, review overrides, score recalculation
│   │       ├── files/                       # HMAC-SHA256 signed URL generation and file streaming
│   │       ├── forensics/                   # Forensic alerts model, alert triage queries, signed ELA URLs
│   │       ├── integrations/                # HTTP clients for Python AI service and statutory mock adapters
│   │       ├── jobs/                        # Persistent Job queue model, worker loop, atomic locking
│   │       ├── pipeline/                    # 6-stage async pipeline (render, analyze, rules, verify, forensics, score)
│   │       ├── rules/                       # Deterministic evaluation rules (BIS/ISO, MII, OEM-MAF, Turnover, Udyam)
│   │       ├── storage/                     # File path resolution, directory initialization, sha256 hashing
│   │       ├── tec/                         # Rejection note draft generation, editing, and PDFKit export
│   │       └── tenders/                     # Tender management, clause attachment, matrix & live KPI calculation
│   ├── docs/
│   │   └── openapi.yaml                     # OpenAPI 3.0 specification for Swagger UI
│   ├── tests/                               # 49 unit and integration tests (rules, worker, matrix, tec)
│   └── uploads/                             # Local disk storage root (bids/, tenders/, temp/)
├── forensics_verification_service/          # Standalone FastAPI service for forensics & statutory checks
│   ├── Dockerfile                           # Container definition for forensics service
│   ├── README.md                            # Service usage instructions, endpoint docs, and limit descriptions
│   ├── main.py                              # FastAPI entrypoint (/verify/*, /forensics/*, /demo/*)
│   ├── models.py                            # Pydantic schemas (ForensicsResponse, Evidence with fractional bbox)
│   ├── mock_data.json                       # Seeded stories for AstraNet, Nexus_Global, Shivalik_Digitech
│   ├── forensics_ela.py                     # OpenCV Error Level Analysis heatmap generator
│   ├── forensics_metadata.py                # PyPDF structural and metadata tamper inspector
│   ├── verifiers/base.py                    # Mock statutory verifiers (GST, Udyam, UDIN)
│   ├── samples/                             # Sample PDFs and images (clean and tampered)
│   ├── smoke_test.py                        # Live HTTP integration smoke test suite
│   └── test_main.py                         # Pytest suite for FastAPI endpoints
├── frontend/
│   ├── package.json                         # Vite and React dependencies
│   ├── vite.config.js                       # Vite configuration with /api proxy to http://localhost:4000
│   ├── tailwind.config.js                   # Government of India color palette and typography config
│   ├── index.html                           # HTML template importing Open Sans Google Font
│   └── src/
│       ├── App.jsx                          # Main app component mounting AppRouter
│       ├── assets/                          # Static branding vector assets (Emblem_of_India.svg)
│       ├── index.css                        # Tailwind directives, CSS component utilities, status dots
│       ├── components/
│       │   ├── layout/                      # GovHeader, GovNavbar, AppSidebar, AppLayout
│       │   └── ui/                          # Badge, Button, Card, Input
│       ├── lib/api.js                       # Centralized Axios client with token injector & refresh handler
│       ├── pages/                           # 17 page views (auth, dashboard, compliance, risk, review)
│       ├── router/index.jsx                 # React Router browser routes and PrivateRoute guard
│       └── store/                           # Zustand stores (authStore.js, uiStore.js)
└── python-backend/                          # Alternate AI backend prototype
    ├── main.py                              # FastAPI app mounting /api/v1/bids, /chat, /dashboard
    ├── requirements.txt                     # Python dependencies
    ├── ai_engine/                           # Risk scoring model and rule heuristic prototypes
    ├── api/routes/                          # Mock routes for bids, chat assistant, and dashboard analytics
    └── services/                            # Hash service, mock gov API, and OCR stubs
```

---

## 3. Conventions You Can Actually See

### File and Component Naming
* **Frontend React Components:** PascalCase filenames matching the exported component (`GovHeader.jsx`, `PdfReviewPage.jsx`, `AppLayout.jsx`).
* **Backend Modules:** Feature-first modular grouping with kebab-case filenames indicating role: `[feature].controller.js`, `[feature].service.js`, `[feature].routes.js`, `[feature].model.js`, `[action].dto.js`.
* **Python Modules:** Standard snake_case filenames (`forensics_ela.py`, `forensics_metadata.py`, `risk_model.py`).

### CSS Approach
* **Tailwind CSS Utility Classes:** Used inline across JSX components.
* **Custom Reusable Classes:** Defined via `@layer components` in `frontend/src/index.css` (`.glass-card`, `.light-card`, `.status-dot-*`).
* **Direct Hex Classes:** Frequent use of unaliased arbitrary Tailwind color classes in JSX (e.g. `bg-[#f8d7da]`, `text-[#721c24]`, `border-[#dee2e6]`) rather than central theme tokens.

### State Handling
* **Authentication State:** Zustand in `frontend/src/store/authStore.js` with `persist` middleware. Stores `user` and `isAuthenticated` in `localStorage` under `gem-auth`. Access token is maintained in memory.
* **UI State:** Zustand in `frontend/src/store/uiStore.js` managing sidebar collapse state.
* **Page State:** Standard local React `useState` and `useEffect` for data loading and form interactions.

### How Data is Fetched
* **Two Divergent Patterns:**
  1. `frontend/src/lib/api.js`: Pre-configured Axios client targeting `/api/v1` via Vite's proxy (`http://localhost:4000`), with request token injection and automatic 401 refresh retry.
  2. Direct `fetch()`: 13 page components hardcode direct HTTP calls to `http://localhost:8000/api/v1/...`, bypassing `api.js` and the Node.js backend.

### How Errors are Shown
* **Frontend:** Browser `alert()` calls on export/download actions; catch blocks log to `console.error` with occasional inline error text.
* **Backend:** Operational errors throw instances of `ApiError` (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`), caught by `errorHandler` middleware returning `{ success: false, msg: "..." }`.

---

## 4. Design As It Exists Now

### Extracted Color Palette (`tailwind.config.js` & `index.css`)
* **Government Theme Tokens:**
  * `gov-blue`: `#003c8f` (Main banner, headers, primary buttons)
  * `gov-blue-light`: `#1976d2`
  * `gov-saffron`: `#ff9933` (National tricolor top accent)
  * `gov-green`: `#138808` (National tricolor bottom accent, verified signals)
  * `gov-bg`: `#f8f9fa` (Application background)
  * `gov-text`: `#212529` (Primary typography)
  * `gov-border`: `#dee2e6` (Card and panel borders)
* **Status Semantic Colors:**
  * Green (Pass / Verified): `#138808`, Pale: `#d4edda`, Light: `#28a745`
  * Amber (Warning / Review): `#ff9933`, Pale: `#fff3cd`
  * Red (Danger / Disqualified): `#dc3545`, Pale: `#f8d7da`
  * Blue (Info / Neutral): `#003c8f`, Pale: `#e3f2fd`
  * Muted: `#6c757d`
* **Raw Hex Codes in JSX (Not Shared in Config):**
  * High risk badge text: `#721c24` / border: `#f5c6cb`
  * Medium risk badge text: `#856404` / border: `#ffeeba`
  * Low risk badge text: `#004085` / border: `#b8daff`
  * Header navy subtext: `#002b66`

### Typography
* **Display Font:** `"Open Sans", sans-serif`
* **Body Font:** `"Open Sans", sans-serif`
* **Monospace Font:** `"Courier New", monospace`

### Spacing & Radii
* **Border Radii:** `rounded` (4px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-2xl` (16px), `rounded-full`.
* **Shadows:** `shadow-gem-card: 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)`. All glow effects and gradients are disabled (`none`).

---

## 5. Features That Exist and How to Run Each

### Fully Implemented Backend Features
1. **Authentication & RBAC (`modules/auth/`)**:
   * Registration, login, JWT refresh tokens, logout, password resets, role checks (`admin`, `procurement_officer`, `auditor`, `bidder`).
   * Run: Send `POST /api/v1/auth/login` to `http://localhost:4000`.
2. **Tender & Compliance Matrix Engine (`modules/tenders/`)**:
   * CRUD for tenders, clause management, bidder associations.
   * `GET /api/v1/tenders/:id/matrix` dynamically aggregates bidders against tender clauses and calculates live KPIs.
3. **Async Job Queue & Worker Pipeline (`modules/jobs/`, `modules/pipeline/`)**:
   * Multi-stage pipeline: `render` -> `analyze` -> `forensics` -> `rules` -> `verify` -> `score`.
   * In-process background worker with atomic MongoDB lock claiming, stuck-job recovery, and exponential retry backoff.
   * Run: Trigger `POST /api/v1/bids/:id/process`, inspect status via `GET /api/v1/bids/:id/status`.
4. **Deterministic Procurement Rule Engine (`modules/rules/`)**:
   * Evaluators for BIS/ISO expiry, Make-in-India Class-I/II local content, OEM MAF tender matching, 3-year turnover thresholds, and MSME Udyam NIC classification.
   * Run: `npm test` inside `backend/` runs all 49 test cases.
5. **HMAC Signed URL File Streaming (`modules/files/`)**:
   * Time-limited (5 min TTL) cryptographic file tokens for safe browser streaming without exposing underlying storage paths.
   * Run: `GET /api/v1/files/:token`.
6. **TEC Rejection Note Drafting & PDF Export (`modules/tec/`)**:
   * Generates formal rejection notices citing failed clauses, permits reviewer editing, and exports downloadable PDF via PDFKit.
   * Run: `GET /api/v1/bids/:id/tec-note/export`.
7. **Forensics & Verification Microservice (`forensics_verification_service/`)**:
   * OpenCV ELA heatmaps (`POST /forensics/ela`), PyPDF structure analysis (`POST /forensics/metadata`), mock statutory checks (`GET /verify/...`), and seeded demo stories (`GET /demo/bidders/{id}/forensics`).
   * Run: `uvicorn main:app --port 8001` inside `forensics_verification_service/`.

### Features That Look Half-Built
1. **Interactive PDF Review (`frontend/src/pages/review/PdfReviewPage.jsx`)**:
   * Uses simulated HTML/CSS text and hardcoded static annotation boxes (`ANNOTATIONS`) rather than rendering actual PDF pages and plotting dynamic fractional bounding box coordinates.
2. **Fraud Detection Page (`frontend/src/pages/fraud/FraudDetectionPage.jsx`)**:
   * Synthesizes alerts on the client side using `b.riskScore > 50` rather than querying real backend forensic alerts (`GET /api/v1/bids/:id/forensics` or `GET /demo/bidders/:id/forensics`).
3. **AI Service Integration (`backend/src/modules/integrations/ai.client.js`)**:
   * Connects to `/render`, `/analyze`, and `/forensics` as specified in `docs/ai-service-contract.md`. If the external AI service is unreachable, it defaults to mock return fixtures rather than using `forensics_verification_service`.
4. **OCR Service Stub (`python-backend/services/ocr_service.py`)**:
   * Returns a static hardcoded string instead of performing real OCR on uploaded files.

---

## 6. Backend Layer

* **Data Storage:** MongoDB via Mongoose. Files are stored on the local filesystem under `backend/uploads/` (`temp/`, `tenders/`, `bids/`).
* **Authentication Flow:**
  * Access token: 15-minute expiration, signed with `JWT_ACCESS_SECRET`, returned in response JSON.
  * Refresh token: 7-day expiration, signed with `JWT_REFRESH_SECRET`, stored in an httpOnly cookie.
  * Frontend persists user profile in `localStorage` (`gem-auth`) and sends access token in the `Authorization: Bearer <token>` header.
* **Permission Checks:**
  * Server-side: `authenticate` validates access token; `authorize(...roles)` blocks unauthorized roles before controller execution.
  * Browser-side: `PrivateRoute` in `router/index.jsx` redirects unauthenticated visitors to `/login`.
* **Environment Keys by Name (No values stored):**
  * `PORT`, `NODE_ENV`, `LOG_LEVEL`
  * `MONGO_URI`
  * `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`
  * `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
  * `EMAIL_TOKEN`
  * `CORS_ORIGIN`, `ALLOWED_ORIGINS`
  * `FILE_URL_SECRET`
  * `UPLOAD_DIR`
  * `AI_SERVICE_URL`, `AI_REQUEST_TIMEOUT_MS`, `MOCK_AI`
  * `JOB_CONCURRENCY`, `JOB_POLL_INTERVAL_MS`, `JOB_LOCK_TIMEOUT_MS`
  * `GEMINI_API_KEY` (in `python-backend`)
* **Security Status (File Secret):**
  * `backend/src/modules/files/file-token.service.js` now strictly enforces `FILE_URL_SECRET` in production (`NODE_ENV === "production"`), throwing a fatal error on missing configuration. Development/test environments fall back to ephemeral keys.

---

## 7. Known Problems

### Fixed in Stage 1 (Backend Hardening & Frontend Floor)
* ✅ **Hardcoded Secret Fallback:** Resolved; throws fatal error in production if `FILE_URL_SECRET` is unset.
* ✅ **Path Traversal Prefix Bypass:** Resolved in `storage.service.js` using `path.relative(UPLOAD_ROOT, safePath)` boundary check.
* ✅ **Multipart File Leak:** Resolved; `POST /api/v1/bids/upload` now routes files through `documentsService.uploadBidDocuments()`.
* ✅ **Dead Code / Cart Module:** Resolved; `modules/cart/` deleted and unmounted.
* ✅ **N+1 Database Updates:** Resolved in `rules.stage.js` using atomic `ClauseEvaluation.bulkWrite()`.
* ✅ **Missing Compound Indexes:** Resolved; added `{ tender: 1, status: 1 }` and `{ bid: 1, severity: 1, status: 1 }`.
* ✅ **Route Validation & CastErrors:** Resolved; added `ObjectIdParamDto`, `BidIdParamDto`, `TenderIdParamDto`, and `RefreshTokenDto`.
* ✅ **Logging & ApiError Inconsistencies:** Resolved; replaced `console.*` with Pino logger; removed duplicate `ApiError.notfound()`.
* ✅ **OpenAPI Specification Gaps:** Resolved; added full documentation for auth, bids, tenders, and documents; fixed file path resolution.
* ✅ **Frontend Floor & Emblem:** Resolved; official emblem added, responsive header wrapping fixed, high-contrast `:focus-visible` added, `prefers-reduced-motion` reset added, and chart contrast fixed.

### Remaining Open Problems (Deferred to Stage 2)
1. **Port Collision:** `python-backend/main.py` and `forensics_verification_service/main.py` both attempt to bind to port 8000 by default. `forensics_verification_service` needs reassignment to port 8001.
2. **Frontend Decoupling:** 13 React pages hardcode calls to `http://localhost:8000`, bypassing the Express backend on port 4000 and the Vite `/api` proxy.
3. **Interactive PDF Review Bounding Boxes:** `PdfReviewPage.jsx` currently displays static mockup annotations rather than rendering fractional `[x, y, w, h]` bounding boxes returned by the forensics API (`GET /demo/bidders/{id}/forensics`).
4. **SVG File Size:** `frontend/src/assets/Emblem_of_India.svg` is 438 KB; should be optimized via SVGO for faster initial load.

---

## 8. Do-Not-Touch List

* `backend/src/modules/rules/*` (`bis-iso.rule.js`, `mii.rule.js`, `oem-maf.rule.js`, `turnover.rule.js`, `udyam-nic.rule.js`): Pure, deterministic rule implementations covered by comprehensive unit tests.
* `backend/src/modules/jobs/worker.js`: Atomic MongoDB claiming and stuck-job recovery logic verified by concurrency test suites.
* `backend/src/common/constants/statuses.js`: Central enum definitions imported by models, stages, and controllers across the backend.
* `forensics_verification_service/mock_data.json`: Fixed test data for the 3 hackathon demonstration bidders (`AstraNet`, `Nexus_Global`, `Shivalik_Digitech`).
* `frontend/src/components/layout/GovHeader.jsx` & `GovNavbar.jsx`: Standardized Indian Government branding assets.

---

## 9. Open Questions for the Owner

1. **Python Service Role:** Should `python-backend` (legacy mock routes and chat) be phased out in favor of `forensics_verification_service`, or should both coexist with `forensics_verification_service` moved to port 8001?
2. **Frontend Target Backend:** Should all frontend page calls be unified to use `frontend/src/lib/api.js` (pointing to the Node.js backend on port 4000), allowing Node.js to orchestrate statutory and forensics requests?
3. **Database Setup:** Is MongoDB running as a standalone local instance, or should a Docker Compose configuration be established for all services?
