const isMock = () => {
  return (process.env.VERIFICATION_MODE || "mock").toLowerCase() === "mock";
};

/**
 * Verify Udyam Registration Number.
 * @param {Object} input - { udyamNumber: string }
 * @returns {Promise<{ valid: boolean, details: Object, source: "mock"|"live", checkedAt: string }>}
 */
export async function verify(input = {}) {
  const udyamNumber = (input.udyamNumber || "").trim().toUpperCase();
  const checkedAt = new Date().toISOString();

  if (isMock()) {
    if (!udyamNumber) {
      return {
        valid: false,
        details: { message: "Udyam number not provided" },
        source: "mock",
        checkedAt,
      };
    }

    return {
      valid: true,
      details: {
        udyamRegistrationNumber: udyamNumber,
        enterpriseName: "Mock MSME Enterprise Pvt Ltd",
        organisationType: "Private Limited",
        majorActivity: "Manufacturing",
        enterpriseType: "Small",
        nicCode: "26100",
        nicDescription: "Manufacture of electronic components and boards",
        socialCategory: "General",
        dateOfIncorporation: "2015-06-15",
        status: "Active",
      },
      source: "mock",
      checkedAt,
    };
  }

  // Live adapter stub for production integration
  throw new Error("Live Udyam verification API is not configured or enabled");
}

export default { verify };
