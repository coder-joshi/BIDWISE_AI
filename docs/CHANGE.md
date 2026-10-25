# Change Specification — Stage 1: Backend Security, Validation & Performance Hardening

> **Cut Test Applied:** The 16-item audit spans both the Node.js Express backend (`backend/`) and the Python/React layers (`forensics_verification_service/` + `frontend/`). Shipping the backend security, validation, storage, and database hardening independently makes the platform immediately safer and faster without touching the UI or Python service. Therefore, **Stage 1 (this change)** covers all Node.js backend fixes (Flaws #1–#4, #7 backend normalization, #8–#16), while **Stage 2 (Forensics Port 8001 & Frontend API/BBox Integration)** is scoped out to the next change cycle.

---

## 1. Goal

**Harden** the Node.js Express backend by eliminating secret and path-traversal vulnerabilities, fixing multipart temp-file leaks and unvalidated route parameters, removing dead cart routes, and optimizing database writes and indexes.

---

## 2. Why

* **Security & SIH Evaluation Rubric:** Prevents forged HMAC file-stream tokens in production (`FILE_URL_SECRET` fallback), blocks sibling-prefix directory traversal (`uploads_backup` bypass), prevents Mongoose `CastError` crashes on malformed JWT payloads or route parameters, and removes unauthenticated/broken e-commerce cart endpoints (`/api/v1/cart`).
* **Resource & Operational Stability:** Stops orphaned uploads in `backend/uploads/temp` on `POST /api/v1/bids/upload`, eliminates sequential N+1 `evaluation.save()` roundtrips during the rules pipeline stage, adds compound indexes for tender matrix and forensic triage queries, and fixes Swagger UI `openapi.yaml` loading regardless of working directory.

---

## 3. File Boundaries

### Files You May Edit (Exact Paths)
1. `backend/src/modules/files/file-token.service.js` — Enforce `FILE_URL_SECRET` presence when `NODE_ENV === "production"`.
2. `backend/src/modules/storage/storage.service.js` — Replace `safePath.startsWith(UPLOAD_ROOT)` with `path.relative(UPLOAD_ROOT, safePath)` boundary check; replace `console.error` with Pino `logger.error`.
3. `backend/src/modules/bids/bids.routes.js` — Add `ObjectIdParamDto` / `BidIdParamDto` validation on `/:id/process`, `/:id/status`, `/:bidId/documents`, `/:id`, and `/:id/status`; add `PaginationQueryDto` on `GET /`.
4. `backend/src/modules/bids/bids.controller.js` — Pass pagination query params to `bidsService.getAllBids(req.validated?.query || req.query)`.
5. `backend/src/modules/bids/bids.service.js` — Route uploaded files in `createBid()` through `documentsService.uploadBidDocuments()` so temp files are validated, moved to permanent storage, and persisted as `Document` records; standardize `getAllBids()` with `paginate()`.
6. `backend/src/app.js` — Remove `cartRoutes` import and `/api/v1/cart` mount; resolve `openapi.yaml` via `path.resolve(import.meta.dirname, "../docs/openapi.yaml")`.
7. `backend/src/modules/evaluations/evaluation.model.js` — Export `normalizeBbox(bbox)` helper converting `[x, y, w, h]` arrays to `{ x, y, w, h }` objects and add compound index `{ tender: 1, status: 1 }`.
8. `backend/src/modules/pipeline/analyze.stage.js` — Use `normalizeBbox(ev.bbox)` when persisting AI/forensics evidence bounding boxes.
9. `backend/src/common/dto/params.dto.js` — Add `BidIdParamDto` (`bidId`) and `TenderIdParamDto` (`tenderId`) or a configurable `createObjectIdParamDto(paramName)` helper.
10. `backend/src/modules/tenders/tenders.routes.js` — Validate `:tenderId` param on `POST /:tenderId/documents`.
11. `backend/src/modules/auth/auth.routes.js` — Validate `POST /refresh` with `RefreshTokenDto`.
12. `backend/src/modules/auth/auth.middleware.js` — Check `mongoose.Types.ObjectId.isValid(decoded?.id)` before `User.findById(decoded.id)`.
13. `backend/src/modules/pipeline/rules.stage.js` — Replace sequential `await evaluation.save()` inside the loop with a single `ClauseEvaluation.bulkWrite(bulkOps)`.
14. `backend/src/modules/forensics/forensic-alert.model.js` — Add compound index `{ bid: 1, severity: 1, status: 1 }`.
15. `backend/docs/openapi.yaml` — Add missing endpoint specifications (`/auth/*`, `POST /tenders`, `PATCH /tenders/:id`, document upload/delete routes).
16. `backend/.env.example` — Document `FILE_URL_SECRET`, `UPLOAD_DIR`, `AI_SERVICE_URL`, `AI_REQUEST_TIMEOUT_MS`, `MOCK_AI`, `JOB_CONCURRENCY`, `JOB_POLL_INTERVAL_MS`, and `JOB_LOCK_TIMEOUT_MS`.
17. `backend/src/common/utils/email.js` — Replace `console.log` / `console.error` with `logger.info` / `logger.error`.
18. `backend/src/common/utils/api-error.js` — Remove duplicate `ApiError.notfound()` method in favor of `ApiError.notFound()`.

### New Files You May Create (Exact Paths)
1. `backend/src/modules/auth/dto/refresh-token.dto.js` — Joi DTO allowing optional body `refreshToken` string (when cookie is not used) and rejecting non-string payloads.

### Files to Delete (Exact Paths)
1. `backend/src/modules/cart/cart.routes.js`
2. `backend/src/modules/cart/cart.controller.js`
3. `backend/src/modules/cart/cart.service.js`
4. `backend/src/modules/cart/cart.model.js`

### Files You Must NOT Touch
* `backend/src/modules/rules/*` (`bis-iso.rule.js`, `mii.rule.js`, `oem-maf.rule.js`, `turnover.rule.js`, `udyam-nic.rule.js`, `index.js`) — Deterministic rule evaluators covered by unit tests.
* `backend/src/modules/jobs/worker.js` — Atomic MongoDB job-claiming and stuck-job recovery loop.
* `backend/src/common/constants/statuses.js` — Shared enum definitions.
* `forensics_verification_service/*` — Deferred to Stage 2.
* `frontend/*` — Deferred to Stage 2.

---

## 4. Blast Radius

| Edited File | Imported By / Callers | What Could Break |
| :--- | :--- | :--- |
| `file-token.service.js` | `documents.service.js`, `forensics.service.js`, `files.controller.js`, `tests/storage-token.test.js` | If `NODE_ENV=production` is set in a test or deployment without `FILE_URL_SECRET`, signed URL generation/verification will throw a fatal error by design. Development/test environments (`NODE_ENV !== "production"`) continue using the fallback. |
| `storage.service.js` | `app.js`, `file-token.service.js`, `files.controller.js`, `documents.service.js`, `render.stage.js`, `forensics.stage.js` | `resolveSafePath("")` or keys resolving outside `UPLOAD_ROOT` will throw `"Path traversal detected"`. Valid relative keys (`bids/<id>/<uuid>.pdf`) remain unaffected. |
| `bids.routes.js` & `bids.service.js` | `app.js`, `tenders.controller.js`, frontend `BidsListPage.jsx` / `UploadBidPage.jsx` | 1) `GET /api/v1/bids/:id` previously allowed string `tenderId` lookup via `findBidQuery(id)`; if strict `ObjectIdParamDto` is enforced on `GET /bids/:id`, passing a `GEM/...` bid number instead of a 24-hex ObjectId will return `400 Bad Request`.<br>2) Changing `GET /api/v1/bids` from a flat array to `{ items, page, limit, total }` affects callers expecting `res.data.data` to be an `Array`. |
| `rules.stage.js` | `pipeline/index.js`, `jobs/worker.js` | `ClauseEvaluation.bulkWrite()` bypasses Mongoose `save()` middleware (none are registered on `clauseEvaluationSchema`), while preserving identical `status`, `calculation`, and `reasoning` updates. |
| `api-error.js` | All controllers, services, and middleware across `backend/src/` | Only `cart.service.js` (lines 37, 49) called `ApiError.notfound()` with a lowercase `f`. Deleting `cart/` and `ApiError.notfound()` together leaves zero broken callers. |

