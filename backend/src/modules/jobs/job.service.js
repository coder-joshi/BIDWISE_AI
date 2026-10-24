import mongoose from "mongoose";
import Job from "./job.model.js";
import Bid from "../bids/bids.model.js";
import Document from "../documents/document.model.js";
import AuditLog from "../audit/audit-log.model.js";
import ApiError from "../../common/utils/api-error.js";
import {
  JOB_STATUSES,
  JOB_TYPES,
  BID_STATUSES,
} from "../../common/constants/statuses.js";

/**
 * Enqueue a new processing job for a bid.
 * Enforces:
 * - 400 Bad Request if the bid has no documents uploaded
 * - 409 Conflict if a job is already active (queued or running) for this bid
 *
 * @param {string} bidId
 * @param {string} [userId]
 * @returns {Promise<Object>} Created Job document
 */
export async function enqueueBidProcessing(bidId, userId = null) {
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  // Check if bid has uploaded documents
  const docCount = await Document.countDocuments({ bid: bid._id });
  if (docCount === 0) {
    throw ApiError.badRequest("Cannot process bid: Bid has no uploaded documents.");
  }

  // Check if there is already an active (queued or running) job for this bid
  const activeJob = await Job.findOne({
    bid: bid._id,
    status: { $in: [JOB_STATUSES.QUEUED, JOB_STATUSES.RUNNING] },
  });

  if (activeJob) {
    throw ApiError.conflict(
      `A processing job is already active (${activeJob.status}) for this bid.`
    );
  }

  // Update Bid status to processing
  bid.status = BID_STATUSES.PROCESSING;
  await bid.save();

  // Create Job
  const job = await Job.create({
    type: JOB_TYPES.PROCESS_BID,
    bid: bid._id,
    status: JOB_STATUSES.QUEUED,
    attempts: 0,
    maxAttempts: 3,
    progress: 0,
  });

  // Audit log for enqueue
  await AuditLog.create({
    actor: userId || null,
    action: "JOB_ENQUEUE",
    entity: "Job",
    entityId: job._id,
    meta: {
      bidId: bid._id,
      jobType: job.type,
      docCount,
    },
  });

  return job;
}

/**
 * Retrieve the status of the current or most recent job for a bid.
 * Computes timings, stage breakdown, and total duration.
 *
 * @param {string} bidId
 * @returns {Promise<Object>} Formatted job status data
 */
export async function getBidJobStatus(bidId) {
  const isObjectId =
    mongoose.Types.ObjectId.isValid(bidId) &&
    String(new mongoose.Types.ObjectId(bidId)) === bidId;

  const query = isObjectId ? { _id: bidId } : { tenderId: bidId };
  const bid = await Bid.findOne(query);

  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  const job = await Job.findOne({ bid: bid._id }).sort({ createdAt: -1 });

  if (!job) {
    // Return a default status representing an idle/unprocessed bid
    return {
      bidId: bid._id.toString(),
      bidStatus: bid.status,
      jobStatus: null,
      progress: 0,
      stages: [],
      timings: {
        totalDurationMs: 0,
        perStageMs: {},
      },
      message: "No processing job has been queued for this bid.",
    };
  }

  // Calculate timing metrics
  const perStageMs = {};
  let totalStageDurationMs = 0;

  for (const stage of job.stages || []) {
    perStageMs[stage.name] = stage.durationMs || 0;
    totalStageDurationMs += stage.durationMs || 0;
  }

  // Overall wall-clock duration if finished, or current elapsed time if running
  let totalDurationMs = totalStageDurationMs;
  if (job.status === JOB_STATUSES.RUNNING && job.lockedAt) {
    totalDurationMs = Math.max(totalStageDurationMs, Date.now() - new Date(job.lockedAt).getTime());
  }

  return {
    id: job._id.toString(),
    jobId: job._id.toString(),
    bidId: bid._id.toString(),
    bidStatus: bid.status,
    status: job.status,
    progress: job.progress || 0,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: job.error,
    stages: job.stages,
    timings: {
      totalDurationMs,
      perStageMs,
    },
    lockedAt: job.lockedAt,
    lockedBy: job.lockedBy,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export default { enqueueBidProcessing, getBidJobStatus };
