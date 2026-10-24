import mongoose from "mongoose";
import {
  FORENSIC_ALERT_TYPES,
  FORENSIC_ALERT_TYPE_VALUES,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_VALUES,
  VERIFICATION_SOURCES,
  VERIFICATION_SOURCE_VALUES,
  FORENSIC_ALERT_STATUSES,
  FORENSIC_ALERT_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const forensicAlertSchema = new Schema(
  {
    bid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      required: [true, "Bid reference is required"],
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document reference is required"],
    },

    // 1-based page number where the anomaly was detected
    page: {
      type: Number,
      min: 1,
    },

    type: {
      type: String,
      enum: FORENSIC_ALERT_TYPE_VALUES,
      required: [true, "Alert type is required"],
    },

    severity: {
      type: String,
      enum: SEVERITY_LEVEL_VALUES,
      default: SEVERITY_LEVELS.MAJOR,
    },

    // Value found in the document submitted by the bidder
    documentValue: {
      type: String,
      trim: true,
    },

    // True value fetched from official government registry
    registryValue: {
      type: String,
      trim: true,
    },

    // Whether registry verification ran against mock or live API
    registrySource: {
      type: String,
      enum: VERIFICATION_SOURCE_VALUES,
      default: VERIFICATION_SOURCES.MOCK,
    },

    // Detailed metadata (e.g. EXIF dates, edit software, error level analysis scores)
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Relative storage key for ELA overlay image visualization
    elaImageKey: {
      type: String,
      trim: true,
    },

    // Human-readable explanation of the alert
    note: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: FORENSIC_ALERT_STATUS_VALUES,
      default: FORENSIC_ALERT_STATUSES.OPEN,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// List all forensic alerts for a bid filtered by status (e.g. active open alerts)
forensicAlertSchema.index({ bid: 1, status: 1 });
// Trace all alerts attached to a particular document
forensicAlertSchema.index({ document: 1 });
// Triage queries by alert type and severity level
forensicAlertSchema.index({ type: 1, severity: 1 });

export default mongoose.model("ForensicAlert", forensicAlertSchema);
