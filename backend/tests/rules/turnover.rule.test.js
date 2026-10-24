import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../../src/modules/rules/turnover.rule.js";

test("Turnover Rule - Average meets or exceeds threshold", () => {
  const ruleConfig = { minAvgTurnoverCr: 25.0, years: 3 };
  const extractedFields = {
    turnoverYears: [
      { year: "2021-22", amountCr: 30 },
      { year: "2022-23", amountCr: 25 },
      { year: "2023-24", amountCr: 35 },
    ],
  };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.averageTurnoverCr, 30);
  assert.match(result.reasoning, /meets the required/);
});

test("Turnover Rule - Exactly at threshold", () => {
  const ruleConfig = { minAvgTurnoverCr: 20.0, years: 2 };
  const extractedFields = {
    turnoverYears: [
      { year: "2022-23", amountCr: 20.0 },
      { year: "2023-24", amountCr: 20.0 },
    ],
  };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.averageTurnoverCr, 20.0);
});

test("Turnover Rule - Below threshold", () => {
  const ruleConfig = { minAvgTurnoverCr: 50.0, years: 3 };
  const extractedFields = {
    turnoverYears: [
      { year: "2021-22", amountCr: 20 },
      { year: "2022-23", amountCr: 30 },
      { year: "2023-24", amountCr: 40 },
    ],
  };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "non_compliant");
  assert.equal(result.calculation.averageTurnoverCr, 30);
  assert.match(result.reasoning, /falls below the required/);
});

test("Turnover Rule - Missing turnoverYears and missing average", () => {
  const ruleConfig = { minAvgTurnoverCr: 10.0, years: 3 };
  const extractedFields = {};

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /not found/);
});

test("Turnover Rule - Fewer years than required (2 instead of 3)", () => {
  const ruleConfig = { minAvgTurnoverCr: 15.0, years: 3 };
  const extractedFields = {
    turnoverYears: [
      { year: "2022-23", amountCr: 25 },
      { year: "2023-24", amountCr: 30 },
    ],
  };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.equal(result.calculation.providedYears, 2);
  assert.match(result.reasoning, /Only 2 of 3 required/);
});

test("Turnover Rule - Null amounts in turnover years", () => {
  const ruleConfig = { minAvgTurnoverCr: 10.0, years: 2 };
  const extractedFields = {
    turnoverYears: [
      { year: "2022-23", amountCr: null },
      { year: "2023-24", amountCr: undefined },
    ],
  };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /No valid turnover year figures/);
});

test("Turnover Rule - Fallback to pre-calculated averageTurnoverCr", () => {
  const ruleConfig = { minAvgTurnoverCr: 12.5 };
  const extractedFields = { averageTurnoverCr: 15.2 };

  const result = evaluate(ruleConfig, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.averageTurnoverCr, 15.2);
});
