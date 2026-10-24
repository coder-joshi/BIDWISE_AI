export const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
  PROCUREMENT_OFFICER: "procurement_officer",
});

export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

export const BID_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  VERIFIED: "verified",
  FAILED: "failed",
});

export const BID_STATUS_VALUES = Object.freeze(Object.values(BID_STATUSES));

export const BID_DOCUMENT_TYPES = Object.freeze({
  GST: "gst",
  PAN: "pan",
  UDYAM: "udyam",
  ISO: "iso",
  EXPERIENCE: "experience",
  BANK_SOLVENCY: "bank_solvency",
  OEM: "oem",
  OTHER: "other",
});

export const BID_DOCUMENT_TYPE_VALUES = Object.freeze(
  Object.values(BID_DOCUMENT_TYPES)
);

export const DOCUMENT_VERIFICATION_STATUSES = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  FAILED: "failed",
  MISMATCH: "mismatch",
});

export const DOCUMENT_VERIFICATION_STATUS_VALUES = Object.freeze(
  Object.values(DOCUMENT_VERIFICATION_STATUSES)
);
