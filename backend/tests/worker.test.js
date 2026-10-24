import test from "node:test";
import assert from "node:assert/strict";
import {
  claimNextJob,
  reclaimStuckJobs,
  processJob,
} from "../src/modules/jobs/worker.js";
import Job from "../src/modules/jobs/job.model.js";
import Bid from "../src/modules/bids/bids.model.js";
import AuditLog from "../src/modules/audit/audit-log.model.js";
import { JOB_STATUSES, BID_STATUSES } from "../src/common/constants/statuses.js";

test("Worker - Atomic Claiming: Two workers claim simultaneously, only one gets the job", async (t) => {
  // Mock queued jobs table
  let jobs = [
    {
      _id: "job-1",
      status: JOB_STATUSES.QUEUED,
      attempts: 0,
      createdAt: new Date("2026-01-01T10:00:00Z"),
      lockedAt: null,
      lockedBy: null,
    },
  ];

  // Atomic findOneAndUpdate simulation (atomic mutex)
  let claimLock = false;
  const originalFindOneAndUpdate = Job.findOneAndUpdate;

  Job.findOneAndUpdate = async function (filter, update, options) {
    while (claimLock) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    claimLock = true;
    try {
      const idx = jobs.findIndex(
        (j) => j.status === filter.status
      );
      if (idx === -1) return null;

      const matched = jobs[idx];
      if (update.$set) Object.assign(matched, update.$set);
      if (update.$inc?.attempts) matched.attempts += update.$inc.attempts;

      return { ...matched };
    } finally {
      claimLock = false;
    }
  };

  t.after(() => {
    Job.findOneAndUpdate = originalFindOneAndUpdate;
  });

  // Worker 1 and Worker 2 try to claim concurrently
  const [claim1, claim2] = await Promise.all([
    claimNextJob("worker-1"),
    claimNextJob("worker-2"),
  ]);

  // Exactly one worker must have claimed the job, the other must receive null
  const claimed = [claim1, claim2].filter(Boolean);
  assert.equal(claimed.length, 1, "Exactly one worker should successfully claim the single queued job");

  const winner = claim1 || claim2;
  assert.equal(winner._id, "job-1");
  assert.equal(winner.status, JOB_STATUSES.RUNNING);
  assert.equal(winner.attempts, 1);
  assert.ok(winner.lockedBy === "worker-1" || winner.lockedBy === "worker-2");
});

test("Worker - Stuck-job reclaim: Reclaims running job stuck past lock timeout back to queued", async (t) => {
  const originalFind = Job.find;
  const originalSave = Job.prototype.save;
  const originalBidUpdate = Bid.findByIdAndUpdate;
  const originalAuditCreate = AuditLog.create;

  const stuckJob = {
    _id: "stuck-job-1",
    bid: "bid-1",
    status: JOB_STATUSES.RUNNING,
    attempts: 1,
    maxAttempts: 3,
    lockedAt: new Date(Date.now() - 600000), // 10 minutes ago
    lockedBy: "dead-worker",
    error: null,
    save: async function () {
      return this;
    },
  };

  Job.find = async function (query) {
    if (query.status === JOB_STATUSES.RUNNING) {
      return [stuckJob];
    }
    return [];
  };

  AuditLog.create = async () => ({});
  Bid.findByIdAndUpdate = async () => ({});

  t.after(() => {
    Job.find = originalFind;
    AuditLog.create = originalAuditCreate;
    Bid.findByIdAndUpdate = originalBidUpdate;
  });

  const result = await reclaimStuckJobs(300000); // 5 min timeout

  assert.equal(result.reclaimedCount, 1);
  assert.equal(result.failedCount, 0);
  assert.equal(stuckJob.status, JOB_STATUSES.QUEUED);
  assert.equal(stuckJob.lockedAt, null);
  assert.equal(stuckJob.lockedBy, null);
  assert.match(stuckJob.error, /Reclaimed from stuck running state/);
});