---

## 5. Design & Component Reuse

This change is strictly backend-only (no UI components or CSS tokens touched). Existing backend utilities reused:
* `BaseDto` & `OBJECT_ID_REGEX` (`backend/src/common/dto/params.dto.js`) — Reused for route parameter validation (`id`, `bidId`, `tenderId`).
* `validateDto` (`backend/src/common/middleware/validate.middleware.js`) — Reused across `bids.routes.js`, `tenders.routes.js`, and `auth.routes.js`.
* `documentsService.uploadBidDocuments` (`backend/src/modules/documents/documents.service.js`) — Reused inside `bidsService.createBid()` to validate magic bytes, move temp files, and create `Document` records atomically.
* `paginate` (`backend/src/common/utils/paginate.js`) — Reused in `bids.service.js` for consistent paginated list responses.
* `logger` (`backend/src/common/config/logger.js`) — Reused in `email.js` and `storage.service.js` in place of raw `console.*`.
* **New file justification (`refresh-token.dto.js`):** Needed so `POST /api/v1/auth/refresh` validates optional body `refreshToken` strings via `validateDto` before controller execution.

---

## 6. Permissions, Data Model & Existing Rules/Tables Touched

### Permissions Table

| Endpoint / Operation | `anonymous` | `bidder` | `auditor` | `procurement_officer` | `admin` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `GET /api/v1/health` | Allow | Allow | Allow | Allow | Allow |
| `POST /api/v1/auth/refresh` | Allow (requires valid refresh token in cookie or body) | Allow | Allow | Allow | Allow |
| `GET /api/v1/files/:token` | Allow (requires valid unexpired HMAC token) | Allow | Allow | Allow | Allow |
| `GET /api/v1/cart/*` | **Removed (404)** | **Removed (404)** | **Removed (404)** | **Removed (404)** | **Removed (404)** |
| `POST /api/v1/bids/upload` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |
| `POST /api/v1/bids/:bidId/documents` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |
| `POST /api/v1/tenders/:tenderId/documents` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |
| `POST /api/v1/bids/:id/process` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |
| `GET /api/v1/bids/:id/status` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |
| `GET /api/v1/bids` & `GET /api/v1/bids/:id` | Deny (401) | Deny (403) | Deny (403) | Allow | Allow |

