import ClauseEvaluation from "../evaluations/evaluation.model.js";
import gstAdapter from "../integrations/gst.adapter.js";
import udyamAdapter from "../integrations/udyam.adapter.js";
import udinAdapter from "../integrations/udin.adapter.js";
import { VERIFICATION_KINDS, EVALUATION_STATUSES } from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pipeline Stage 4: Run external statutory registry verification adapters (GST, Udyam, UDIN).
 * Idempotent: Replaces or updates verification entries in ClauseEvaluations.
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<{ checksRun: number }>}
 */
export async function runVerifyStage(context) {
  const { bid } = context;

  const evaluations = await ClauseEvaluation.find({ bid: bid._id }).populate("clause");
  let checksRun = 0;

  // 1. Verify GST if bid has gstNumber
  let gstResult = null;
  if (bid.gstNumber) {
    try {
      gstResult = await gstAdapter.verify({ gstNumber: bid.gstNumber });
      checksRun++;
    } catch (err) {
      logger.error({ err: err.message, bidId: bid._id }, "GST verification adapter error");
    }
  }

  // 2. Verify Udyam if bid has udyamNumber
  let udyamResult = null;
  if (bid.udyamNumber) {
    try {
      udyamResult = await udyamAdapter.verify({ udyamNumber: bid.udyamNumber });
      checksRun++;
    } catch (err) {
      logger.error({ err: err.message, bidId: bid._id }, "Udyam verification adapter error");
    }
  }

  // 3. Attach verifications to corresponding evaluations
  for (const evaluation of evaluations) {
    const category = evaluation.clause?.category;
    let modified = false;

    // Filter out old verification records of the same kind to maintain idempotency
    const currentVerifications = evaluation.verification || [];

    // GST match
    if (gstResult && (category === "gst" || evaluation.clause?.title?.toLowerCase().includes("gst"))) {
      const filtered = currentVerifications.filter((v) => v.kind !== VERIFICATION_KINDS.GST);
      filtered.push({
        kind: VERIFICATION_KINDS.GST,
        result: gstResult.valid ? "valid" : "invalid",
        details: gstResult.details || {},
        source: gstResult.source || "mock",
        checkedAt: new Date(gstResult.checkedAt || Date.now()),
      });
      evaluation.verification = filtered;

      if (!gstResult.valid) {
        evaluation.status = EVALUATION_STATUSES.NON_COMPLIANT;
      }
      modified = true;
    }

    // Udyam / MSME match
    if (udyamResult && (category === "msme" || category === "udyam" || evaluation.clause?.title?.toLowerCase().includes("udyam"))) {
      const filtered = currentVerifications.filter((v) => v.kind !== VERIFICATION_KINDS.UDYAM);
      filtered.push({
        kind: VERIFICATION_KINDS.UDYAM,
        result: udyamResult.valid ? "valid" : "invalid",
        details: udyamResult.details || {},
        source: udyamResult.source || "mock",
        checkedAt: new Date(udyamResult.checkedAt || Date.now()),
      });
      evaluation.verification = filtered;

      if (!udyamResult.valid) {
        evaluation.status = EVALUATION_STATUSES.NON_COMPLIANT;
      }
      modified = true;
    }

    // UDIN check if extracted in financial clauses
    const udinNumber = evaluation.extractedFields?.udinNumber || evaluation.extractedFields?.udin;
    if (udinNumber) {
      try {
        const udinResult = await udinAdapter.verify({ udinNumber });
        checksRun++;
        const filtered = currentVerifications.filter((v) => v.kind !== VERIFICATION_KINDS.UDIN);
        filtered.push({
          kind: VERIFICATION_KINDS.UDIN,
          result: udinResult.valid ? "valid" : "invalid",
          details: udinResult.details || {},
          source: udinResult.source || "mock",
          checkedAt: new Date(udinResult.checkedAt || Date.now()),
        });
        evaluation.verification = filtered;
        modified = true;
      } catch (err) {
        logger.error({ err: err.message, udinNumber }, "UDIN verification failed");
      }
    }

    if (modified) {
      await evaluation.save();
    }
  }

  logger.info({ bidId: bid._id, checksRun }, "Verify stage completed");
  return { checksRun };
}

export default { run: runVerifyStage };
