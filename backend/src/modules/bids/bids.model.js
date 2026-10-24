import mongoose from "mongoose";
import {
  BID_STATUSES,
  BID_STATUS_VALUES,
  BID_OVERALL_STATUSES,
  BID_OVERALL_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const bidSchema = new Schema(
  {
    // ── Tender link ────────────────────────────────────────────────────────────
    tender: {
      type: Schema.Types.ObjectId,
      ref: "Tender",
      required: [true, "Tender reference is required"],
    },

    // Denormalised copy of tender.bidNumber kept for frontend compatibility.
    // Frontend reads: _id, bidderName, tenderId, status, riskScore,
    //                 complianceScore, createdAt — all preserved below.
    tenderId: {
      type: String,
      required: [true, "Tender ID is required"],
      trim: true,
    },

    // ── Bidder identity ────────────────────────────────────────────────────────
    bidderName: {
      type: String,
      required: [true, "Bidder name is required"],
      trim: true,
    },

    // e.g. "oem" | "reseller" | "msme" | "distributor"
    bidderType: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },

    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },

    udyamNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },

    // ── Processing pipeline status ─────────────────────────────────────────────
    // Fine-grained pipeline stage (pending → processing → verified | failed)
    status: {
      type: String,
      enum: BID_STATUS_VALUES,
      default: BID_STATUSES.PENDING,
    },

    // High-level compliance verdict after evaluation
    overallStatus: {
      type: String,
      enum: BID_OVERALL_STATUS_VALUES,
      default: BID_OVERALL_STATUSES.PENDING,
    },

    // ── Compliance scores ──────────────────────────────────────────────────────
    compliancePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    clausesPassed: {
      type: Number,
      default: 0,
    },

    clausesTotal: {
      type: Number,
      default: 0,
    },

    criticalFailures: {
      type: Number,
      default: 0,
    },

    tamperAlerts: {
      type: Number,
      default: 0,
    },

    // ── Legacy / AI scores (kept for frontend compatibility) ───────────────────
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    fraudSignals: {
      type: Number,
      default: 0,
    },

    // Free-form AI engine report blob
    aiReport: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ── Ownership & lifecycle ──────────────────────────────────────────────────
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy is required"],
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
    // Note: embedded documents array removed.
    // All documents are now managed in the standalone Document collection
    // (modules/documents/document.model.js) referenced via bid ObjectId.
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Full evaluation matrix for a tender
bidSchema.index({ tender: 1 });
// Frontend list queries by tenderId string
bidSchema.index({ tenderId: 1 });
// Status filtering within a tender (matrix view)
bidSchema.index({ tender: 1, overallStatus: 1 });
// Per-user bid lookups
bidSchema.index({ uploadedBy: 1 });

export default mongoose.model("Bid", bidSchema);
