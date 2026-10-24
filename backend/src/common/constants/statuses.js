// ── Users ───────────────────────────────────────────────────────────────────
export const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
  PROCUREMENT_OFFICER: "procurement_officer",
});
export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

// ── Tenders ──────────────────────────────────────────────────────────────────
export const TENDER_STATUSES = Object.freeze({
  DRAFT: "draft",
  OPEN: "open",
  UNDER_EVALUATION: "under_evaluation",
  CLOSED: "closed",
});
export const TENDER_STATUS_VALUES = Object.freeze(Object.values(TENDER_STATUSES));

// ── Clauses ──────────────────────────────────────────────────────────────────
export const CLAUSE_TYPES = Object.freeze({
  ATC: "ATC",
  GTC: "GTC",
});
export const CLAUSE_TYPE_VALUES = Object.freeze(Object.values(CLAUSE_TYPES));

export const CLAUSE_CATEGORIES = Object.freeze({
  TURNOVER: "turnover",
  MII: "mii",
  OEM_MAF: "oem_maf",
  MSME: "msme",
  BIS_ISO: "bis_iso",
  OTHER: "other",
});
export const CLAUSE_CATEGORY_VALUES = Object.freeze(Object.values(CLAUSE_CATEGORIES));

export const SEVERITY_LEVELS = Object.freeze({
  CRITICAL: "critical",
  MAJOR: "major",
  MINOR: "minor",
});
export const SEVERITY_LEVEL_VALUES = Object.freeze(Object.values(SEVERITY_LEVELS));

// ── Bids ─────────────────────────────────────────────────────────────────────
export const BID_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  VERIFIED: "verified",
  FAILED: "failed",
});
export const BID_STATUS_VALUES = Object.freeze(Object.values(BID_STATUSES));

export const BID_OVERALL_STATUSES = Object.freeze({
  PENDING: "pending",
  COMPLIANT: "compliant",
  REVIEW: "review",
  FLAGGED: "flagged",
  DISQUALIFIED: "disqualified",
});
export const BID_OVERALL_STATUS_VALUES = Object.freeze(Object.values(BID_OVERALL_STATUSES));

// ── Documents ─────────────────────────────────────────────────────────────────
export const DOCUMENT_OWNER_KINDS = Object.freeze({
  TENDER: "tender",
  BID: "bid",
});
export const DOCUMENT_OWNER_KIND_VALUES = Object.freeze(Object.values(DOCUMENT_OWNER_KINDS));

export const DOCUMENT_TYPES = Object.freeze({
  TENDER_DOC: "tender_doc",
  GST: "gst",
  PAN: "pan",
  UDYAM: "udyam",
  ISO: "iso",
  EXPERIENCE: "experience",
  BANK_SOLVENCY: "bank_solvency",
  OEM: "oem",
  OTHER: "other",
});
export const DOCUMENT_TYPE_VALUES = Object.freeze(Object.values(DOCUMENT_TYPES));

export const DOCUMENT_PROCESSING_STATUSES = Object.freeze({
  UPLOADED: "uploaded",
  RENDERED: "rendered",
  ANALYZED: "analyzed",
  FAILED: "failed",
});
export const DOCUMENT_PROCESSING_STATUS_VALUES = Object.freeze(
  Object.values(DOCUMENT_PROCESSING_STATUSES)
);

// ── Clause Evaluations ────────────────────────────────────────────────────────
export const EVALUATION_STATUSES = Object.freeze({
  COMPLIANT: "compliant",
  NON_COMPLIANT: "non_compliant",
  REVIEW: "review",
  TAMPER_ALERT: "tamper_alert",
  PENDING: "pending",
});
export const EVALUATION_STATUS_VALUES = Object.freeze(Object.values(EVALUATION_STATUSES));

export const VERIFICATION_KINDS = Object.freeze({
  GST: "gst",
  UDYAM: "udyam",
  UDIN: "udin",
  DSC: "dsc",
});
export const VERIFICATION_KIND_VALUES = Object.freeze(Object.values(VERIFICATION_KINDS));

export const VERIFICATION_SOURCES = Object.freeze({
  MOCK: "mock",
  LIVE: "live",
});
export const VERIFICATION_SOURCE_VALUES = Object.freeze(Object.values(VERIFICATION_SOURCES));

// ── Forensic Alerts ───────────────────────────────────────────────────────────
export const FORENSIC_ALERT_TYPES = Object.freeze({
  ELA: "ela",
  METADATA: "metadata",
  DATE_MISMATCH: "date_mismatch",
});
export const FORENSIC_ALERT_TYPE_VALUES = Object.freeze(Object.values(FORENSIC_ALERT_TYPES));

export const FORENSIC_ALERT_STATUSES = Object.freeze({
  OPEN: "open",
  REVIEWED: "reviewed",
  DISMISSED: "dismissed",
});
export const FORENSIC_ALERT_STATUS_VALUES = Object.freeze(
  Object.values(FORENSIC_ALERT_STATUSES)
);

// ── TEC Notes ─────────────────────────────────────────────────────────────────
export const TEC_NOTE_STATUSES = Object.freeze({
  DRAFT: "draft",
  FINAL: "final",
});
export const TEC_NOTE_STATUS_VALUES = Object.freeze(Object.values(TEC_NOTE_STATUSES));

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const JOB_TYPES = Object.freeze({
  PROCESS_BID: "process_bid",
});
export const JOB_TYPE_VALUES = Object.freeze(Object.values(JOB_TYPES));

export const JOB_STATUSES = Object.freeze({
  QUEUED: "queued",
  RUNNING: "running",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
});
export const JOB_STATUS_VALUES = Object.freeze(Object.values(JOB_STATUSES));

export const STAGE_STATUSES = Object.freeze({
  PENDING: "pending",
  RUNNING: "running",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  SKIPPED: "skipped",
});
export const STAGE_STATUS_VALUES = Object.freeze(Object.values(STAGE_STATUSES));

export const PIPELINE_STAGE_NAMES = Object.freeze({
  RENDER: "render",
  ANALYZE: "analyze",
  RULES: "rules",
  VERIFY: "verify",
  FORENSICS: "forensics",
  SCORE: "score",
});
export const PIPELINE_STAGE_NAME_VALUES = Object.freeze(
  Object.values(PIPELINE_STAGE_NAMES)
);

// ── Legacy aliases — kept for existing bids.model.js / auth.model.js imports ─
export const BID_DOCUMENT_TYPES = DOCUMENT_TYPES;
export const BID_DOCUMENT_TYPE_VALUES = DOCUMENT_TYPE_VALUES;
export const DOCUMENT_VERIFICATION_STATUSES = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  FAILED: "failed",
  MISMATCH: "mismatch",
});
export const DOCUMENT_VERIFICATION_STATUS_VALUES = Object.freeze(
  Object.values(DOCUMENT_VERIFICATION_STATUSES)
);
