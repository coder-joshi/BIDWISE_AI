import Bid from "../bids/bids.model.js";
import ClauseEvaluation from "../evaluations/evaluation.model.js";
import ForensicAlert from "../forensics/forensic-alert.model.js";
import {
  BID_STATUSES,
  BID_OVERALL_STATUSES,
  EVALUATION_STATUSES,
  SEVERITY_LEVELS,
} from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pure calculation function for compliance score and overall status.
 * Can be tested independently without a database.
 *
 * @param {Array<Object>} evaluations - Evaluated clauses with populated clause metadata
 * @param {Array<Object>} forensicAlerts - Detected forensic alerts
 * @returns {{ compliancePercent: number, clausesPassed: number, clausesTotal: number, criticalFailures: number, tamperAlerts: number, overallStatus: string }}
 */
export function calculateComplianceScore(evaluations = [], forensicAlerts = []) {
  const clausesTotal = evaluations.length;

  const clausesPassed = evaluations.filter(
    (e) => e.status === EVALUATION_STATUSES.COMPLIANT
  ).length;

  const compliancePercent =
    clausesTotal > 0 ? Math.round((clausesPassed / clausesTotal) * 100) : 0;

  // Critical failures: evaluations marked non_compliant on clauses with severity "critical"
  const criticalFailures = evaluations.filter((e) => {
    const isNonCompliant = e.status === EVALUATION_STATUSES.NON_COMPLIANT;
    const isCritical =
      e.clause?.severity === SEVERITY_LEVELS.CRITICAL ||
      e.severity === SEVERITY_LEVELS.CRITICAL;
    return isNonCompliant && isCritical;
  }).length;

  const tamperAlerts = forensicAlerts.length;

  // Determination of overall status:
  // "disqualified" if criticalFailures > 0;
  // else "flagged" if tamperAlerts > 0;
  // else "compliant" if every clause is compliant;
  // else "review".
  let overallStatus;
  if (criticalFailures > 0) {
    overallStatus = BID_OVERALL_STATUSES.DISQUALIFIED;
  } else if (tamperAlerts > 0) {
    overallStatus = BID_OVERALL_STATUSES.FLAGGED;
  } else if (clausesTotal > 0 && clausesPassed === clausesTotal) {
    overallStatus = BID_OVERALL_STATUSES.COMPLIANT;
  } else {
    overallStatus = BID_OVERALL_STATUSES.REVIEW;
  }

  return {
    compliancePercent,
    clausesPassed,
    clausesTotal,
    criticalFailures,
    tamperAlerts,
    overallStatus,
  };
}

/**
 * Pipeline Stage 6: Compute final bid scores and update Bid record status to "verified".
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<Object>} Computed scoring summary
 */
export async function runScoreStage(context) {
  const { bid } = context;

  const [evaluations, forensicAlerts] = await Promise.all([
    ClauseEvaluation.find({ bid: bid._id }).populate("clause"),
    ForensicAlert.find({ bid: bid._id }),
  ]);

  const scoreData = calculateComplianceScore(evaluations, forensicAlerts);

  // Update Bid with results
  const updatedBid = await Bid.findByIdAndUpdate(
    bid._id,
    {
      $set: {
        compliancePercent: scoreData.compliancePercent,
        clausesPassed: scoreData.clausesPassed,
        clausesTotal: scoreData.clausesTotal,
        criticalFailures: scoreData.criticalFailures,
        tamperAlerts: scoreData.tamperAlerts,
        overallStatus: scoreData.overallStatus,
        status: BID_STATUSES.VERIFIED,
        verifiedAt: new Date(),
        // Frontend compatibility fields
        complianceScore: scoreData.compliancePercent,
        riskScore:
          scoreData.criticalFailures > 0
            ? 95
            : scoreData.tamperAlerts > 0
            ? 65
            : Math.max(0, 100 - scoreData.compliancePercent),
        fraudSignals: scoreData.tamperAlerts,
      },
    },
    { new: true }
  );

  // Update context bid reference
  context.bid = updatedBid;

  logger.info(
    {
      bidId: bid._id,
      compliancePercent: scoreData.compliancePercent,
      overallStatus: scoreData.overallStatus,
      status: BID_STATUSES.VERIFIED,
    },
    "Score stage completed, bid marked verified"
  );

  return scoreData;
}

export default { run: runScoreStage, calculateComplianceScore };
