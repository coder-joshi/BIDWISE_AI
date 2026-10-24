import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../../src/modules/rules/udyam-nic.rule.js";

test("Udyam NIC Rule - Manufacturing NIC code (division 26)", () => {
  const extractedFields = {
    nicCode: "26100",
    activityType: "manufacturing",
    nicDescription: "Manufacture of electronic components",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "compliant");
  assert.equal(result.calculation.isManufacturing, true);
  assert.match(result.reasoning, /eligible manufacturing activity/);
});

test("Udyam NIC Rule - Wholesale trading NIC code (NIC 46510)", () => {
  const extractedFields = {
    nicCode: "46510",
    activityType: "wholesale trading",
    nicDescription: "Wholesale of computers, computer peripheral equipment and software",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "non_compliant");
  assert.equal(result.calculation.isTrading, true);
  assert.match(result.reasoning, /trading activity/);
});

test("Udyam NIC Rule - Retail trading NIC code (NIC 47411)", () => {
  const extractedFields = {
    nicCode: "47411",
    activityType: "trading",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "non_compliant");
  assert.equal(result.calculation.isTrading, true);
});

test("Udyam NIC Rule - Activity text specifies trading without code", () => {
  const extractedFields = {
    activityType: "Retail Trading and Reselling",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "non_compliant");
});

test("Udyam NIC Rule - Missing all NIC and activity data", () => {
  const extractedFields = {};

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "review");
  assert.match(result.reasoning, /Neither NIC code nor activity type/);
});

test("Udyam NIC Rule - Other non-manufacturing division (e.g. division 62 software services)", () => {
  const extractedFields = {
    nicCode: "62011",
    activityType: "services",
    nicDescription: "Computer programming activities",
  };

  const result = evaluate({}, extractedFields);
  assert.equal(result.status, "review");
});
