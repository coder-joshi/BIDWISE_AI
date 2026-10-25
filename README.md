# BidWise AI (BidVerify)

Checks government tender bids against the tender's clauses and flags documents for a human committee to verify.

**Live link:** [NEEDS FACT] (no deployment found in the repo; runs locally, see "Run it locally")

![Dashboard at 1440px, 2026-10-25](shots/dashboard-desktop-after.png)

## The problem

**Who:** procurement officers and evaluation committees (TEC) reviewing bids on the Government e-Marketplace (GeM).
**What:** each bidder submits PDFs (GST, PAN, Udyam, turnover certificates, ISO, OEM authorisation). Officers check each one against the tender's clauses by hand.
**Constraint:** this is a Smart India Hackathon 2026 prototype. Registry lookups (GST, Udyam, UDIN) are mocked, there is no live deployment, and the output must be an alert for a committee, never a finding of fraud.

## What I built

Working and covered by tests:
- **Auth and roles.** Login, refresh tokens in an httpOnly cookie, and server-side role checks. Only `admin` and `procurement_officer` can reach tenders, bids, evaluations and forensics.
- **Tenders, clauses and bidders**, with a clause-by-bidder compliance matrix and live counts.
- **Document upload.** Magic-byte check, PDF parse, duplicate rejection per bid, stored outside the web root.
- **Signed file URLs.** Documents open through a 5-minute HMAC link.
- **Background pipeline.** Six stages (render, analyze, forensics, rules, verify, score) run by a job queue with retry and stuck-job recovery.
- **Rule engine.** Pure functions for BIS/ISO expiry, Make-in-India local content, OEM authorisation, 3-year turnover and Udyam NIC code.
- **TEC rejection note.** Draft, edit, export to PDF.
- **Forensics service (separate FastAPI app).** ELA heatmap, PDF metadata checks, and three seeded demo bidders (`AstraNet`, `Nexus_Global`, `Shivalik_Digitech`).
- **Government-style React UI** with the State Emblem of India in the header.

Not finished (see "What I would do next"): most frontend pages still read from the older `python-backend` on port 8000 instead of the Node API, and the PDF review page uses fixed example highlights.

## Decisions and trade-offs

| Decision | Options considered | Why | Cost |
| :--- | :--- | :--- | :--- |
| Rules are plain functions, not AI | Let the model decide pass/fail | Same input always gives the same answer, and each rule has unit tests | Every new clause type needs code |
| Forensics output is `info` / `warning`, never a verdict | Score tampering automatically | The README of the forensics service records ELA at AUC 0.50 as an automatic detector, so it is shown for a human to inspect | Officers must look at the heatmap themselves |
| In-process job worker | Redis queue (Celery/BullMQ) | No extra service to run for a demo | Jobs stop when the server stops; one process only |
| Files on local disk with signed URLs | Cloud object storage | Works offline for evaluation | Single machine, no backups |
| In-memory rate limiter | Redis-backed limiter | Nothing extra to run | Resets on restart; not shared across instances |
| Bounding boxes as fractions (0 to 1) | Pixel values | Scales on any screen | The forensics service sends `[x, y, w, h]` arrays and the backend stores `{x, y, w, h}`, so a converter is needed (added) |

## Security

Source: `docs/SECURITY.md`, audited 2026-10-25. All checks run on the server.

- Passwords hashed with bcrypt (cost 12). Access token 15 minutes, refresh token 7 days, stored hashed.
- Admin accounts cannot be created through public registration.
- Every route parameter must be a 24-character ObjectId. Request bodies reject `$` operators and script text.
- Uploads: 25 MB cap, 10 files, real file type checked from the bytes, path traversal blocked with `path.relative`.
- Rate limit: 20 auth requests per 15 minutes per IP (tested: 20 passed, next 30 got HTTP 429).
- In production the server throws if `FILE_URL_SECRET` is missing.
- Helmet headers, locked CORS list, no stack traces in production errors.

What this setup cannot do:
- Limiter state is not shared between servers.
- No bot challenge (CAPTCHA) and no antivirus scan of uploads.
- The forensics service allows any origin (`allow_origins=["*"]`) and does not check JWTs. Open item.
- Live dependency advisories were not checked (no outbound access during the audit).

