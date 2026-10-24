import test from "node:test";
import assert from "node:assert/strict";
import { getEvaluationById, reviewEvaluation } from "../src/modules/evaluations/evaluations.service.js";
import ClauseEvaluation from "../src/modules/evaluations/evaluation.model.js";
import AuditLog from "../src/modules/audit/audit-log.model.js";
import Bid from "../src/modules/bids/bids.model.js";
import ForensicAlert from "../src/modules/forensics/forensic-alert.model.js";

test("Evidence & Review - Overriding evaluation updates status, logs audit, and recalculates score", async (t) => {
  const evalId = "660c1d2e4f8b9a001f3e7a33";
  const bidId = "660c1d2e4f8b9a001f3e7a12";

  const evaluationDoc = {
    _id: evalId,
    bid: bidId,
    tender: "660c1d2e4f8b9a001f3e7a01",
    status: "non_compliant",
    extractedValue: "₹18 Cr",
    clause: {
      _id: "c1",
      code: "ATC 01",
      title: "Turnover",
      requirement: "Min ₹20 Cr",
      severity: "critical",
    },
    overridden: false,
    overrideReason: null,
    overriddenBy: null,
    save: async function () {
      return this;
    },
    toObject: function () {
      return {
        _id: this._id,
        bid: this.bid,
        tender: this.tender,
        status: this.status,
        extractedValue: this.extractedValue,
        clause: this.clause,
        overridden: this.overridden,
        overrideReason: this.overrideReason,
        overriddenBy: this.overriddenBy,
        evidence: [{ page: 2, snippet: "Turnover ₹18 Cr" }],
      };
    },
  };

  const createQueryMock = () => {
    const query = {
      populate: function () {
        return query;
      },
      then: function (resolve, reject) {
        return Promise.resolve(evaluationDoc).then(resolve, reject);
      },
    };
    return query;
  };

  const originalClauseEvalFindById = ClauseEvaluation.findById;
  ClauseEvaluation.findById = function () {
    return createQueryMock();
  };

  // Mock AuditLog
  let loggedAudit = null;
  const originalAuditCreate = AuditLog.create;
  AuditLog.create = async function (data) {
    loggedAudit = data;
    return data;
  };

  // Mock evaluations for score recalculation
  const originalEvalFind = ClauseEvaluation.find;
  ClauseEvaluation.find = function () {
    return {
      populate: async () => [
        {
          status: "compliant", // Now compliant after override!
          clause: { severity: "critical" },
        },
      ],
    };
  };

  // Mock ForensicAlert
  const originalAlertFind = ForensicAlert.find;
  ForensicAlert.find = async function () {
    return [];
  };

  // Mock Bid
  const originalBidUpdate = Bid.findByIdAndUpdate;
  let updatedBid = null;
  Bid.findByIdAndUpdate = async function (id, update) {
    updatedBid = update.$set;
    return {
      _id: id,
      ...updatedBid,
    };
  };

  t.after(() => {
    ClauseEvaluation.findById = originalClauseEvalFindById;
    ClauseEvaluation.find = originalEvalFind;
    AuditLog.create = originalAuditCreate;
    ForensicAlert.find = originalAlertFind;
    Bid.findByIdAndUpdate = originalBidUpdate;
  });

  const officerUser = { id: "officer-01", role: "procurement_officer" };
  const result = await reviewEvaluation(
    evalId,
    "compliant",
    "Verified against original audited statements directly from portal",
    officerUser
  );

  assert.equal(evaluationDoc.status, "compliant");
  assert.equal(evaluationDoc.overridden, true);
  assert.equal(evaluationDoc.overrideReason, "Verified against original audited statements directly from portal");
  assert.equal(evaluationDoc.overriddenBy, "officer-01");

  // Check AuditLog
  assert.ok(loggedAudit);
  assert.equal(loggedAudit.action, "EVALUATION_OVERRIDE");
  assert.equal(loggedAudit.meta.oldStatus, "non_compliant");
  assert.equal(loggedAudit.meta.newStatus, "compliant");

  // Check Recalculated Score
  assert.ok(result.recalculatedScore);
  assert.equal(result.recalculatedScore.compliancePercent, 100);
  assert.equal(result.recalculatedScore.overallStatus, "compliant");
  assert.equal(updatedBid.compliancePercent, 100);
  assert.equal(updatedBid.overallStatus, "compliant");
});
