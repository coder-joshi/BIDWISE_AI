# Changelog

All notable changes to the BidWise AI platform are documented in this file.

---

## [2026-10-25] — Backend Hardening (Stage 1) & Frontend Emblem & Quality Floor Fixes

### What Changed
* **Backend Security Hardening**:
  * **File Token Secret**: Enforced `FILE_URL_SECRET` check in production (`NODE_ENV === "production"`), throwing a fatal startup error if omitted.
  * **Storage Path Traversal Protection**: Replaced prefix check `startsWith(UPLOAD_ROOT)` with `path.relative(UPLOAD_ROOT, safePath)` to prevent sibling-prefix directory boundary traversal.
  * **Dead Code Removal**: Deleted abandoned e-commerce cart module (`backend/src/modules/cart/`) and unmounted `/api/v1/cart`.
  * **Temp File Leak Fix**: Refactored `POST /api/v1/bids/upload` and `bidsService.createBid()` to validate magic bytes, move files to permanent storage, and persist `Document` records via `documentsService.uploadBidDocuments()`.
  * **Route Parameter & DTO Validation**: Added `ObjectIdParamDto`, `BidIdParamDto`, and `TenderIdParamDto` validation to previously unprotected routes (`/:id/process`, `/:id/status`, `/:bidId/documents`, `/:tenderId/documents`). Created `RefreshTokenDto` for `POST /api/v1/auth/refresh`. Added sanitizer against NoSQL operator injection and script payloads.
  * **Mongoose CastError Guard**: Added ObjectId validation in `auth.middleware.js` to reject malformed token IDs with `401 Unauthorized` instead of uncaught database cast errors.
* **Backend Performance & Optimization**:
  * **Bulk Rules Persistence**: Replaced sequential `await evaluation.save()` in `rules.stage.js` with a single atomic `ClauseEvaluation.bulkWrite()`.
  * **Compound Indexes**: Added `{ tender: 1, status: 1 }` to `ClauseEvaluation` and `{ bid: 1, severity: 1, status: 1 }` to `ForensicAlert`.
  * **BBox Normalization**: Added `normalizeBbox()` helper handling both `[x, y, w, h]` arrays and `{ x, y, w, h }` objects.
* **Documentation & OpenAPI**:
  * Added 302 lines to `backend/docs/openapi.yaml` documenting all `/auth/*`, `/tenders/*`, `/bids/*`, and `/documents/*` endpoints. Fixed Swagger UI path resolution using `import.meta.dirname`.
  * Documented all runtime variables in `backend/.env.example`.
* **Frontend Emblem & Accessibility**:
  * Added official State Emblem of India (`frontend/src/assets/Emblem_of_India.svg`) and replaced placeholder box in `GovHeader.jsx` with explicit dimensions (`40x56px`).
  * Fixed responsive header overflow at 360/390px widths.
  * Added high-contrast `:focus-visible` ring (`#003c8f`) and `@media (prefers-reduced-motion: reduce)` reset in `index.css`.
  * Replaced `<rect>` with `<Cell>` in `DashboardPage.jsx` risk distribution chart and formatted chart legend text to ensure WCAG AA (10.31:1) contrast.
  * Pointed favicon in `index.html` away from missing `/gem-icon.svg`.

### Files Touched
* `backend/.env.example`
* `backend/docs/openapi.yaml`
* `backend/src/app.js`
* `backend/src/common/config/db.js`
* `backend/src/common/dto/base.dto.js`
* `backend/src/common/dto/params.dto.js`
* `backend/src/common/utils/api-error.js`
* `backend/src/common/utils/email.js`
* `backend/src/modules/auth/auth.middleware.js`
* `backend/src/modules/auth/auth.routes.js`
* `backend/src/modules/auth/dto/refresh-token.dto.js` (new)
* `backend/src/modules/auth/dto/register.dto.js`
* `backend/src/modules/bids/bids.controller.js`
* `backend/src/modules/bids/bids.routes.js`
* `backend/src/modules/bids/bids.service.js`
* `backend/src/modules/bids/dto/upload-bid.dto.js` (new)
* `backend/src/modules/cart/` (deleted: `cart.controller.js`, `cart.model.js`, `cart.routes.js`, `cart.service.js`)
* `backend/src/modules/evaluations/evaluation.model.js`
* `backend/src/modules/files/file-token.service.js`
* `backend/src/modules/forensics/forensic-alert.model.js`
* `backend/src/modules/pipeline/analyze.stage.js`
* `backend/src/modules/pipeline/rules.stage.js`
* `backend/src/modules/storage/storage.service.js`
* `backend/src/modules/tec/dto/update-tec-note.dto.js`
* `backend/src/modules/tenders/dto/create-clauses.dto.js`
* `backend/src/modules/tenders/dto/create-tender.dto.js`
* `backend/src/modules/tenders/dto/update-tender.dto.js`
* `backend/src/modules/tenders/tenders.routes.js`
* `backend/tests/signed-urls.test.js`
* `docs/SECURITY.md` (new)
* `frontend/index.html`
* `frontend/src/assets/Emblem_of_India.svg` (new)
* `frontend/src/components/layout/GovHeader.jsx`
* `frontend/src/index.css`
* `frontend/src/pages/dashboard/DashboardPage.jsx`

### Tests Run & Results
* **Backend Test Suite (`node --test`)**: 54 passing tests, 0 failed, 0 skipped (`duration: ~335ms`).
  * 49 pre-existing tests + 5 new tests covering path-traversal rejection, production `FILE_URL_SECRET` enforcement, auth/RBAC checks, bbox normalization, and injection input validation.
* **Frontend Production Build (`vite build`)**: Pass (`built in 2.39s`).
* **Playwright Quality Audit**:
  * 0px horizontal scroll across 360, 390, 768, 1024, 1440px.
  * Single semantic `<h1>` per page.
  * Text contrast passing WCAG AA (all >= 4.5:1, brand large text >= 10:1).
  * Reduced motion reset verified.

### What is Left (Deferred to Stage 2)
* **Python Services Port Conflict**: Reassign `forensics_verification_service` to port `8001` (currently colliding on 8000 with `python-backend`).
* **Frontend Backend Unification**: Refactor the 13 React pages in `frontend/src/pages/` to route requests through the centralized Axios client (`frontend/src/lib/api.js`) to the Node Express API on port 4000 instead of direct `http://localhost:8000` fetches.
* **Dynamic Bounding Box & Demo Bidder UI**: Connect `PdfReviewPage.jsx` to render fractional `[x, y, w, h]` bounding boxes dynamically, and integrate the 3 demo bidder stories (`AstraNet`, `Nexus_Global`, `Shivalik_Digitech`).

### Known Problems
* `forensics_verification_service` and `python-backend` both default to port 8000 when started locally without environment overrides.
* `frontend/src/assets/Emblem_of_India.svg` is 438 KB, which triggers a Vite asset warning and should be optimized via SVGO for production.
