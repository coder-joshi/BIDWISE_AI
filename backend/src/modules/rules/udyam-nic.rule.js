/**
 * Evaluates whether Udyam certificate activity corresponds to genuine manufacturing rather than trading.
 *
 * Under Indian Public Procurement Policy for MSEs, traders are excluded from MSE preferences;
 * only manufacturers and service providers are eligible.
 *
 * @param {Object} ruleConfig - { allowedActivityTypes?: string[], disallowedNicPrefixes?: string[] }
 * @param {Object} extractedFields - { nicCode?: string, activityType?: string, majorActivity?: string, nicDescription?: string }
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluate(ruleConfig = {}, extractedFields = {}) {
  const nicCode = (extractedFields.nicCode || "").toString().trim();
  const rawActivity = (
    extractedFields.activityType ||
    extractedFields.majorActivity ||
    ""
  ).toLowerCase().trim();

  if (!nicCode && !rawActivity) {
    return {
      status: "review",
      calculation: { nicCode: null, activityType: null },
      reasoning: "Neither NIC code nor activity type could be identified from the Udyam certificate.",
    };
  }

  // Known trading NIC divisions: 45 (motor trade), 46 (wholesale trade), 47 (retail trade)
  const tradingPrefixes = ruleConfig.disallowedNicPrefixes || ["45", "46", "47"];
  const isTradingNic = tradingPrefixes.some((prefix) => nicCode.startsWith(prefix));

  // Explicit trading activity text
  const isTradingActivity =
    rawActivity.includes("trading") ||
    rawActivity.includes("retail") ||
    rawActivity.includes("wholesale");

  const calculation = {
    nicCode: nicCode || null,
    activityType: extractedFields.activityType || extractedFields.majorActivity || null,
    nicDescription: extractedFields.nicDescription || null,
    isTrading: isTradingNic || isTradingActivity,
  };

  if (isTradingNic || isTradingActivity) {
    return {
      status: "non_compliant",
      calculation,
      reasoning: `Udyam registration indicates trading activity (${nicCode ? `NIC ${nicCode}` : rawActivity}). Procurement rules require manufacturing activity.`,
    };
  }

  // Manufacturing check: divisions 10-33 or explicit manufacturing activity
  let isManufacturingNic = false;
  if (nicCode.length >= 2) {
    const division = parseInt(nicCode.slice(0, 2), 10);
    if (!isNaN(division) && division >= 10 && division <= 33) {
      isManufacturingNic = true;
    }
  }

  const isManufacturingActivity = rawActivity.includes("manufacturing") || rawActivity.includes("production");

  if (isManufacturingNic || isManufacturingActivity) {
    return {
      status: "compliant",
      calculation: { ...calculation, isManufacturing: true },
      reasoning: `Udyam registration confirms eligible manufacturing activity (${nicCode ? `NIC ${nicCode}` : "Manufacturing"}).`,
    };
  }

  // If services or other division
  return {
    status: "review",
    calculation,
    reasoning: `Udyam activity (${rawActivity || `NIC ${nicCode}`}) could not be definitively confirmed as manufacturing. Manual verification recommended.`,
  };
}

export default { evaluate };
