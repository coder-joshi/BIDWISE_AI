import test from "node:test";
import assert from "node:assert/strict";
import { calculateComplianceScore } from "../src/modules/pipeline/score.stage.js";

test("Score Stage - All clauses compliant produces compliant overallStatus", () => {
  const evaluations = [
    { status: "compliant", clause: { severity: "critical" } },
    { status: "compliant", clause: { severity: "major" } },
    { status: "compliant", clause: { severity: "minor" } },
  ];
  const alerts = [];

  const result = calculateComplianceScore(evaluations, alerts);

  assert.equal(result.compliancePercent, 100);
  assert.equal(result.clausesPassed, 3);
  assert.equal(result.clausesTotal, 3);
  assert.equal(result.criticalFailures, 0);
  assert.equal(result.tamperAlerts, 0);
  assert.equal(result.overallStatus, "compliant");
});

test("Score Stage - Critical failure causes disqualified overallStatus", () => {
  const evaluations = [
    { status: "compliant", clause: { severity: "major" } },
    { status: "non_compliant", clause: { severity: "critical" } },
    { status: "compliant", clause: { severity: "minor" } },
  ];
  const alerts = [];

  const result = calculateComplianceScore(evaluations, alerts);

  assert.equal(result.compliancePercent, 67); // 2/3 = 66.67% -> 67%
  assert.equal(result.clausesPassed, 2);
  assert.equal(result.clausesTotal, 3);
  assert.equal(result.criticalFailures, 1);
  assert.equal(result.overallStatus, "disqualified");
});

test("Score Stage - Tamper alert without critical failure causes flagged overallStatus", () => {
  const evaluations = [
    { status: "compliant", clause: { severity: "major" } },
    { status: "compliant", clause: { severity: "critical" } },
  ];
  const alerts = [{ type: "ela", severity: "major" }];

  const result = calculateComplianceScore(evaluations, alerts);

  assert.equal(result.compliancePercent, 100);
  assert.equal(result.tamperAlerts, 1);
  assert.equal(result.criticalFailures, 0);
  assert.equal(result.overallStatus, "flagged");
});

test("Score Stage - Critical failure takes priority over tamper alerts", () => {
  const evaluations = [
    { status: "non_compliant", clause: { severity: "critical" } },
  ];
  const alerts = [{ type: "ela", severity: "critical" }];

  const result = calculateComplianceScore(evaluations, alerts);

  assert.equal(result.criticalFailures, 1);
  assert.equal(result.tamperAlerts, 1);
  assert.equal(result.overallStatus, "disqualified");
});

test("Score Stage - Non-critical failures and no tamper alerts produce review overallStatus", () => {
  const evaluations = [
    { status: "compliant", clause: { severity: "critical" } },
    { status: "non_compliant", clause: { severity: "major" } }, // major, not critical
    { status: "review", clause: { severity: "minor" } },
  ];
  const alerts = [];

  const result = calculateComplianceScore(evaluations, alerts);

  assert.equal(result.compliancePercent, 33); // 1/3 = 33%
  assert.equal(result.criticalFailures, 0);
  assert.equal(result.tamperAlerts, 0);
  assert.equal(result.overallStatus, "review");
});

test("Score Stage - Empty clauses list returns 0% and review overallStatus", () => {
  const result = calculateComplianceScore([], []);

  assert.equal(result.compliancePercent, 0);
  assert.equal(result.clausesTotal, 0);
  assert.equal(result.clausesPassed, 0);
  assert.equal(result.criticalFailures, 0);
  assert.equal(result.overallStatus, "review");
});
