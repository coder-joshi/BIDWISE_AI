import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    // User who performed the action (null if automated system/AI task)
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Action name (e.g. "BID_UPLOAD", "EVALUATION_OVERRIDE", "STATUS_CHANGE")
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },

    // Name of collection / entity affected (e.g. "Bid", "Tender", "ClauseEvaluation")
    entity: {
      type: String,
      required: [true, "Entity name is required"],
      trim: true,
    },

    // Target document ID
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
    },

    // Contextual payload / snapshot of diff
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    // Append-only: disable updatedAt timestamp
    timestamps: { createdAt: false, updatedAt: false },
    versionKey: false,
  }
);

// ── Immutability Enforcement (Insert-only) ────────────────────────────────────
auditLogSchema.pre("save", function () {
  if (!this.isNew) {
    throw new Error("AuditLog records are append-only and cannot be modified.");
  }
});

auditLogSchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate", "replaceOne"],
  function () {
    throw new Error("AuditLog records are append-only and cannot be modified.");
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Timeline of all changes for a specific domain entity
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
// Activity history for a specific actor / officer
auditLogSchema.index({ actor: 1, createdAt: -1 });
// Filter logs by specific audit action type
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
