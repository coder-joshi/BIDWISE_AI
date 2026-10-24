/**
 * Evaluates whether the OEM Manufacturer Authorization Form (MAF) cites the exact tender number of the current bid.
 *
 * @param {Object} ruleConfig - { tenderNumber?: string, bidNumber?: string }
 * @param {Object} extractedFields - { mafTenderNumber?: string, tenderNumber?: string, mafManufacturer?: string }
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluate(ruleConfig = {}, extractedFields = {}) {
  const expectedTender = (
    ruleConfig.tenderNumber ||
    ruleConfig.bidNumber ||
    ""
  ).trim();

  const extractedTender = (
    extractedFields.mafTenderNumber ||
    extractedFields.tenderNumber ||
    ""
  ).trim();

  if (!expectedTender) {
    return {
      status: "review",
      calculation: { expectedTender: null, extractedTender: extractedTender || null },
      reasoning: "Tender number not configured for OEM MAF verification.",
    };
  }

  if (!extractedTender) {
    return {
      status: "review",
      calculation: { expectedTender, extractedTender: null },
      reasoning: "Tender reference not found in the uploaded Manufacturer Authorization Form (MAF).",
    };
  }

  // Normalize for comparison: remove all non-alphanumeric chars for resilient matching
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const expectedNormalized = normalize(expectedTender);
  const extractedNormalized = normalize(extractedTender);

  const isMatch = expectedNormalized === extractedNormalized;

  const calculation = {
    expectedTenderNumber: expectedTender,
    extractedTenderNumber: extractedTender,
    manufacturer: extractedFields.mafManufacturer || null,
    isMatch,
  };

  if (isMatch) {
    return {
      status: "compliant",
      calculation,
      reasoning: `OEM MAF correctly references the tender number "${expectedTender}".`,
    };
  }

  return {
    status: "non_compliant",
    calculation,
    reasoning: `OEM MAF cites tender number "${extractedTender}", which does not match current tender "${expectedTender}".`,
  };
}

export default { evaluate };
