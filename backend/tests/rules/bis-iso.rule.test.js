import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../../src/modules/rules/bis-iso.rule.js";

test("BIS/ISO Rule - Certificate valid in future", () => {
  const fixedNow = new Date("2026-06-01T12:00:00.000Z");
  const extractedFields = {
    certificationNumber: "ISO9001-2024",
    validUntil: "2027-12-31",
  };

  const result = evaluate({}, extractedFields, { now: fixedNow });
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.isExpired, false);
  assert.match(result.reasoning, /valid until 2027-12-31/);
});

test("BIS/ISO Rule - Certificate expired in the past", () => {
  const fixedNow = new Date("2026-06-01T12:00:00.000Z");
  const extractedFields = {
    certificationNumber: "ISO9001-2020",
    validUntil: "2025-12-31",
  };

  const result = evaluate({}, extractedFields, { now: fixedNow });
  assert.equal(result.status, "non_compliant");
  assert.equal(result.calculation.isExpired, true);
  assert.match(result.reasoning, /expired on 2025-12-31/);
});

test("BIS/ISO Rule - Certificate expires today (end of day is valid)", () => {
  const fixedNow = new Date("2026-06-01T10:00:00.000Z");
  const extractedFields = {
    validUntil: "2026-06-01",
  };

  const result = evaluate({}, extractedFields, { now: fixedNow });
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.isExpired, false);
});

test("BIS/ISO Rule - Missing expiry date", () => {
  const extractedFields = {
    certificationNumber: "ISO9001",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /validity \/ expiry date not found/);
});

test("BIS/ISO Rule - Invalid date format", () => {
  const extractedFields = {
    validUntil: "not-a-valid-date-string",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /Unparseable/);
});