test("Worker - Stuck-job reclaim: Marks job failed when attempts reached maxAttempts", async (t) => {
  const originalFind = Job.find;
  const originalBidUpdate = Bid.findByIdAndUpdate;
  const originalAuditCreate = AuditLog.create;

  let bidUpdatedStatus = null;
  Bid.findByIdAndUpdate = async function (id, update) {
    bidUpdatedStatus = update.$set?.status;
    return {};
  };

  AuditLog.create = async () => ({});

  const expiredJob = {
    _id: "expired-job-1",
    bid: "bid-2",
    status: JOB_STATUSES.RUNNING,
    attempts: 3,
    maxAttempts: 3,
    lockedAt: new Date(Date.now() - 600000),
    lockedBy: "dead-worker",
    error: null,
    save: async function () {
      return this;
    },
  };

  Job.find = async function (query) {
    if (query.status === JOB_STATUSES.RUNNING) {
      return [expiredJob];
    }
    return [];
  };

  t.after(() => {
    Job.find = originalFind;
    Bid.findByIdAndUpdate = originalBidUpdate;
    AuditLog.create = originalAuditCreate;
  });

  const result = await reclaimStuckJobs(300000);

  assert.equal(result.reclaimedCount, 0);
  assert.equal(result.failedCount, 1);
  assert.equal(expiredJob.status, JOB_STATUSES.FAILED);
  assert.equal(bidUpdatedStatus, BID_STATUSES.FAILED);
  assert.match(expiredJob.error, /exceeding max attempts/);
});

test("Worker - Retry with backoff: Failing job re-queues when attempts < maxAttempts", async (t) => {
  const originalFindBid = Bid.findById;
  const originalAuditCreate = AuditLog.create;

  AuditLog.create = async () => ({});

  // Cause Bid.findById to reject, simulating a processing error
  Bid.findById = async function () {
    throw new Error("Simulated transient pipeline connection error");
  };

  const job = {
    _id: "retry-job-1",
    bid: "bid-3",
    status: JOB_STATUSES.RUNNING,
    attempts: 1,
    maxAttempts: 3,
    lockedAt: new Date(),
    lockedBy: "worker-test",
    error: null,
    save: async function () {
      return this;
    },
  };

  t.after(() => {
    Bid.findById = originalFindBid;
    AuditLog.create = originalAuditCreate;
  });

  const processed = await processJob(job, "worker-test");

  assert.equal(processed.status, JOB_STATUSES.QUEUED);
  assert.equal(processed.lockedAt, null);
  assert.equal(processed.lockedBy, null);
  assert.match(processed.error, /Attempt 1\/3 failed/);
  assert.match(processed.error, /Retrying in \d+ms/);
});

test("Worker - Terminal failure: Marks job and bid failed when attempts >= maxAttempts", async (t) => {
  const originalFindBid = Bid.findById;
  const originalBidUpdate = Bid.findByIdAndUpdate;
  const originalAuditCreate = AuditLog.create;

  let updatedBidStatus = null;
  Bid.findByIdAndUpdate = async function (id, update) {
    updatedBidStatus = update.$set?.status;
    return {};
  };

  AuditLog.create = async () => ({});

  Bid.findById = async function () {
    throw new Error("Persistent service crash");
  };

  const job = {
    _id: "fatal-job-1",
    bid: "bid-4",
    status: JOB_STATUSES.RUNNING,
    attempts: 3,
    maxAttempts: 3,
    lockedAt: new Date(),
    lockedBy: "worker-test",
    error: null,
    save: async function () {
      return this;
    },
  };

  t.after(() => {
    Bid.findById = originalFindBid;
    Bid.findByIdAndUpdate = originalBidUpdate;
    AuditLog.create = originalAuditCreate;
  });

  const processed = await processJob(job, "worker-test");

  assert.equal(processed.status, JOB_STATUSES.FAILED);
  assert.equal(updatedBidStatus, BID_STATUSES.FAILED);
  assert.match(processed.error, /permanently failed after 3 attempts/);
});
