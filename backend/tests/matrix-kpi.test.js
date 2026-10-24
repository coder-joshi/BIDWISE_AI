import test from "node:test";
import assert from "node:assert/strict";
import { getTenderById, getTenderMatrix } from "../src/modules/tenders/tenders.service.js";
import Tender from "../src/modules/tenders/tender.model.js";
import Bid from "../src/modules/bids/bids.model.js";
import Clause from "../src/modules/clauses/clause.model.js";
import ClauseEvaluation from "../src/modules/evaluations/evaluation.model.js";
import ForensicAlert from "../src/modules/forensics/forensic-alert.model.js";

test("Matrix & KPIs - Computes real KPIs accurately", async (t) => {
  const tenderId = "660c1d2e4f8b9a001f3e7a01";

  // Mock Tender
  const originalFindById = Tender.findById;
  Tender.findById = function () {
    return {
      populate: async () => ({
        _id: tenderId,
        bidNumber: "GEM/2026/B/1000",
        organisation: "Test Organisation",
        toObject: () => ({
          _id: tenderId,
          bidNumber: "GEM/2026/B/1000",
          organisation: "Test Organisation",
        }),
      }),
    };
  };

  // Mock Bid
  const originalBidCount = Bid.countDocuments;
  const originalBidFind = Bid.find;
  Bid.countDocuments = async function (filter) {
    if (filter.overallStatus === "compliant") return 2;
    return 5; // totalBidders
  };
  Bid.find = function () {
    return {
      distinct: async () => ["bid-1", "bid-2", "bid-3", "bid-4", "bid-5"],
    };
  };

  // Mock Clause
  const originalClauseFind = Clause.find;
  Clause.find = function (filter) {
    if (filter.severity === "critical") {
      return {
        distinct: async () => ["clause-crit-1"],
      };
    }
    return {
      sort: async () => [],
    };
  };

  // Mock ClauseEvaluation
  const originalEvalCount = ClauseEvaluation.countDocuments;
  ClauseEvaluation.countDocuments = async function (filter) {
    if (filter.status?.$ne === "pending") return 15; // clausesAutoVerified
    if (filter.status === "non_compliant") return 2; // critical non-compliant
    return 0;
  };

  // Mock ForensicAlert
  const originalAlertCount = ForensicAlert.countDocuments;
  ForensicAlert.countDocuments = async function () {
    return 3; // open tamper alerts
  };

  t.after(() => {
    Tender.findById = originalFindById;
    Bid.countDocuments = originalBidCount;
    Bid.find = originalBidFind;
    Clause.find = originalClauseFind;
    ClauseEvaluation.countDocuments = originalEvalCount;
    ForensicAlert.countDocuments = originalAlertCount;
  });

  const tender = await getTenderById(tenderId);

  assert.equal(tender.kpis.totalBidders, 5);
  assert.equal(tender.kpis.clausesAutoVerified, 15);
  assert.equal(tender.kpis.fullyCompliantBidders, 2);
  // criticalDiscrepancies = 2 (critical non-compliant) + 3 (open tamper alerts) = 5
  assert.equal(tender.kpis.criticalDiscrepancies, 5);
});

test("Matrix & KPIs - Builds matrix with rows as clauses and columns as bidders", async (t) => {
  const tenderId = "660c1d2e4f8b9a001f3e7a02";

  const originalFindById = Tender.findById;
  Tender.findById = async function () {
    return {
      _id: tenderId,
      bidNumber: "GEM/2026/B/2000",
      organisation: "Ministry of Power",
    };
  };

  const clause1 = {
    _id: "c1",
    code: "ATC 01",
    title: "Turnover",
    type: "ATC",
    category: "turnover",
    severity: "critical",
    featured: true,
    order: 1,
    isMandatory: true,
  };
  const clause2 = {
    _id: "c2",
    code: "ATC 02",
    title: "Make in India",
    type: "ATC",
    category: "mii",
    severity: "major",
    featured: false,
    order: 2,
    isMandatory: true,
  };

  const originalClauseFind = Clause.find;
  Clause.find = function () {
    return {
      sort: async () => [clause1, clause2],
    };
  };

  const bidder1 = {
    _id: "b1",
    bidderName: "Alpha Ltd",
    overallStatus: "compliant",
    compliancePercent: 100,
    status: "verified",
  };
  const bidder2 = {
    _id: "b2",
    bidderName: "Beta Corp",
    overallStatus: "disqualified",
    compliancePercent: 50,
    status: "verified",
  };

  const originalBidFind = Bid.find;
  Bid.find = function () {
    return {
      sort: async () => [bidder1, bidder2],
    };
  };

  const evaluations = [
    {
      _id: "e1",
      clause: "c1",
      bid: "b1",
      status: "compliant",
      extractedValue: "₹40 Cr",
      evidence: [{ page: 3 }],
    },
    {
      _id: "e2",
      clause: "c1",
      bid: "b2",
      status: "non_compliant",
      extractedValue: "₹10 Cr",
      evidence: [{ page: 2 }],
    },
    {
      _id: "e3",
      clause: "c2",
      bid: "b1",
      status: "compliant",
      extractedValue: "Class I (60%)",
      evidence: [{ page: 5 }],
    },
  ];

  const originalEvalFind = ClauseEvaluation.find;
  ClauseEvaluation.find = async function () {
    return evaluations;
  };

  t.after(() => {
    Tender.findById = originalFindById;
    Clause.find = originalClauseFind;
    Bid.find = originalBidFind;
    ClauseEvaluation.find = originalEvalFind;
  });

  const matrix = await getTenderMatrix(tenderId);

  assert.equal(matrix.columns.length, 2);
  assert.equal(matrix.columns[0].bidderName, "Alpha Ltd");
  assert.equal(matrix.columns[1].bidderName, "Beta Corp");

  assert.equal(matrix.rows.length, 2);
  assert.equal(matrix.rows[0].code, "ATC 01");
  assert.equal(matrix.rows[0].featured, true);
  assert.equal(matrix.rows[0].cells.length, 2);

  // Cell 0,0: bidder1 on clause1
  assert.equal(matrix.rows[0].cells[0].status, "compliant");
  assert.equal(matrix.rows[0].cells[0].extractedValue, "₹40 Cr");
  assert.equal(matrix.rows[0].cells[0].sourcePage, 3);
  assert.equal(matrix.rows[0].cells[0].evaluationId, "e1");

  // Cell 0,1: bidder2 on clause1
  assert.equal(matrix.rows[0].cells[1].status, "non_compliant");
  assert.equal(matrix.rows[0].cells[1].extractedValue, "₹10 Cr");
  assert.equal(matrix.rows[0].cells[1].sourcePage, 2);

  // Cell 1,1: bidder2 on clause2 (missing evaluation -> defaults to pending)
  assert.equal(matrix.rows[1].cells[1].status, "pending");
  assert.equal(matrix.rows[1].cells[1].extractedValue, null);
});
