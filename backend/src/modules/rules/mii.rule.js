/**
 * Evaluates Make-in-India (MII) local content percentage against required class thresholds.
 *
 * @param {Object} ruleConfig - { miiClass?: string, localContentThreshold?: number, minLocalContentPercent?: number }
 * @param {Object} extractedFields - { localContentPercent?: number, miiClass?: string }
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluate(ruleConfig = {}, extractedFields = {}) {
  // Threshold can come directly from ruleConfig or default from class (Class I >= 50%, Class II >= 20%)
  const configClass = (ruleConfig.miiClass || "").trim().toUpperCase();
  let threshold = ruleConfig.localContentThreshold ?? ruleConfig.minLocalContentPercent;

  if (threshold === undefined || threshold === null) {
    if (configClass.includes("CLASS II") || configClass === "II" || configClass === "CLASS 2") {
      threshold = 20;
    } else if (configClass.includes("CLASS I") || configClass === "I" || configClass === "CLASS 1") {
      threshold = 50;
    } else {
      threshold = 50; // default Class-I
    }
  }

  const numericThreshold = Number(threshold);
  const rawPercent = extractedFields.localContentPercent;

  if (rawPercent === undefined || rawPercent === null || isNaN(Number(rawPercent))) {
    return {
      status: "review",
      calculation: {
        requiredThresholdPercent: numericThreshold,
        requiredClass: configClass || "Class I",
      },
      reasoning: "Local content percentage could not be extracted from the MII declaration.",
    };
  }

  const localContentPercent = Number(rawPercent);
  const extractedClass = (extractedFields.miiClass || "").trim().toUpperCase();

  // If a specific MII class is required and bidder declared a lower class
  const isClassMismatch =
    configClass &&
    !configClass.includes("CLASS II") &&
    (configClass.includes("CLASS I") || configClass === "I") &&
    (extractedClass.includes("CLASS II") || extractedClass === "II" || extractedClass.includes("NON-LOCAL"));

  const isPercentMet = localContentPercent >= numericThreshold;

  const calculation = {
    requiredThresholdPercent: numericThreshold,
    requiredClass: configClass || undefined,
    extractedLocalContentPercent: localContentPercent,
    extractedClass: extractedFields.miiClass || undefined,
  };

  if (isClassMismatch && !isPercentMet) {
    return {
      status: "non_compliant",
      calculation,
      reasoning: `Declared local content of ${localContentPercent}% is below the required ${numericThreshold}% threshold for ${configClass}.`,
    };
  }

  if (isPercentMet) {
    return {
      status: "compliant",
      calculation,
      reasoning: `Declared local content of ${localContentPercent}% satisfies the required ${numericThreshold}% threshold.`,
    };
  }

  return {
    status: "non_compliant",
    calculation,
    reasoning: `Declared local content of ${localContentPercent}% does not meet the minimum required threshold of ${numericThreshold}%.`,
  };
}

export default { evaluate };
