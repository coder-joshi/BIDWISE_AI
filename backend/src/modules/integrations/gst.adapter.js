const isMock = () => {
  return (process.env.VERIFICATION_MODE || "mock").toLowerCase() === "mock";
};

/**
 * Verify GST identification number.
 * @param {Object} input - { gstNumber: string }
 * @returns {Promise<{ valid: boolean, details: Object, source: "mock"|"live", checkedAt: string }>}
 */
export async function verify(input = {}) {
  const gstNumber = (input.gstNumber || "").trim().toUpperCase();
  const checkedAt = new Date().toISOString();

  if (isMock()) {
    if (!gstNumber) {
      return {
        valid: false,
        details: { message: "GST number not provided" },
        source: "mock",
        checkedAt,
      };
    }

    const stateCode = gstNumber.slice(0, 2);
    const isState22 = stateCode === "22";

    return {
      valid: true,
      details: {
        gstin: gstNumber,
        tradeName: isState22 ? "Mock Corp Ltd" : "Generic Firm Technologies Pvt Ltd",
        legalName: isState22 ? "Mock Corporation Limited" : "Generic Firm Technologies Private Limited",
        status: "Active",
        taxpayerType: "Regular",
        stateCode: stateCode || "27",
        state: isState22 ? "Chhattisgarh" : "Maharashtra",
        registrationDate: isState22 ? "2019-04-01" : "2020-01-01",
        annualReturnFiled: true,
      },
      source: "mock",
      checkedAt,
    };
  }

  // Live adapter stub for production integration
  throw new Error("Live GST verification API is not configured or enabled");
}

export default { verify };
