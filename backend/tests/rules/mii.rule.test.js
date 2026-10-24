import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../../src/modules/rules/mii.rule.js";

test("MII Rule - Above Class-I threshold (50%)", () => {
  const ruleConfig = { miiClass: "Class I", localContentThreshold: 50 };
  const extractedFields = { localContentPercent: 65, miiClass: "Class I" };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.extractedLocalContentPercent, 65);
});

test("MII Rule - Exactly at threshold", () => {
  const ruleConfig = { miiClass: "Class I", localContentThreshold: 50 };
  const extractedFields = { localContentPercent: 50 };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
});

test("MII Rule - Below threshold", () => {
  const ruleConfig = { miiClass: "Class I", localContentThreshold: 50 };
  const extractedFields = { localContentPercent: 42 };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "non_compliant");
  assert.match(result.reasoning, /does not meet the minimum required/);
});

test("MII Rule - Class II required and satisfied (20%)", () => {
  const ruleConfig = { miiClass: "Class II" };
  const extractedFields = { localContentPercent: 25, miiClass: "Class II" };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.requiredThresholdPercent, 20);
});

test("MII Rule - Missing localContentPercent", () => {
  const ruleConfig = { localContentThreshold: 50 };
  const extractedFields = {};

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /could not be extracted/);
});