### Data Models & Collections Touched
* **`ClauseEvaluation` (`evaluation.model.js`)**: Adds compound index `{ tender: 1, status: 1 }` and exports `normalizeBbox(bbox)` so `[x, y, w, h]` arrays normalize cleanly into `{ x, y, w, h }`. Updated via `ClauseEvaluation.bulkWrite()` in `rules.stage.js`.
* **`ForensicAlert` (`forensic-alert.model.js`)**: Adds compound index `{ bid: 1, severity: 1, status: 1 }`.
* **`Document` (`document.model.js`) & `Bid` (`bids.model.js`)**: `bidsService.createBid()` now delegates uploaded `files` to `documentsService.uploadBidDocuments()`, creating `Document` records and moving files from `uploads/temp` to `uploads/bids/<bidId>/`.
* **`Cart` (`cart.model.js`)**: Collection model and module deleted.

---

## 7. Failure States & Edge Cases

### Failure States (Exact Messages Returned)

1. **Missing Production File Secret (`500 Internal Server Error` / Startup Fault):**
   * *Condition:* `NODE_ENV === "production"` and `FILE_URL_SECRET` is unset when generating or verifying a file token.
   * *Exact Error Thrown:* `"FATAL: FILE_URL_SECRET environment variable must be set in production"` (returns `{ "success": false, "msg": "Internal server error", "message": "Internal server error" }` to external callers in production while logging the exact fatal error via Pino).
2. **Sibling-Prefix Path Traversal Attempt (`403 Forbidden` on `/api/v1/files/:token` or `Error` in `resolveSafePath`):**
   * *Condition:* Storage key resolves to a sibling folder sharing the prefix (e.g., `../uploads_backup/secret.pdf`).
   * *Exact Message:* `{ "success": false, "msg": "Path traversal detected in file key", "message": "Path traversal detected in file key" }` (or `"Path traversal detected"` from `resolveSafePath`).
3. **Invalid ObjectId in Route Parameters (`400 Bad Request`):**
   * *Condition:* Non-hex or wrong-length ID passed to `/api/v1/bids/not-an-id/process`, `/api/v1/bids/not-an-id/documents`, or `/api/v1/tenders/not-an-id/documents`.
   * *Exact Message:* `{ "success": false, "msg": "Invalid ID: must be a valid 24-character ObjectId", "message": "Invalid ID: must be a valid 24-character ObjectId" }`.
4. **Malformed `decoded.id` in Access Token (`401 Unauthorized`):**
   * *Condition:* Structurally valid JWT signature containing a non-ObjectId `id` payload (e.g. `{ "id": "malformed_id" }`).
   * *Exact Message:* `{ "success": false, "msg": "Invalid token payload", "message": "Invalid token payload" }`.
5. **Removed Cart Endpoint Accessed (`404 Not Found`):**
   * *Condition:* Client sends `GET /api/v1/cart` or `POST /api/v1/cart`.
   * *Exact Message:* `{ "success": false, "msg": "Cannot GET /api/v1/cart", "message": "Cannot GET /api/v1/cart" }`.

