import turnoverRule from "./turnover.rule.js";
import miiRule from "./mii.rule.js";
import oemMafRule from "./oem-maf.rule.js";
import udyamNicRule from "./udyam-nic.rule.js";
import bisIsoRule from "./bis-iso.rule.js";
import { CLAUSE_CATEGORIES } from "../../common/constants/statuses.js";

/**
 * Dispatch evaluation to the appropriate rule engine module.
 *
 * @param {string} category - Clause category ("turnover", "mii", "oem_maf", "msme", "bis_iso", "other")
 * @param {Object} ruleConfig - Clause-specific rule parameters
 * @param {Object} extractedFields - AI-extracted values/fields from bidder documents
 * @param {Object} [options] - Optional runtime context (e.g. { now: Date })
 * @returns {{ status: "compliant"|"non_compliant"|"review", calculation: Object, reasoning: string }}
 */
export function evaluateRule(category, ruleConfig = {}, extractedFields = {}, options = {}) {
  const normalizedCategory = (category || "").toLowerCase().trim();

  switch (normalizedCategory) {
    case CLAUSE_CATEGORIES.TURNOVER:
    case "turnover":
      return turnoverRule.evaluate(ruleConfig, extractedFields, options);

    case CLAUSE_CATEGORIES.MII:
    case "mii":
      return miiRule.evaluate(ruleConfig, extractedFields, options);

    case CLAUSE_CATEGORIES.OEM_MAF:
    case "oem_maf":
    case "oem":
    case "maf":
      return oemMafRule.evaluate(ruleConfig, extractedFields, options);

    case CLAUSE_CATEGORIES.MSME:
    case "msme":
    case "udyam":
    case "nic":
      return udyamNicRule.evaluate(ruleConfig, extractedFields, options);

    case CLAUSE_CATEGORIES.BIS_ISO:
    case "bis_iso":
    case "iso":
    case "bis":
      return bisIsoRule.evaluate(ruleConfig, extractedFields, options);

    default:
      // Fallback for custom or unmapped clause categories
      if (extractedFields.status && ["compliant", "non_compliant", "review"].includes(extractedFields.status)) {
        return {
          status: extractedFields.status,
          calculation: { generic: true },
          reasoning: extractedFields.reasoning || "Direct evaluation result.",
        };
      }

      return {
        status: "review",
        calculation: { category: normalizedCategory },
        reasoning: `No automated rule defined for category "${category}". Manual officer review required.`,
      };
  }
}

export {
  turnoverRule,
  miiRule,
  oemMafRule,
  udyamNicRule,
  bisIsoRule,
};

export default { evaluateRule };
