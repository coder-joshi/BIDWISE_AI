import Tender from "./tender.model.js";
import Clause from "../clauses/clause.model.js";
import Bid from "../bids/bids.model.js";
import ClauseEvaluation from "../evaluations/evaluation.model.js";
import ForensicAlert from "../forensics/forensic-alert.model.js";
import AuditLog from "../audit/audit-log.model.js";
import ApiError from "../../common/utils/api-error.js";
import { paginate } from "../../common/utils/paginate.js";

/**
 * Create a new tender record and write an audit entry.
 */
export const createTender = async (data, userId) => {
  const existing = await Tender.findOne({ bidNumber: data.bidNumber });
  if (existing) {
    throw ApiError.conflict(`Tender with bid number ${data.bidNumber} already exists`);
  }

  const tender = await Tender.create({
    ...data,
    createdBy: userId,
  });

  await AuditLog.create({
    actor: userId,
    action: "TENDER_CREATE",
    entity: "Tender",
    entityId: tender._id,
    meta: {
      bidNumber: tender.bidNumber,
      organisation: tender.organisation,
      status: tender.status,
    },
  });

  return tender;
};

/**
 * List tenders with pagination.
 */
export const getTenders = async ({ page = 1, limit = 10, status, search }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { bidNumber: { $regex: search, $options: "i" } },
      { organisation: { $regex: search, $options: "i" } },
      { itemCategory: { $regex: search, $options: "i" } },
    ];
  }

  const paginatedResult = await paginate(Tender, filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: "createdBy", select: "name email role" },
  });

  return paginatedResult;
};

/**
 * Get tender detail with dynamically computed real KPIs.
 */
export const getTenderById = async (id) => {
  const tender = await Tender.findById(id).populate("createdBy", "name email role");
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  const [
    totalBidders,
    clausesAutoVerified,
    fullyCompliantBidders,
    bidIds,
    criticalClauseIds,
  ] = await Promise.all([
    Bid.countDocuments({ tender: id }),
    ClauseEvaluation.countDocuments({ tender: id, status: { $ne: "pending" } }),
    Bid.countDocuments({ tender: id, overallStatus: "compliant" }),
    Bid.find({ tender: id }).distinct("_id"),
    Clause.find({ tender: id, severity: "critical" }).distinct("_id"),
  ]);

  const [criticalNonCompliantCount, openTamperAlerts] = await Promise.all([
    criticalClauseIds.length
      ? ClauseEvaluation.countDocuments({
          tender: id,
          clause: { $in: criticalClauseIds },
          status: "non_compliant",
        })
      : 0,
    bidIds.length
      ? ForensicAlert.countDocuments({
          bid: { $in: bidIds },
          status: "open",
        })
      : 0,
  ]);

  const criticalDiscrepancies = criticalNonCompliantCount + openTamperAlerts;

  return {
    ...tender.toObject(),
    kpis: {
      totalBidders,
      clausesAutoVerified,
      fullyCompliantBidders,
      criticalDiscrepancies,
    },
  };
};

/**
 * Get compliance matrix for a tender.
 * Rows = clauses (ordered, with featured flag)
 * Columns = bidders
 * Each cell = { status, extractedValue, sourcePage, evaluationId }
 */
export const getTenderMatrix = async (tenderId) => {
  const tender = await Tender.findById(tenderId);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  const [clauses, bidders, evaluations] = await Promise.all([
    Clause.find({ tender: tenderId }).sort({ order: 1, createdAt: 1 }),
    Bid.find({ tender: tenderId }).sort({ createdAt: 1 }),
    ClauseEvaluation.find({ tender: tenderId }),
  ]);

  // Index evaluations by clauseId_bidId
  const evalMap = new Map();
  for (const ev of evaluations) {
    evalMap.set(`${ev.clause.toString()}_${ev.bid.toString()}`, ev);
  }

  const columns = bidders.map((bid) => ({
    bidderId: bid._id.toString(),
    bidderName: bid.bidderName,
    overallStatus: bid.overallStatus,
    compliancePercent: bid.compliancePercent,
    status: bid.status,
  }));

  const rows = clauses.map((clause) => {
    const clauseId = clause._id.toString();
    const cells = bidders.map((bid) => {
      const ev = evalMap.get(`${clauseId}_${bid._id.toString()}`);
      return {
        bidderId: bid._id.toString(),
        status: ev?.status || "pending",
        extractedValue: ev?.extractedValue || null,
        sourcePage: ev?.evidence?.[0]?.page || null,
        evaluationId: ev?._id?.toString() || null,
      };
    });

    return {
      clauseId,
      code: clause.code,
      title: clause.title,
      type: clause.type,
      category: clause.category,
      severity: clause.severity,
      featured: Boolean(clause.featured),
      order: clause.order || 0,
      isMandatory: Boolean(clause.isMandatory),
      cells,
    };
  });

  return {
    tenderId: tender._id.toString(),
    bidNumber: tender.bidNumber,
    organisation: tender.organisation,
    columns,
    rows,
  };
};

/**
 * Update tender details (restricted to creator or admin).
 */
export const updateTender = async (id, data, user) => {
  const tender = await Tender.findById(id);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  // Creator or admin check
  const isCreator = tender.createdBy.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isCreator && !isAdmin) {
    throw ApiError.forbidden("Only the tender creator or an administrator can update this tender");
  }

  const oldStatus = tender.status;

  Object.assign(tender, data);
  await tender.save();

  if (data.status && data.status !== oldStatus) {
    await AuditLog.create({
      actor: user.id,
      action: "TENDER_STATUS_UPDATE",
      entity: "Tender",
      entityId: tender._id,
      meta: {
        oldStatus,
        newStatus: tender.status,
      },
    });
  }

  return tender;
};

/**
 * Add or upsert clauses in bulk for a tender.
 */
export const addClauses = async (tenderId, clauses) => {
  const tender = await Tender.findById(tenderId);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  const upsertedClauses = await Promise.all(
    clauses.map((c) =>
      Clause.findOneAndUpdate(
        { tender: tenderId, code: c.code.toUpperCase() },
        { ...c, tender: tenderId },
        { upsert: true, new: true, runValidators: true }
      )
    )
  );

  return upsertedClauses;
};

/**
 * Get all clauses for a tender ordered by matrix order and creation time.
 */
export const getClauses = async (tenderId) => {
  const tender = await Tender.findById(tenderId);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  return Clause.find({ tender: tenderId }).sort({ order: 1, createdAt: 1 });
};
