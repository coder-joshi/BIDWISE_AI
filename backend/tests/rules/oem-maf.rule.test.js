import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../../src/modules/rules/oem-maf.rule.js";

test("OEM MAF Rule - Exactly matching tender number", () => {
  const ruleConfig = { tenderNumber: "GEM/2026/B/5489210" };
  const extractedFields = { mafTenderNumber: "GEM/2026/B/5489210" };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.isMatch, true);
});

test("OEM MAF Rule - Match with case-insensitivity and extra spacing", () => {
  const ruleConfig = { tenderNumber: "GEM/2026/B/5489210" };
  const extractedFields = { mafTenderNumber: "  gem/2026/b/5489210  " };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.isMatch, true);
});

test("OEM MAF Rule - Wrong tender number (mismatch)", () => {
  const ruleConfig = { tenderNumber: "GEM/2026/B/5489210" };
  const extractedFields = { mafTenderNumber: "GEM/2025/B/9999999" };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "non_compliant");
  assert.equal(result.calculation.isMatch, false);
  assert.match(result.reasoning, /does not match current tender/);
});

test("OEM MAF Rule - Missing extracted tender number", () => {
  const ruleConfig = { tenderNumber: "GEM/2026/B/5489210" };
  const extractedFields = {};

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /not found in the uploaded/);
});

test("OEM MAF Rule - Missing tender number in config", () => {
  const ruleConfig = {};
  const extractedFields = { mafTenderNumber: "GEM/2026/B/1" };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /not configured/);
});
