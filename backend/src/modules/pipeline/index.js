import { runRenderStage } from "./render.stage.js";
import { runAnalyzeStage } from "./analyze.stage.js";
import { runRulesStage } from "./rules.stage.js";
import { runVerifyStage } from "./verify.stage.js";
import { runForensicsStage } from "./forensics.stage.js";
import { runScoreStage } from "./score.stage.js";
import { PIPELINE_STAGE_NAMES, STAGE_STATUSES } from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

const STAGES = [
  { name: PIPELINE_STAGE_NAMES.RENDER, fn: runRenderStage },
  { name: PIPELINE_STAGE_NAMES.ANALYZE, fn: runAnalyzeStage },
  { name: PIPELINE_STAGE_NAMES.RULES, fn: runRulesStage },
  { name: PIPELINE_STAGE_NAMES.VERIFY, fn: runVerifyStage },
  { name: PIPELINE_STAGE_NAMES.FORENSICS, fn: runForensicsStage },
  { name: PIPELINE_STAGE_NAMES.SCORE, fn: runScoreStage },
];

/**
 * Execute the complete processing pipeline for a bid.
 * Updates Job stage timestamps, durations, and progress atomically.
 *
 * @param {Object} job - Mongoose Job document
 * @param {Object} bid - Mongoose Bid document
 * @param {Object} tender - Mongoose Tender document
 * @returns {Promise<Object>} Execution summary with all stage timings
 */
export async function executePipeline(job, bid, tender) {
  const context = { job, bid, tender };
  const totalStages = STAGES.length;

  logger.info(
    { jobId: job._id, bidId: bid._id, tenderId: tender._id },
    "Starting pipeline execution"
  );

  for (let i = 0; i < totalStages; i++) {
    const { name: stageName, fn } = STAGES[i];

    // Find or initialize stage tracking in job.stages
    let stageRecord = job.stages.find((s) => s.name === stageName);
    if (!stageRecord) {
      job.stages.push({
        name: stageName,
        status: STAGE_STATUSES.PENDING,
        startedAt: null,
        finishedAt: null,
        durationMs: 0,
        error: null,
      });
      stageRecord = job.stages[job.stages.length - 1];
    }

    const startedAt = new Date();
    stageRecord.status = STAGE_STATUSES.RUNNING;
    stageRecord.startedAt = startedAt;
    stageRecord.error = null;

    // Save running state
    await job.save();

    try {
      logger.info({ jobId: job._id, stage: stageName }, `Running pipeline stage: ${stageName}`);
      const result = await fn(context);

      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      stageRecord.status = STAGE_STATUSES.SUCCEEDED;
      stageRecord.finishedAt = finishedAt;
      stageRecord.durationMs = durationMs;

      // Update overall progress percentage (e.g. 17%, 33%, 50%, 67%, 83%, 100%)
      job.progress = Math.round(((i + 1) / totalStages) * 100);
      await job.save();

      logger.info(
        { jobId: job._id, stage: stageName, durationMs, progress: job.progress },
        `Completed pipeline stage: ${stageName}`
      );
    } catch (err) {
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      stageRecord.status = STAGE_STATUSES.FAILED;
      stageRecord.finishedAt = finishedAt;
      stageRecord.durationMs = durationMs;
      stageRecord.error = err.message || "Stage execution failed";

      await job.save();

      logger.error(
        { jobId: job._id, stage: stageName, durationMs, error: err.message },
        `Pipeline stage failed: ${stageName}`
      );

      throw err;
    }
  }

  return {
    success: true,
    jobId: job._id,
    bidId: bid._id,
    stages: job.stages,
  };
}

export default { executePipeline };
