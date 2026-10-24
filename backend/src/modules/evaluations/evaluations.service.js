import ClauseEvaluation from "./evaluation.model.js";
import AuditLog from "../audit/audit-log.model.js";
import ApiError from "../../common/utils/api-error.js";
import { runScoreStage } from "../pipeline/score.stage.js";

/**
 * Get detailed evidence and evaluation by ID.
 *
 * @param {string} id - Evaluation ObjectId
 * @returns {Promise<Object>}
 */
export async function getEvaluationById(id) {
  const evaluation = await ClauseEvaluation.findById(id)
    .populate("clause", "code title category requirement severity isMandatory")
    .populate("evidence.document", "originalName mimetype storageKey pageCount");

  if (!evaluation) {
    throw ApiError.notFound("Evaluation not found");
  }

  const obj = evaluation.toObject();

  return {
    id: obj._id.toString(),
    _id: obj._id.toString(),
    clauseId: obj.clause?._id?.toString() || null,
    clauseCode: obj.clause?.code || null,
    clauseTitle: obj.clause?.title || null,
    category: obj.clause?.category || null,
    requirement: obj.clause?.requirement || null,
    severity: obj.clause?.severity || null,
    status: obj.status,
    extractedValue: obj.extractedValue || null,
    extractedFields: obj.extractedFields || {},
    calculation: obj.calculation || {},
    verification: obj.verification || [],
    evidence: (obj.evidence || []).map((ev) => ({
      documentId: ev.document?._id?.toString() || ev.document?.toString() || null,
      documentName: ev.document?.originalName || null,
      page: ev.page,
      bbox: ev.bbox,
      snippet: ev.snippet,
    })),
    reasoning: obj.reasoning || null,
    confidence: obj.confidence ?? 0,
    overridden: obj.overridden || false,
    overrideReason: obj.overrideReason || null,
    overriddenBy: obj.overriddenBy || null,
    bidId: obj.bid.toString(),
    tenderId: obj.tender.toString(),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

/**
 * Officer review override for a clause evaluation.
 * Sets overridden=true, logs to AuditLog, and recalculates the Bid score.
 *
 * @param {string} id - Evaluation ObjectId
 * @param {string} status - New compliance status ("compliant", "non_compliant", "review")
 * @param {string} reason - Justification for officer override
 * @param {Object} user - Authenticated officer { id, role }
 * @returns {Promise<Object>} Updated evaluation and recalculated bid score
 */
export async function reviewEvaluation(id, status, reason, user) {
  const evaluation = await ClauseEvaluation.findById(id).populate("clause");
  if (!evaluation) {
    throw ApiError.notFound("Evaluation not found");
  }

  const oldStatus = evaluation.status;

  evaluation.status = status;
  evaluation.overridden = true;
  evaluation.overrideReason = reason;
  evaluation.overriddenBy = user.id;
  await evaluation.save();

  // Audit log entry for officer override
  await AuditLog.create({
    actor: user.id,
    action: "EVALUATION_OVERRIDE",
    entity: "ClauseEvaluation",
    entityId: evaluation._id,
    meta: {
      bidId: evaluation.bid,
      clauseCode: evaluation.clause?.code,
      oldStatus,
      newStatus: status,
      reason,
    },
  });

  // Recalculate bid score using the pipeline score stage function
  const updatedScores = await runScoreStage({ bid: { _id: evaluation.bid } });

  const updatedObj = await getEvaluationById(id);

  return {
    evaluation: updatedObj,
    recalculatedScore: updatedScores,
  };
}

export default {
  getEvaluationById,
  reviewEvaluation,
};
