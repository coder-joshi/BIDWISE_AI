const isMock = () => {
  return (process.env.VERIFICATION_MODE || "mock").toLowerCase() === "mock";
};

/**
 * Verify Unique Document Identification Number (UDIN) issued by ICAI.
 * @param {Object} input - { udinNumber: string }
 * @returns {Promise<{ valid: boolean, details: Object, source: "mock"|"live", checkedAt: string }>}
 */
export async function verify(input = {}) {
  const udinNumber = (input.udinNumber || "").trim().toUpperCase();
  const checkedAt = new Date().toISOString();

  if (isMock()) {
    if (!udinNumber) {
      return {
        valid: false,
        details: { message: "UDIN number not provided" },
        source: "mock",
        checkedAt,
      };
    }

    return {
      valid: true,
      details: {
        udin: udinNumber,
        caName: "CA Mock Kumar Sharma",
        membershipNumber: "054321",
        firmName: "Mock & Associates Chartered Accountants",
        documentDesc: "Turnover Certificate and Audited Financial Statements",
        dateOfSigning: "2025-06-30",
        generationDate: "2025-06-30",
        status: "Active / Valid",
      },
      source: "mock",
      checkedAt,
    };
  }

  // Live adapter stub for production integration
  throw new Error("Live UDIN verification API is not configured or enabled");
}

export default { verify };