## Failure states and edge cases handled

- No token: `401 Not authenticated`. Wrong role: `403`. Token with a malformed user id: `401 Invalid token payload`.
- Invalid ID in a route: `400 Invalid ID: must be a valid 24-character ObjectId`.
- Spoofed file (executable renamed to `.pdf`): `400 Invalid file type`. Duplicate upload to the same bid: `409`.
- Path such as `../uploads_backup/leak.pdf`: rejected as path traversal.
- Expired or tampered file link: rejected.
- Failing pipeline job: retried with backoff, then marked failed; jobs stuck past the lock timeout are re-queued.
- A bid with no clauses scores 0% and goes to review.
- Rules handle missing values (no expiry date, no local-content percent, fewer than 3 turnover years).

## Testing and CI

- Backend: `npm test` in `backend/` ran 54 tests on 2026-10-25, 54 passed, 0 failed.
- Frontend: `vite build` succeeds.
- Forensics service: `test_main.py` exists. Not run on 2026-10-25, because the installed environment was missing `httpx2`. [NEEDS FACT: result]
- **CI: none yet.** There is no `.github/` folder. No Playwright test files exist in the repo.

## Performance and accessibility

Measured 2026-10-25 with Playwright against the dev server (not a production build, not Lighthouse):

| Check | Result |
| :--- | :--- |
| Horizontal scroll at 360, 390, 768, 1024, 1440 px | None, on the landing page and dashboard |
| `<h1>` per page | One |
| Body text contrast | All sampled text at or above 4.5:1 |
| Reduced-motion media query | Present in `index.css`, emulated and matched |
| First contentful paint (dev server, 390px) | about 80 ms |
| Lighthouse mobile (Performance, Accessibility, CLS, LCP) | [NEEDS FACT] not run |

Known: the emblem SVG is 438 KB, and the JS bundle is 965 KB (276 KB gzipped).

## Run it locally

Needs Node.js, Python 3.9+, and a MongoDB instance. Variable names only; copy `backend/.env.example` and fill in your own values.

Node API (`backend/`): `npm install`, then `npm run dev`. Port 4000.
Variables: `PORT`, `NODE_ENV`, `LOG_LEVEL`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `EMAIL_TOKEN`, `CORS_ORIGIN`, `FILE_URL_SECRET`, `UPLOAD_DIR`, `AI_SERVICE_URL`, `AI_REQUEST_TIMEOUT_MS`, `MOCK_AI`, `JOB_CONCURRENCY`, `JOB_POLL_INTERVAL_MS`, `JOB_LOCK_TIMEOUT_MS`.

Frontend (`frontend/`): `npm install`, then `npm run dev`. Port 5173. It proxies `/api` to port 4000.

Forensics service (`forensics_verification_service/`): create a venv, `pip install -r requirements.txt`, then `python -m uvicorn main:app --port 8001`. Use port 8001 because the older `python-backend` also defaults to 8000.

Older AI prototype (`python-backend/`): needs `GEMINI_API_KEY`. Port 8000.

## What I would do next

1. Move `forensics_verification_service` to port 8001 for good, restrict its CORS origins, and route its calls through the Node API.
2. Point the 13 frontend pages that fetch from `localhost:8000` at the Node API, and draw real bounding boxes on the PDF review page for the three demo bidders.
3. Add CI: Playwright tests (including denial tests and an axe check), a GitHub Actions workflow, and Lighthouse numbers to replace the [NEEDS FACT] entries above.

## Credits and licences

- State Emblem of India artwork in `frontend/src/assets/Emblem_of_India.svg`. Its use is regulated by the State Emblem of India (Prohibition of Improper Use) Act, 2005. [NEEDS FACT: source and licence of the file]
- Open source libraries: React, Vite, Tailwind CSS, Recharts, Zustand, Express, Mongoose, Joi, PDFKit, pdf-lib, FastAPI, OpenCV, Pillow, pypdf. Versions are in `docs/CODEBASE.md`.
- Project licence: proprietary, for internal government verification use (carried over from the previous README).
