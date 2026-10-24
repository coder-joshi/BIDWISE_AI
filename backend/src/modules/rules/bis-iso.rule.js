/**
 * Evaluates whether BIS or ISO certificate is current and not expired.
 *
 * @param {Object} ruleConfig - { requiredCertification?: string }
 * @param {Object} extractedFields - { certificationNumber?: string, certBody?: string, validFrom?: string, validUntil?: string, expiryDate?: string }
 * @param {Object} [options] - { now?: Date }
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluate(ruleConfig = {}, extractedFields = {}, options = {}) {
  const expiryRaw = extractedFields.validUntil || extractedFields.expiryDate;

  if (!expiryRaw) {
    return {
      status: "review",
      calculation: {
        certificateNumber: extractedFields.certificationNumber || null,
        validUntil: null,
      },
      reasoning: "Certificate validity / expiry date not found in document.",
    };
  }

  const expiryDate = new Date(expiryRaw);
  if (isNaN(expiryDate.getTime())) {
    return {
      status: "review",
      calculation: {
        certificateNumber: extractedFields.certificationNumber || null,
        rawExpiry: expiryRaw,
      },
      reasoning: `Unparseable certificate validity date format: "${expiryRaw}".`,
    };
  }

  const now = options.now instanceof Date ? options.now : new Date();

  // If expiry is set to a date like 2028-12-31, consider end of day
  const expiryEndOfDay = new Date(expiryDate);
  if (
    expiryDate.getUTCHours() === 0 &&
    expiryDate.getUTCMinutes() === 0 &&
    expiryDate.getUTCSeconds() === 0
  ) {
    expiryEndOfDay.setUTCHours(23, 59, 59, 999);
  }

  const isExpired = expiryEndOfDay < now;

  const calculation = {
    certificateNumber: extractedFields.certificationNumber || null,
    certBody: extractedFields.certBody || null,
    validUntil: expiryDate.toISOString(),
    checkedAt: now.toISOString(),
    isExpired,
  };

  if (isExpired) {
    return {
      status: "non_compliant",
      calculation,
      reasoning: `Certificate expired on ${expiryDate.toISOString().split("T")[0]}.`,
    };
  }

  return {
    status: "compliant",
    calculation,
    reasoning: `Certificate is valid until ${expiryDate.toISOString().split("T")[0]}.`,
  };
}

export default { evaluate };
