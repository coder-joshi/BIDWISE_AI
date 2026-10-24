import mongoose from "mongoose";
import {
  DOCUMENT_OWNER_KINDS,
  DOCUMENT_OWNER_KIND_VALUES,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_PROCESSING_STATUSES,
  DOCUMENT_PROCESSING_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

// Stores page-level render metadata produced by the PDF renderer worker.
// bbox coordinates are stored as absolute pixel dimensions here.
const pageSchema = new Schema(
  {
    n: { type: Number, required: true, min: 1 },           // 1-based page number
    imageKey: { type: String, required: true, trim: true }, // relative path to rendered page image
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────────
    ownerKind: {
      type: String,
      enum: DOCUMENT_OWNER_KIND_VALUES,
      required: [true, "Owner kind is required"],
    },

    tender: {
      type: Schema.Types.ObjectId,
      ref: "Tender",
      required: [true, "Tender reference is required"],
    },

    // Optional: null for tender-level documents, set for bid-level documents
    bid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },

    // ── Classification ─────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: DOCUMENT_TYPE_VALUES,
      required: [true, "Document type is required"],
    },

    // ── File metadata ──────────────────────────────────────────────────────────
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },

    // Relative storage key — never an absolute filesystem path.
    // Example: "tenders/60f.../bids/60e.../gst-invoice.pdf"
    storageKey: {
      type: String,
      required: [true, "Storage key is required"],
      trim: true,
    },

    mimetype: {
      type: String,
      trim: true,
    },

    sizeBytes: {
      type: Number,
      min: 0,
    },

    // SHA-256 hex digest of the raw file bytes; used for deduplication
    sha256: {
      type: String,
      trim: true,
      lowercase: true,
    },

    pageCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Page-level render metadata populated after PDF rendering
    pages: {
      type: [pageSchema],
      default: [],
    },

    // ── Processing pipeline ────────────────────────────────────────────────────
    processingStatus: {
      type: String,
      enum: DOCUMENT_PROCESSING_STATUS_VALUES,
      default: DOCUMENT_PROCESSING_STATUSES.UPLOADED,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy is required"],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Unique deduplication for bid-level documents: same file cannot be uploaded
// twice to the same bid. Partial filter excludes tender-level docs (bid: null)
// so they never collide with each other on the null+sha256 compound.
documentSchema.index(
  { bid: 1, sha256: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bid: { $type: "objectId" },
      sha256: { $type: "string" },
    },
    name: "bid_sha256_unique",
  }
);

// Tenant-scoped listing: all docs for a tender, split by owner kind
documentSchema.index({ tender: 1, ownerKind: 1 });
// Bid-scoped listing by document type (e.g. fetch all GST docs for a bid)
documentSchema.index({ bid: 1, type: 1 });
// Processing queue: worker picks up UPLOADED docs
documentSchema.index({ processingStatus: 1 });

export default mongoose.model("Document", documentSchema);
