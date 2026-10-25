import ClauseEvaluation from "../evaluations/evaluation.model.js";
import { evaluateRule } from "../rules/index.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pipeline Stage 3: Run deterministic rule engine on extracted fields for each clause.
 * Idempotent: Evaluates pure functions and updates ClauseEvaluation records.
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<{ evaluatedCount: number, passedCount: number, failedCount: number }>}
 */
export async function runRulesStage(context) {
  const { bid, tender } = context;

  const evaluations = await ClauseEvaluation.find({ bid: bid._id }).populate("clause");

  let passedCount = 0;
  let failedCount = 0;
  let reviewCount = 0;
  const bulkOps = [];

  for (const evaluation of evaluations) {
    const clause = evaluation.clause;
    if (!clause) continue;

    // Merge clause ruleConfig with tender-level context (like tenderNumber / bidNumber)
    const ruleConfig = {
      ...(clause.ruleConfig || {}),
      tenderNumber: tender.bidNumber,
      bidNumber: tender.bidNumber,
    };

    const ruleResult = evaluateRule(
      clause.category,
      ruleConfig,
      evaluation.extractedFields || {}
    );

    evaluation.status = ruleResult.status;
    evaluation.calculation = ruleResult.calculation || {};
    if (ruleResult.reasoning) {
      evaluation.reasoning = ruleResult.reasoning;
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: evaluation._id },
        update: {
          $set: {
            status: evaluation.status,
            calculation: evaluation.calculation,
            reasoning: evaluation.reasoning,
          },
        },
      },
    });

    if (ruleResult.status === "compliant") passedCount++;
    else if (ruleResult.status === "non_compliant") failedCount++;
    else reviewCount++;
  }

  if (bulkOps.length > 0) {
    await ClauseEvaluation.bulkWrite(bulkOps);
  }

  logger.info(
    { bidId: bid._id, total: evaluations.length, passedCount, failedCount, reviewCount },
    "Rules stage completed"
  );

  return {
    evaluatedCount: evaluations.length,
    passedCount,
    failedCount,
    reviewCount,
  };
}

export default { run: runRulesStage };
