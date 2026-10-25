import Document from "../documents/document.model.js";
import Clause from "../clauses/clause.model.js";
import ClauseEvaluation, { normalizeBbox } from "../evaluations/evaluation.model.js";
import * as aiClient from "../integrations/ai.client.js";
import { EVALUATION_STATUSES, DOCUMENT_PROCESSING_STATUSES } from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pipeline Stage 2: Call AI service to analyze documents against tender clauses.
 * Idempotent: Upserts ClauseEvaluation records by { bid, clause }.
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<{ evaluatedClauses: number }>}
 */
export async function runAnalyzeStage(context) {
  const { bid, tender } = context;

  const [clauses, documents] = await Promise.all([
    Clause.find({ tender: tender._id }).sort({ order: 1 }),
    Document.find({ bid: bid._id }),
  ]);

  if (clauses.length === 0) {
    logger.warn({ tenderId: tender._id }, "No clauses defined for tender, skipping analysis");
    return { evaluatedClauses: 0 };
  }

  logger.info(
    { bidId: bid._id, tenderId: tender._id, clausesCount: clauses.length, docCount: documents.length },
    "Analyzing documents with AI service"
  );

  const analysisResult = await aiClient.analyzeDocuments(tender, clauses, documents);
  const evaluationsFromAI = analysisResult.evaluations || [];

  // Map returned evaluations by clauseCode for quick lookup
  const aiEvalMap = new Map();
  for (const item of evaluationsFromAI) {
    if (item.clauseCode) {
      aiEvalMap.set(item.clauseCode.toUpperCase().trim(), item);
    }
  }

  // Idempotently create or update ClauseEvaluation for each clause
  for (const clause of clauses) {
    const aiItem = aiEvalMap.get(clause.code.toUpperCase().trim()) || {};

    const extractedValue = aiItem.extractedValue || null;
    const extractedFields = aiItem.extractedFields || {};
    const reasoning = aiItem.reasoning || "Clause analysis pending";
    const confidence = aiItem.confidence ?? 0.8;

    // Map evidence document string IDs to ObjectIds if valid
    const evidence = (aiItem.evidence || []).map((ev) => {
      // Find matching document or fallback to first doc
      let docId = documents[0]?._id;
      if (ev.document) {
        const found = documents.find((d) => d._id.toString() === ev.document.toString());
        if (found) docId = found._id;
      }

      const normalizedBbox = normalizeBbox(ev.bbox);
      return {
        document: docId,
        page: ev.page || 1,
        bbox: {
          x: normalizedBbox?.x ?? 0.1,
          y: normalizedBbox?.y ?? 0.1,
          w: normalizedBbox?.w ?? 0.8,
          h: normalizedBbox?.h ?? 0.1,
        },
        snippet: ev.snippet || "",
      };
    });

    await ClauseEvaluation.findOneAndUpdate(
      { bid: bid._id, clause: clause._id },
      {
        tender: tender._id,
        bid: bid._id,
        clause: clause._id,
        status: EVALUATION_STATUSES.PENDING,
        extractedValue,
        extractedFields,
        reasoning,
        confidence,
        evidence,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Mark documents as analyzed
  await Document.updateMany(
    { bid: bid._id },
    { $set: { processingStatus: DOCUMENT_PROCESSING_STATUSES.ANALYZED } }
  );

  return { evaluatedClauses: clauses.length };
}

export default { run: runAnalyzeStage };
