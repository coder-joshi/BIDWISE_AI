import mongoose from "mongoose";
import {
  TEC_NOTE_STATUSES,
  TEC_NOTE_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const tecNoteSchema = new Schema(
  {
    // Exactly one TEC note per bid
    bid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      required: [true, "Bid reference is required"],
      unique: true,
    },

    // Formatted content / justification of the Tender Evaluation Committee note
    content: {
      type: String,
      required: [true, "TEC note content is required"],
    },

    status: {
      type: String,
      enum: TEC_NOTE_STATUS_VALUES,
      default: TEC_NOTE_STATUSES.DRAFT,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    editedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// bid unique index is created via `unique: true` above.
tecNoteSchema.index({ status: 1 });

export default mongoose.model("TecNote", tecNoteSchema);
