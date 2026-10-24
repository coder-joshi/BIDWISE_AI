import PDFDocument from "pdfkit";
import TecNote from "./tec-note.model.js";
import Bid from "../bids/bids.model.js";
import Tender from "../tenders/tender.model.js";
import ClauseEvaluation from "../evaluations/evaluation.model.js";
import ForensicAlert from "../forensics/forensic-alert.model.js";
import AuditLog from "../audit/audit-log.model.js";
import ApiError from "../../common/utils/api-error.js";
import { TEC_NOTE_STATUSES } from "../../common/constants/statuses.js";

/**
 * Generate a template-based draft TEC rejection/evaluation note from stored database records.
 * Cites clause codes and page numbers.
 * Declares simulated status for any "mock" verification results.
 * Concludes with "subject to committee verification".
 *
 * @param {string} bidId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function generateTecNoteDraft(bidId, userId) {
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  const tender = await Tender.findById(bid.tender);

  const [evaluations, alerts] = await Promise.all([
    ClauseEvaluation.find({ bid: bid._id }).populate("clause"),
    ForensicAlert.find({ bid: bid._id }).populate("document"),
  ]);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Filter non-compliant and review clauses
  const flaggedEvaluations = evaluations.filter(
    (e) => e.status === "non_compliant" || e.status === "review"
  );

  // Check for any simulated mock statutory verifications
  const simulatedChecks = [];
  for (const ev of evaluations) {
    for (const v of ev.verification || []) {
      if (v.source === "mock") {
        simulatedChecks.push(`${v.kind.toUpperCase()} (${v.result || "checked"})`);
      }
    }
  }
  for (const alert of alerts) {
    if (alert.registrySource === "mock") {
      simulatedChecks.push(`Registry Forensics (${alert.type})`);
    }
  }
  const uniqueSimulated = [...new Set(simulatedChecks)];

  // Construct draft text
  const lines = [];
  lines.push("================================================================================");
  lines.push("               GOVERNMENT OF INDIA - PROCUREMENT DIVISION                      ");
  lines.push("               TENDER EVALUATION COMMITTEE (TEC) NOTE                           ");
  lines.push("================================================================================");
  lines.push("");
  lines.push(`Date: ${dateStr}`);
  lines.push(`Tender Reference No : ${tender ? tender.bidNumber : bid.tenderId}`);
  lines.push(`Procuring Entity    : ${tender ? tender.organisation : "Government Department"}`);
  lines.push(`Bidder Name         : ${bid.bidderName}`);
  lines.push(`Bidder GSTIN / PAN  : ${bid.gstNumber || "N/A"} / ${bid.panNumber || "N/A"}`);
  lines.push(`Overall Bid Status  : ${bid.overallStatus.toUpperCase()}`);
  lines.push(`Compliance Score    : ${bid.compliancePercent}% (${bid.clausesPassed}/${bid.clausesTotal} clauses passed)`);
  lines.push("");
  lines.push("--------------------------------------------------------------------------------");
  lines.push("1. REASON FOR TECHNICAL SCRUTINY / REJECTION");
  lines.push("--------------------------------------------------------------------------------");

  if (flaggedEvaluations.length === 0 && alerts.length === 0) {
    lines.push("All evaluated tender clauses meet the stipulated minimum eligibility criteria.");
    lines.push("No non-compliance issues or discrepancies were observed during automated evaluation.");
  } else {
    lines.push(`Technical scrutiny of the submitted documents identified ${flaggedEvaluations.length} clause failure(s)/discrepancy(ies):`);
    lines.push("");

    flaggedEvaluations.forEach((ev, index) => {
      const clause = ev.clause || {};
      const pages = (ev.evidence || []).map((e) => `Page ${e.page}`).join(", ") || "No page referenced";
      lines.push(`  [${index + 1}] Clause ${clause.code || "N/A"}: ${clause.title || "Technical Criterion"}`);
      lines.push(`      - Severity       : ${(clause.severity || "major").toUpperCase()}`);
      lines.push(`      - Requirement    : ${clause.requirement || "As per tender specifications"}`);
      lines.push(`      - Extracted Value: ${ev.extractedValue || "Not Found"}`);
      lines.push(`      - Document Pages : ${pages}`);
      lines.push(`      - Finding        : ${ev.reasoning || "Failed compliance threshold"}`);
      lines.push("");
    });
  }

  if (alerts.length > 0) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push("2. DOCUMENT INTEGRITY & FORENSIC OBSERVATIONS");
    lines.push("--------------------------------------------------------------------------------");
    alerts.forEach((alert, index) => {
      lines.push(`  [${index + 1}] Document: ${alert.document?.originalName || "Uploaded File"} (Page ${alert.page || 1})`);
      lines.push(`      - Anomaly Type  : ${alert.type.toUpperCase()}`);
      lines.push(`      - Severity      : ${alert.severity.toUpperCase()}`);
      lines.push(`      - Finding       : ${alert.note || "Digital modification detected"}`);
      if (alert.documentValue && alert.registryValue) {
        lines.push(`      - Value Mismatch: Submitted "${alert.documentValue}" vs Official Record "${alert.registryValue}"`);
      }
      lines.push("");
    });
  }

  lines.push("--------------------------------------------------------------------------------");
  lines.push("3. STATUTORY REGISTRY VERIFICATION NOTICE");
  lines.push("--------------------------------------------------------------------------------");
  if (uniqueSimulated.length > 0) {
    lines.push(`Please note that the following registry or statutory results:`);
    lines.push(`  * ${uniqueSimulated.join(", ")}`);
    lines.push(`are marked with source "mock" and represent simulated records for this review cycle.`);
  } else {
    lines.push("Statutory verification was conducted against verified registry endpoints.");
  }
  lines.push("");
  lines.push("--------------------------------------------------------------------------------");
  lines.push("4. RECOMMENDATION & CONCLUSION");
  lines.push("--------------------------------------------------------------------------------");
  if (bid.overallStatus === "disqualified" || bid.criticalFailures > 0) {
    lines.push("In view of the critical technical non-compliances detailed above, the committee");
    lines.push(`recommends the disqualification of the bid submitted by M/s ${bid.bidderName}.`);
  } else if (bid.overallStatus === "flagged") {
    lines.push("In view of forensic and statutory discrepancies, the bid is recommended for");
    lines.push("detailed secondary scrutiny by the competent procurement authority.");
  } else {
    lines.push("The bid is recommended for technical qualification consideration.");
  }
  lines.push("");
  lines.push("The findings, non-compliance determinations, and statutory validations documented herein are subject to committee verification.");
  lines.push("================================================================================");

  const content = lines.join("\n");

  // Idempotent upsert of TecNote
  const tecNote = await TecNote.findOneAndUpdate(
    { bid: bid._id },
    {
      bid: bid._id,
      content,
      status: TEC_NOTE_STATUSES.DRAFT,
      generatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AuditLog.create({
    actor: userId || null,
    action: "TEC_NOTE_GENERATE",
    entity: "TecNote",
    entityId: tecNote._id,
    meta: {
      bidId: bid._id,
      status: tecNote.status,
      flaggedClauseCount: flaggedEvaluations.length,
    },
  });

  return tecNote;
}

/**
 * Update an existing TEC note content or status.
 *
 * @param {string} bidId
 * @param {Object} data - { content, status }
 * @param {Object} user - { id, role }
 * @returns {Promise<Object>}
 */
