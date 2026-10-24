import crypto from "crypto";
import Job from "./job.model.js";
import Bid from "../bids/bids.model.js";
import Tender from "../tenders/tender.model.js";
import AuditLog from "../audit/audit-log.model.js";
import { executePipeline } from "../pipeline/index.js";
import {
  JOB_STATUSES,
  BID_STATUSES,
} from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_LOCK_TIMEOUT_MS = 300000; // 5 minutes
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BACKOFF_BASE_MS = 1000;

let isRunning = false;
let pollTimer = null;
let reclaimTimer = null;
let activeJobsCount = 0;
const workerId = `worker-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;

/**
 * Atomically claim the next queued job using findOneAndUpdate.
 * Ensures two workers never take the same job.
 *
 * @param {string} claimingWorkerId
 * @returns {Promise<Object|null>} Claimed Job document or null
 */
export async function claimNextJob(claimingWorkerId = workerId) {
  const job = await Job.findOneAndUpdate(
    {
      status: JOB_STATUSES.QUEUED,
    },
    {
      $set: {
        status: JOB_STATUSES.RUNNING,
        lockedAt: new Date(),
        lockedBy: claimingWorkerId,
      },
      $inc: { attempts: 1 },
    },
    {
      sort: { createdAt: 1 }, // FIFO ordering
      new: true,
    }
  );

  return job;
}

/**
 * Reclaim jobs that have been stuck in "running" status longer than lockTimeoutMs.
 * Retries if attempts < maxAttempts, otherwise marks them failed.
 *
 * @param {number} lockTimeoutMs
 * @returns {Promise<{ reclaimedCount: number, failedCount: number }>}
 */
export async function reclaimStuckJobs(lockTimeoutMs = DEFAULT_LOCK_TIMEOUT_MS) {
  const timeoutThreshold = new Date(Date.now() - lockTimeoutMs);

  const stuckJobs = await Job.find({
    status: JOB_STATUSES.RUNNING,
    lockedAt: { $lt: timeoutThreshold },
  });

  let reclaimedCount = 0;
  let failedCount = 0;

  for (const job of stuckJobs) {
    if (job.attempts >= job.maxAttempts) {
      // Mark as failed permanently
      job.status = JOB_STATUSES.FAILED;
      job.lockedAt = null;
      job.lockedBy = null;
      job.error = `Job timed out after exceeding max attempts (${job.attempts}/${job.maxAttempts}).`;
      await job.save();

      // Update parent Bid status to failed
      await Bid.findByIdAndUpdate(job.bid, { $set: { status: BID_STATUSES.FAILED } });

      await AuditLog.create({
        actor: null,
        action: "JOB_FAIL",
        entity: "Job",
        entityId: job._id,
        meta: {
          bidId: job.bid,
          reason: "stuck_job_timeout_max_attempts",
          attempts: job.attempts,
        },
      });

      failedCount++;
      logger.warn({ jobId: job._id, bidId: job.bid }, "Stuck job marked as failed after max attempts");
    } else {
      // Re-queue for retry
      job.status = JOB_STATUSES.QUEUED;
      job.lockedAt = null;
      job.lockedBy = null;
      job.error = `Reclaimed from stuck running state (timeout ${lockTimeoutMs}ms). Queued for retry.`;
      await job.save();

      reclaimedCount++;
      logger.info({ jobId: job._id, bidId: job.bid, attempt: job.attempts }, "Reclaimed stuck job back to queued status");
    }
  }

  return { reclaimedCount, failedCount };
}

/**
 * Process a single claimed job through the pipeline.
 * Handles retries with exponential backoff and maxAttempts terminal failure.
 *
 * @param {Object} job - Mongoose Job document
 * @param {string} currentWorkerId
 * @returns {Promise<Object>}
 */
export async function processJob(job, currentWorkerId = workerId) {
  const startTime = Date.now();
  logger.info({ jobId: job._id, bidId: job.bid, attempt: job.attempts }, "Starting job processing");

  // Write AuditLog for JOB_START
  await AuditLog.create({
    actor: null,
    action: "JOB_START",
    entity: "Job",
    entityId: job._id,
    meta: {
      bidId: job.bid,
      attempt: job.attempts,
      lockedBy: currentWorkerId,
    },
  });

  try {
    const bid = await Bid.findById(job.bid);
    if (!bid) {
      throw new Error(`Referenced Bid ${job.bid} not found.`);
    }

    const tender = await Tender.findById(bid.tender);
    if (!tender) {
      throw new Error(`Referenced Tender ${bid.tender} not found.`);
    }

    // Execute idempotent pipeline stages
    await executePipeline(job, bid, tender);

    // Job succeeded
    job.status = JOB_STATUSES.SUCCEEDED;
    job.lockedAt = null;
    job.lockedBy = null;
    job.error = null;
    job.progress = 100;
    await job.save();

    const totalDurationMs = Date.now() - startTime;

    // Write AuditLog for JOB_END
    await AuditLog.create({
      actor: null,
      action: "JOB_END",
      entity: "Job",
      entityId: job._id,
      meta: {
        bidId: job.bid,
        status: "succeeded",
        attempt: job.attempts,
        durationMs: totalDurationMs,
      },
    });

    logger.info(
      { jobId: job._id, bidId: job.bid, durationMs: totalDurationMs },
      "Job completed successfully"
    );

    return job;
  } catch (err) {
    const totalDurationMs = Date.now() - startTime;
    logger.error(
      { jobId: job._id, bidId: job.bid, attempt: job.attempts, error: err.message },
      "Job execution encountered an error"
    );

    const maxAttempts = job.maxAttempts || DEFAULT_MAX_ATTEMPTS;

    if (job.attempts < maxAttempts) {
      // Retry with exponential backoff delay
      const backoffBase = parseInt(process.env.JOB_RETRY_BACKOFF_BASE_MS || String(DEFAULT_BACKOFF_BASE_MS), 10);
      const delayMs = backoffBase * Math.pow(2, job.attempts - 1);

      job.status = JOB_STATUSES.QUEUED;
      job.lockedAt = null;
      job.lockedBy = null;
      job.error = `Attempt ${job.attempts}/${maxAttempts} failed: ${err.message}. Retrying in ${delayMs}ms.`;
      await job.save();

      // Write AuditLog for retry attempt
      await AuditLog.create({
        actor: null,
        action: "JOB_RETRY",
        entity: "Job",
        entityId: job._id,
        meta: {
          bidId: job.bid,
          attempt: job.attempts,
          maxAttempts,
          delayMs,
          error: err.message,
        },
      });

      logger.info(
        { jobId: job._id, attempt: job.attempts, delayMs },
        "Job re-queued for retry with backoff"
      );
    } else {
      // Terminal failure
      job.status = JOB_STATUSES.FAILED;
      job.lockedAt = null;
      job.lockedBy = null;
      job.error = `Job permanently failed after ${job.attempts} attempts: ${err.message}`;
      await job.save();

      // Mark parent Bid as failed
      await Bid.findByIdAndUpdate(job.bid, { $set: { status: BID_STATUSES.FAILED } });

      // Write AuditLog for terminal JOB_END failure
      await AuditLog.create({
        actor: null,
        action: "JOB_END",
        entity: "Job",
        entityId: job._id,
        meta: {
          bidId: job.bid,
          status: "failed",
          attempt: job.attempts,
          durationMs: totalDurationMs,
          error: err.message,
        },
      });

      logger.error(
        { jobId: job._id, bidId: job.bid, attempts: job.attempts },
        "Job permanently marked as failed"
      );
    }

    return job;
  }
}

/**
 * Worker poll tick: reclaims stuck jobs and claims available work up to concurrency limit.
 */
async function pollTick(concurrency, lockTimeoutMs) {
  if (!isRunning) return;

  try {
    // 1. Reclaim any stuck jobs
    await reclaimStuckJobs(lockTimeoutMs);

    // 2. Claim and process queued jobs up to available concurrency capacity
    while (activeJobsCount < concurrency && isRunning) {
      const job = await claimNextJob(workerId);
      if (!job) {
        break; // No more queued jobs at this time
      }

      activeJobsCount++;

      // Process in background without blocking the scheduler loop
      processJob(job, workerId)
        .catch((err) => {
          logger.error({ jobId: job._id, err: err.message }, "Unhandled error in processJob");
        })
        .finally(() => {
          activeJobsCount = Math.max(0, activeJobsCount - 1);
        });
    }
  } catch (err) {
    logger.error({ err: err.message }, "Error during worker poll tick");
  }
}

/**
 * Start the in-process background job worker.
 *
 * @param {Object} [options]
 * @returns {Object} Worker controller
 */
export function startWorker(options = {}) {
  if (isRunning) {
    logger.warn("Worker is already running");
    return;
  }

  const pollIntervalMs = options.pollIntervalMs || parseInt(process.env.JOB_POLL_INTERVAL_MS || String(DEFAULT_POLL_INTERVAL_MS), 10);
  const lockTimeoutMs = options.lockTimeoutMs || parseInt(process.env.JOB_LOCK_TIMEOUT_MS || String(DEFAULT_LOCK_TIMEOUT_MS), 10);
  const concurrency = options.concurrency || parseInt(process.env.JOB_CONCURRENCY || String(DEFAULT_CONCURRENCY), 10);

  isRunning = true;
  logger.info(
    { workerId, concurrency, pollIntervalMs, lockTimeoutMs },
    "Starting background job worker"
  );

  // Initial immediate tick
  pollTick(concurrency, lockTimeoutMs);

  // Periodic polling
  pollTimer = setInterval(() => {
    pollTick(concurrency, lockTimeoutMs);
  }, pollIntervalMs);

  // Setup graceful shutdown on system signals
  const onSignal = async (signal) => {
    logger.info({ signal }, "Received shutdown signal, stopping worker...");
    await stopWorker();
  };

  process.once("SIGTERM", () => onSignal("SIGTERM"));
  process.once("SIGINT", () => onSignal("SIGINT"));

  return {
    workerId,
    stop: stopWorker,
  };
}

/**
 * Stop the worker cleanly.
 *
 * @returns {Promise<void>}
 */
export async function stopWorker() {
  if (!isRunning) return;

  isRunning = false;
  logger.info("Stopping worker loop...");

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  if (reclaimTimer) {
    clearInterval(reclaimTimer);
    reclaimTimer = null;
  }

  // Wait for any active jobs to finish or timeout after 10s
  const timeout = 10000;
  const startWait = Date.now();
  while (activeJobsCount > 0 && Date.now() - startWait < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  logger.info({ remainingActiveJobs: activeJobsCount }, "Worker stopped cleanly");
}

export default {
  startWorker,
  stopWorker,
  claimNextJob,
  reclaimStuckJobs,
  processJob,
};