### Edge Cases
1. **Empty `evaluations` Array in `rules.stage.js`:** When a bid has `0` clause evaluations, `bulkOps` is empty (`[]`); `ClauseEvaluation.bulkWrite` must be skipped via `if (bulkOps.length > 0)` so MongoDB does not throw an empty bulk-write error.
2. **Cookie-Based vs Body-Based Token Refresh (`POST /api/v1/auth/refresh`):** Browser clients send `refreshToken` via `httpOnly` cookie with an empty JSON body `{}`; `RefreshTokenDto` must allow `{ refreshToken: Joi.string().optional() }` so cookie-only requests pass DTO validation and `authService.refresh()` still throws `401 Refresh token missing` if neither cookie nor body token is present.
3. **Legacy `POST /api/v1/bids/upload` Called With Zero Files vs Invalid Files:** If `files` is empty, `createBid()` creates the `Bid` record without calling `uploadBidDocuments()`. If `files` contains an invalid file (e.g., spoofed `.exe` renamed to `.pdf`), `uploadBidDocuments()` cleans up all temp files and rolls back created `Bid`/`Document` state so nothing leaks in `uploads/temp/`.
4. **Bounding Box Already Normalized or Missing:** `normalizeBbox(bbox)` handles `[x, y, w, h]` arrays of length 4, existing `{ x, y, w, h }` objects, and `null`/`undefined` (falling back to `{ x: 0.1, y: 0.1, w: 0.8, h: 0.1 }` in `analyze.stage.js`).

---

## 8. Acceptance Tests (Plain Words)

1. **DENIED Test (Unauthorized Role / Malformed Token):** Sending `POST /api/v1/bids/<validObjectId>/process` as a `bidder` role returns `403 Forbidden` (`"You do not have permission to perform this action"`), and sending a Bearer token whose decoded `id` is not a 24-char ObjectId returns `401 Unauthorized` (`"Invalid token payload"`) without throwing a Mongoose `CastError`.
2. **Production Secret Enforcement:** When `NODE_ENV=production` and `FILE_URL_SECRET` is unset, calling `generateSignedFileUrl("bids/test.pdf")` throws `"FATAL: FILE_URL_SECRET environment variable must be set in production"`.
3. **Sibling Directory Traversal Blocked:** Calling `resolveSafePath("../uploads_backup/leak.pdf")` throws `"Path traversal detected"`.
4. **Cart Module Removed:** Sending `GET /api/v1/cart` returns `404 Not Found` (`"Cannot GET /api/v1/cart"`), and the `backend/src/modules/cart/` directory no longer exists.
5. **Param Validation Guard:** Calling `POST /api/v1/bids/invalid-id/process`, `GET /api/v1/bids/invalid-id/status`, `POST /api/v1/bids/invalid-id/documents`, or `POST /api/v1/tenders/invalid-id/documents` returns `400 Bad Request` with `"Invalid ID: must be a valid 24-character ObjectId"`.
6. **Zero Temp File Leak on Legacy Upload:** Uploading a valid PDF via `POST /api/v1/bids/upload` creates both the `Bid` and `Document` records and moves the file out of `backend/uploads/temp/` into `backend/uploads/bids/<bidId>/`.
7. **Bulk Rules Persistence & Existing Test Suite:** `runRulesStage` updates all `ClauseEvaluation` documents in a single `bulkWrite` call, and `npm test` inside `backend/` passes all existing unit and concurrency tests.

---

## 9. Out of Scope (Split to Stage 2 per Cut Test)

* **Flaw #5 (Python Port Conflict):** Changing `forensics_verification_service` from port `8000` to `8001` in `main.py`, `Dockerfile`, and `README.md`.
* **Flaw #6 (Frontend Direct Port 8000 Calls):** Refactoring the 13 React pages in `frontend/src/pages/` to use the centralized API client instead of hardcoded `http://localhost:8000` fetches.
* **Flaw #7 (Frontend Bounding Box Rendering):** Updating `frontend/src/pages/review/PdfReviewPage.jsx` to dynamically render fractional `[x, y, w, h]` coordinates and demo bidder forensics (`AstraNet`, `Nexus_Global`, `Shivalik_Digitech`).

---

## 10. Branch Name & Rollback Plan

* **Branch Name:** `fix/backend-security-and-audit-hardening`
* **How to Roll It Back:**
  ```bash
  git checkout main
  git branch -D fix/backend-security-and-audit-hardening
  ```
  Or, if already merged, revert the single stage commit:
  ```bash
  git revert <commit-sha>
  ```
  (The two new MongoDB compound indexes on `clauseevaluations` and `forensicalerts` are non-destructive and backward-compatible; if desired, they can be dropped via `db.clauseevaluations.dropIndex({ tender: 1, status: 1 })` and `db.forensicalerts.dropIndex({ bid: 1, severity: 1, status: 1 })`.)