export async function updateTecNote(bidId, data, user) {
  const tecNote = await TecNote.findOne({ bid: bidId });
  if (!tecNote) {
    throw ApiError.notFound("TEC note not found for this bid. Please generate a draft first.");
  }

  if (data.content) tecNote.content = data.content;
  if (data.status) tecNote.status = data.status;
  tecNote.editedBy = user.id;
  tecNote.editedAt = new Date();

  await tecNote.save();

  await AuditLog.create({
    actor: user.id,
    action: "TEC_NOTE_UPDATE",
    entity: "TecNote",
    entityId: tecNote._id,
    meta: {
      bidId,
      status: tecNote.status,
    },
  });

  return tecNote;
}

/**
 * Get TEC note for a bid.
 *
 * @param {string} bidId
 * @returns {Promise<Object>}
 */
export async function getTecNoteByBidId(bidId) {
  const tecNote = await TecNote.findOne({ bid: bidId })
    .populate("editedBy", "name email role");

  if (!tecNote) {
    throw ApiError.notFound("TEC note not found for this bid");
  }

  return tecNote;
}

/**
 * Generate PDF stream of the TEC note using PDFKit.
 *
 * @param {string} bidId
 * @param {http.ServerResponse} res - Express response object
 */
export async function exportTecNotePdf(bidId, res) {
  const tecNote = await TecNote.findOne({ bid: bidId });
  if (!tecNote) {
    throw ApiError.notFound("TEC note not found for this bid. Please generate a draft first.");
  }

  const bid = await Bid.findById(bidId);
  const tender = bid ? await Tender.findById(bid.tender) : null;

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `TEC Note - ${bid?.bidderName || "Bid"}`,
      Author: "BidWise AI Evaluation Committee",
      Subject: `Tender Evaluation Note for ${tender?.bidNumber || bidId}`,
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="tec-note-${bidId}.pdf"`
  );

  doc.pipe(res);

  // PDF Header
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("TENDER EVALUATION COMMITTEE (TEC) NOTE", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Status: ${tecNote.status.toUpperCase()}`, { align: "center" })
    .moveDown(1);

  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(1);

  // Metadata block
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text(`Tender Ref No : `, { continued: true }).font("Helvetica").text(tender ? tender.bidNumber : bid?.tenderId || "N/A");
  doc.font("Helvetica-Bold").text(`Organisation   : `, { continued: true }).font("Helvetica").text(tender ? tender.organisation : "N/A");
  doc.font("Helvetica-Bold").text(`Bidder Name    : `, { continued: true }).font("Helvetica").text(bid ? bid.bidderName : "N/A");
  doc.font("Helvetica-Bold").text(`Generated Date : `, { continued: true }).font("Helvetica").text(new Date(tecNote.generatedAt).toLocaleDateString("en-IN"));
  doc.moveDown(1);

  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(1);

  // Note content
  doc
    .fontSize(9.5)
    .font("Courier")
    .text(tecNote.content, {
      align: "left",
      lineGap: 3,
    });

  // Footer
  doc.moveDown(2);
  doc
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor("#666666")
    .text(
      "CONFIDENTIAL - Generated by BidWise AI for official use by the Tender Evaluation Committee.",
      { align: "center" }
    );

  doc.end();
}

export default {
  generateTecNoteDraft,
  updateTecNote,
  getTecNoteByBidId,
  exportTecNotePdf,
};
