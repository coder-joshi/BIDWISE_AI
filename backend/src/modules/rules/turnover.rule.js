/**
 * Evaluates whether bidder's average turnover over the last N financial years meets or exceeds the threshold.
 *
 * @param {Object} ruleConfig - { minAvgTurnoverCr?: number, minTurnoverCr?: number, threshold?: number, years?: number }
 * @param {Object} extractedFields - { turnoverYears?: Array<{ year: string, amountCr: number }>, averageTurnoverCr?: number }
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluate(ruleConfig = {}, extractedFields = {}) {
  const threshold =
    ruleConfig.minAvgTurnoverCr ??
    ruleConfig.minTurnoverCr ??
    ruleConfig.threshold;

  const requiredYears = ruleConfig.years || 3;

  if (threshold === undefined || threshold === null || isNaN(Number(threshold))) {
    return {
      status: "review",
      calculation: { threshold, requiredYears },
      reasoning: "Rule threshold is not defined in clause configuration.",
    };
  }

  const numericThreshold = Number(threshold);

  const yearsData = extractedFields.turnoverYears;

  // Case 1: Array of financial years provided
  if (Array.isArray(yearsData) && yearsData.length > 0) {
    const validEntries = yearsData.filter(
      (entry) =>
        entry &&
        entry.amountCr !== undefined &&
        entry.amountCr !== null &&
        !isNaN(Number(entry.amountCr))
    );

    if (validEntries.length === 0) {
      return {
        status: "review",
        calculation: { threshold: numericThreshold, requiredYears, validEntriesCount: 0 },
        reasoning: "No valid turnover year figures could be extracted.",
      };
    }

    if (validEntries.length < requiredYears) {
      const sum = validEntries.reduce((acc, curr) => acc + Number(curr.amountCr), 0);
      const partialAvg = sum / validEntries.length;
      return {
        status: "review",
        calculation: {
          threshold: numericThreshold,
          requiredYears,
          providedYears: validEntries.length,
          partialAverageCr: Math.round(partialAvg * 100) / 100,
        },
        reasoning: `Only ${validEntries.length} of ${requiredYears} required financial years found in submission. Manual review required.`,
      };
    }

    // Take the most recent requiredYears entries
    const evaluatedEntries = validEntries.slice(-requiredYears);
    const sum = evaluatedEntries.reduce((acc, curr) => acc + Number(curr.amountCr), 0);
    const avg = sum / evaluatedEntries.length;
    const roundedAvg = Math.round(avg * 100) / 100;

    const isCompliant = roundedAvg >= numericThreshold;

    return {
      status: isCompliant ? "compliant" : "non_compliant",
      calculation: {
        threshold: numericThreshold,
        requiredYears,
        evaluatedYears: evaluatedEntries.map((e) => ({ year: e.year, amountCr: Number(e.amountCr) })),
        averageTurnoverCr: roundedAvg,
      },
      reasoning: isCompliant
        ? `Average turnover of ₹${roundedAvg} Cr over ${requiredYears} years meets the required ₹${numericThreshold} Cr threshold.`
        : `Average turnover of ₹${roundedAvg} Cr over ${requiredYears} years falls below the required ₹${numericThreshold} Cr threshold.`,
    };
  }

  // Case 2: Pre-calculated averageTurnoverCr provided
  if (
    extractedFields.averageTurnoverCr !== undefined &&
    extractedFields.averageTurnoverCr !== null &&
    !isNaN(Number(extractedFields.averageTurnoverCr))
  ) {
    const avg = Number(extractedFields.averageTurnoverCr);
    const roundedAvg = Math.round(avg * 100) / 100;
    const isCompliant = roundedAvg >= numericThreshold;

    return {
      status: isCompliant ? "compliant" : "non_compliant",
      calculation: {
        threshold: numericThreshold,
        requiredYears,
        averageTurnoverCr: roundedAvg,
      },
      reasoning: isCompliant
        ? `Average turnover of ₹${roundedAvg} Cr meets the required ₹${numericThreshold} Cr threshold.`
        : `Average turnover of ₹${roundedAvg} Cr falls below the required ₹${numericThreshold} Cr threshold.`,
    };
  }

  return {
    status: "review",
    calculation: { threshold: numericThreshold, requiredYears },
    reasoning: "Turnover data not found or unparseable from submitted documents.",
  };
}

export default { evaluate };
