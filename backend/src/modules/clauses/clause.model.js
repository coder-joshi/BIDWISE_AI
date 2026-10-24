import mongoose from "mongoose";
import {
  CLAUSE_TYPES,
  CLAUSE_TYPE_VALUES,
  CLAUSE_CATEGORIES,
  CLAUSE_CATEGORY_VALUES,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const clauseSchema = new Schema(
  {
    tender: {
      type: Schema.Types.ObjectId,
      ref: "Tender",
      required: [true, "Tender reference is required"],
    },

    // Short code used in the compliance matrix (e.g. "ATC 01", "GTC 03")
    code: {
      type: String,
      required: [true, "Clause code is required"],
      uppercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: [true, "Clause title is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: CLAUSE_TYPE_VALUES,
      required: [true, "Clause type is required"],
    },

    category: {
      type: String,
      enum: CLAUSE_CATEGORY_VALUES,
      required: [true, "Clause category is required"],
    },

    // Full human-readable requirement text
    requirement: {
      type: String,
      required: [true, "Requirement text is required"],
    },

    // Structured rule parameters consumed by the AI evaluation engine
    // e.g. { minAvgTurnoverCr: 2.5, years: 3 }
    ruleConfig: {
      type: Schema.Types.Mixed,
      default: {},
    },

    severity: {
      type: String,
      enum: SEVERITY_LEVEL_VALUES,
      default: SEVERITY_LEVELS.MAJOR,
    },

    isMandatory: {
      type: Boolean,
      default: true,
    },

    // Whether this clause is highlighted in the compliance matrix demo view
    featured: {
      type: Boolean,
      default: false,
    },

    // Controls render order in the compliance matrix
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Unique: each tender can have only one clause per code
clauseSchema.index({ tender: 1, code: 1 }, { unique: true });
// Matrix ordered listing
clauseSchema.index({ tender: 1, order: 1 });
// Matrix featured filtering
clauseSchema.index({ tender: 1, featured: 1 });
// Category-based filtering within a tender
clauseSchema.index({ tender: 1, category: 1 });

export default mongoose.model("Clause", clauseSchema);
