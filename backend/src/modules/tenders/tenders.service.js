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
 * Get tender detail with dynamically computed KPIs.
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
  ] = await Promise.all([
    Bid.countDocuments({ tender: id }),
    ClauseEvaluation.countDocuments({ tender: id, status: "compliant" }),
    Bid.countDocuments({ tender: id, overallStatus: "compliant" }),
    Bid.find({ tender: id }).distinct("_id"),
  ]);

  const criticalDiscrepancies = bidIds.length
    ? await ForensicAlert.countDocuments({
        bid: { $in: bidIds },
        severity: "critical",
        status: "open",
      })
    : 0;

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
