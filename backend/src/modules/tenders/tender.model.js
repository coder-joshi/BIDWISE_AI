import mongoose from "mongoose";
import {
  TENDER_STATUSES,
  TENDER_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const miiPolicySchema = new Schema(
  {
    // MII classes the tender mandates (e.g. ["Class I", "Class II"])
    classes: [{ type: String, trim: true }],
    localContentThreshold: {
      classI: { type: Number, default: 50, min: 0, max: 100 },
      classII: { type: Number, default: 20, min: 0, max: 100 },
    },
  },
  { _id: false }
);

const tenderSchema = new Schema(
  {
    // Unique GeM bid number (e.g. "GEM/2026/B/5489210")
    bidNumber: {
      type: String,
      required: [true, "Bid number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    organisation: {
      type: String,
      required: [true, "Organisation is required"],
      trim: true,
    },

    itemCategory: {
      type: String,
      required: [true, "Item category is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    // Estimated value in INR
    estimatedValue: {
      type: Number,
      required: [true, "Estimated value is required"],
      min: [0, "Estimated value cannot be negative"],
    },

    bidEndDate: {
      type: Date,
      required: [true, "Bid end date is required"],
    },

    miiPolicy: {
      type: miiPolicySchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: TENDER_STATUS_VALUES,
      default: TENDER_STATUSES.OPEN,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// bidNumber unique index is created via `unique: true` above.
tenderSchema.index({ status: 1, bidEndDate: 1 }); // active/expiring tender queries
tenderSchema.index({ createdBy: 1 });

export default mongoose.model("Tender", tenderSchema);
