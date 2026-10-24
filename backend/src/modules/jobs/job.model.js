import mongoose from "mongoose";
import {
  JOB_TYPES,
  JOB_TYPE_VALUES,
  JOB_STATUSES,
  JOB_STATUS_VALUES,
  STAGE_STATUS_VALUES,
  STAGE_STATUSES,
  PIPELINE_STAGE_NAMES,
  PIPELINE_STAGE_NAME_VALUES,
} from "../../common/constants/statuses.js";

const { Schema } = mongoose;

const stageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: PIPELINE_STAGE_NAME_VALUES,
    },
    status: {
      type: String,
      enum: STAGE_STATUS_VALUES,
      default: STAGE_STATUSES.PENDING,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    error: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const jobSchema = new Schema(
  {
    type: {
      type: String,
      enum: JOB_TYPE_VALUES,
      default: JOB_TYPES.PROCESS_BID,
      required: true,
    },
    bid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      required: [true, "Bid reference is required"],
    },
    status: {
      type: String,
      enum: JOB_STATUS_VALUES,
      default: JOB_STATUSES.QUEUED,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: String,
      default: null,
    },
    error: {
      type: Schema.Types.Mixed,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    stages: {
      type: [stageSchema],
      default: () => [
        { name: PIPELINE_STAGE_NAMES.RENDER, status: STAGE_STATUSES.PENDING },
        { name: PIPELINE_STAGE_NAMES.ANALYZE, status: STAGE_STATUSES.PENDING },
        { name: PIPELINE_STAGE_NAMES.RULES, status: STAGE_STATUSES.PENDING },
        { name: PIPELINE_STAGE_NAMES.VERIFY, status: STAGE_STATUSES.PENDING },
        { name: PIPELINE_STAGE_NAMES.FORENSICS, status: STAGE_STATUSES.PENDING },
        { name: PIPELINE_STAGE_NAMES.SCORE, status: STAGE_STATUSES.PENDING },
      ],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Allow only ONE active (queued or running) job per bid
jobSchema.index(
  { bid: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [JOB_STATUSES.QUEUED, JOB_STATUSES.RUNNING] },
    },
    name: "one_active_job_per_bid",
  }
);

// Worker polling and claiming index
jobSchema.index({ status: 1, lockedAt: 1, createdAt: 1 });

// Query jobs by bid
jobSchema.index({ bid: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);
