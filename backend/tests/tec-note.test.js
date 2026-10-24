import test from "node:test";
import assert from "node:assert/strict";
import { Writable } from "stream";
import {
  generateTecNoteDraft,
  updateTecNote,
  exportTecNotePdf,
} from "../src/modules/tec/tec.service.js";
import TecNote from "../src/modules/tec/tec-note.model.js";
import Bid from "../src/modules/bids/bids.model.js";
import Tender from "../src/modules/tenders/tender.model.js";
import ClauseEvaluation from "../src/modules/evaluations/evaluation.model.js";
import ForensicAlert from "../src/modules/forensics/forensic-alert.model.js";
import AuditLog from "../src/modules/audit/audit-log.model.js";

test("TEC Note - Draft generates required citations, simulated mock notice, and disclaimer", async (t) => {
  const bidId = "660c1d2e4f8b9a001f3e7a12";

  const originalBidFindById = Bid.findById;
  Bid.findById = async function () {
    return {
      _id: bidId,
      tender: "660c1d2e4f8b9a001f3e7a01",
      bidderName: "Global Solutions Corp",
      gstNumber: "27AABCU9603R1ZM",
      panNumber: "AABCU9603R",
      overallStatus: "disqualified",
      compliancePercent: 50,
      clausesPassed: 1,
      clausesTotal: 2,
      criticalFailures: 1,
    };
  };

  const originalTenderFindById = Tender.findById;
  Tender.findById = async function () {
    return {
      _id: "660c1d2e4f8b9a001f3e7a01",
      bidNumber: "GEM/2026/B/5489210",
      organisation: "Ministry of Heavy Industries",
    };
  };

  const originalEvalFind = ClauseEvaluation.find;
  ClauseEvaluation.find = function () {
    return {
      populate: async () => [
        {
          status: "non_compliant",
          extractedValue: "₹12 Cr",
          reasoning: "Turnover below minimum ₹25 Cr requirement",
          clause: {
            code: "ATC 01",
            title: "Average Annual Turnover",
            requirement: "Min ₹25 Cr turnover over last 3 years",
            severity: "critical",
          },
          evidence: [{ page: 4 }],
          verification: [{ kind: "gst", result: "valid", source: "mock" }],
        },
      ],
    };
  };

  const originalAlertFind = ForensicAlert.find;
  ForensicAlert.find = function () {
    return {
      populate: async () => [
        {
          type: "ela",
          severity: "critical",
          page: 4,
          document: { originalName: "Audited_Turnover_FY24.pdf" },
          note: "Turnover numeral pixels show ELA anomaly",
          registrySource: "mock",
        },
      ],
    };
  };

  let savedTecNote = null;
  const originalTecNoteUpsert = TecNote.findOneAndUpdate;
  TecNote.findOneAndUpdate = async function (filter, update) {
    savedTecNote = {
      _id: "tec-1",
      bid: filter.bid,
      content: update.content,
      status: update.status,
      generatedAt: update.generatedAt,
    };
    return savedTecNote;
  };

  const originalAuditCreate = AuditLog.create;
  AuditLog.create = async () => ({});

  t.after(() => {
    Bid.findById = originalBidFindById;
    Tender.findById = originalTenderFindById;
    ClauseEvaluation.find = originalEvalFind;
    ForensicAlert.find = originalAlertFind;
    TecNote.findOneAndUpdate = originalTecNoteUpsert;
    AuditLog.create = originalAuditCreate;
  });

  const result = await generateTecNoteDraft(bidId, "user-01");

  assert.ok(result.content);
  // Must cite clause code
  assert.match(result.content, /Clause ATC 01/);
  // Must cite page numbers
  assert.match(result.content, /Page 4/);
  // Must state simulated for source "mock"
  assert.match(result.content, /simulated/i);
  // Must end with "subject to committee verification"
  assert.match(result.content, /subject to committee verification/i);
  assert.equal(result.status, "draft");
});

test("TEC Note - Reviewer edits and saves content and status", async (t) => {
  const bidId = "660c1d2e4f8b9a001f3e7a12";

  const tecNoteDoc = {
    _id: "tec-2",
    bid: bidId,
    content: "Original draft",
    status: "draft",
    save: async function () {
      return this;
    },
  };

  const originalFindOne = TecNote.findOne;
  TecNote.findOne = async function () {
    return tecNoteDoc;
  };

  const originalAuditCreate = AuditLog.create;
  AuditLog.create = async () => ({});

  t.after(() => {
    TecNote.findOne = originalFindOne;
    AuditLog.create = originalAuditCreate;
  });

  const updated = await updateTecNote(
    bidId,
    { content: "Final approved committee observations", status: "final" },
    { id: "officer-02", role: "admin" }
  );

  assert.equal(updated.content, "Final approved committee observations");
  assert.equal(updated.status, "final");
  assert.equal(updated.editedBy, "officer-02");
  assert.ok(updated.editedAt);
});

test("TEC Note - PDF export streams valid PDF format", async (t) => {
  const bidId = "660c1d2e4f8b9a001f3e7a12";

  const originalTecFindOne = TecNote.findOne;
  TecNote.findOne = async function () {
    return {
      _id: "tec-3",
      bid: bidId,
      content: "TEC Note Content: Clause ATC 01 failed. Subject to committee verification.",
      status: "draft",
      generatedAt: new Date(),
    };
  };

  const originalBidFindById = Bid.findById;
  Bid.findById = async function () {
    return {
      _id: bidId,
      bidderName: "Acme Enterprises",
      tender: "t1",
    };
  };

  const originalTenderFindById = Tender.findById;
  Tender.findById = async function () {
    return {
      _id: "t1",
      bidNumber: "GEM/2026/B/9999",
      organisation: "Department of Telecommunications",
    };
  };

  t.after(() => {
    TecNote.findOne = originalTecFindOne;
    Bid.findById = originalBidFindById;
    Tender.findById = originalTenderFindById;
  });

  // Create a mock response stream to capture PDF bytes
  const chunks = [];
  const mockRes = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });
  mockRes.headers = {};
  mockRes.setHeader = function (key, value) {
    this.headers[key] = value;
  };

  await exportTecNotePdf(bidId, mockRes);

  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(mockRes.headers["Content-Type"], "application/pdf");
  assert.match(mockRes.headers["Content-Disposition"], /attachment; filename="tec-note/);

  const fullPdfBuffer = Buffer.concat(chunks);
  // Verify standard PDF magic byte header (%PDF-)
  assert.ok(fullPdfBuffer.length > 100);
  assert.equal(fullPdfBuffer.subarray(0, 5).toString(), "%PDF-");
});
