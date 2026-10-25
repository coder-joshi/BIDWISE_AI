import mongoose from "mongoose";
import Bid from "./bids.model.js";
import Tender from "../tenders/tender.model.js";
import AuditLog from "../audit/audit-log.model.js";
import ApiError from "../../common/utils/api-error.js";
import { paginate } from "../../common/utils/paginate.js";
import * as documentsService from "../documents/documents.service.js";

/**
 * Helper to resolve a Bid query by MongoDB ObjectId or string tenderId.
 */
const findBidQuery = (id) => {
  const isObjectId =
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id;

  return isObjectId ? { _id: id } : { $or: [{ _id: id }, { tenderId: id }] };
};

/**
 * Create a new bidder record linked to a tender.
 */
export const createBidder = async (tenderId, data, userId) => {
  const tender = await Tender.findById(tenderId);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  const bid = await Bid.create({
    tender: tender._id,
    tenderId: tender.bidNumber,
    bidderName: data.bidderName,
    bidderType: data.bidderType,
    gstNumber: data.gstNumber,
    panNumber: data.panNumber,
    udyamNumber: data.udyamNumber,
    uploadedBy: userId,
  });

  await AuditLog.create({
    actor: userId,
    action: "BID_CREATE",
    entity: "Bid",
    entityId: bid._id,
    meta: {
      tenderId: tender.bidNumber,
      bidderName: bid.bidderName,
    },
  });

  const obj = bid.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
  };
};

/**
 * List all bidders belonging to a tender.
 */
export const getBidsByTender = async (tenderId) => {
  const tender = await Tender.findById(tenderId);
  if (!tender) {
    throw ApiError.notFound("Tender not found");
  }

  const bids = await Bid.find({ tender: tenderId }).sort({ createdAt: -1 });
  return bids.map((b) => {
    const obj = b.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
    };
  });
};

/**
 * List all bids with pagination and compatibility fields for the frontend.
 */
export const getAllBids = async ({ page = 1, limit = 10, status, search } = {}) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { tenderId: { $regex: search, $options: "i" } },
      { bidderName: { $regex: search, $options: "i" } },
    ];
  }

  const paginatedResult = await paginate(Bid, filter, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  const items = paginatedResult.items.map((b) => {
    const obj = typeof b.toObject === "function" ? b.toObject() : b;
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      tenderId: obj.tenderId,
      bidderName: obj.bidderName,
      status: obj.status,
      riskScore: obj.riskScore,
      complianceScore: obj.complianceScore,
      createdAt: obj.createdAt,
    };
  });

  return {
    ...paginatedResult,
    items,
  };
};

/**
 * Get detailed bid information with frontend compatibility fallbacks.
 */
export const getBidById = async (id) => {
  const bid = await Bid.findOne(findBidQuery(id));
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  const bidObj = bid.toObject();

  return {
    ...bidObj,
    id: bidObj._id.toString(),
    _id: bidObj._id.toString(),
    // TODO: Replace turnover with real financial data from extracted financial documents
    turnover: bidObj.turnover || "₹28.4 Cr",
    // TODO: Replace experience with real verification data from vendor experience certificates
    experience: bidObj.experience || "12 years",
    // TODO: Replace state and city with geocoded data from registered GST / business address
    state: bidObj.state || "Maharashtra",
    city: bidObj.city || "Mumbai",
    // TODO: Replace complianceRequirements with real ClauseEvaluation records
    complianceRequirements: bidObj.complianceRequirements || [
      { id: "CR-01", requirement: "GST Registration", bidderValue: "Active", status: "pass" },
      { id: "CR-02", requirement: "Turnover", bidderValue: "₹28 Cr", status: "pass" },
      { id: "CR-08", requirement: "PAN Link", bidderValue: "Pending", status: "pending" },
    ],
    // TODO: Replace fraudAlerts with real ForensicAlert records
    fraudAlerts:
      bidObj.riskScore && bidObj.riskScore > 50
        ? [{ id: "FA-01", type: "Edited PDF", severity: "high", detail: "Modified after signing" }]
        : [],
    // TODO: Replace mock documents array with real Document collection items
    documents: [
      { type: "gst", status: "verified", aiNote: "Valid GST" },
      { type: "pan", status: "verified", aiNote: "Valid PAN" },
    ],
  };
};

/**
 * Update bid status and write audit log.
 */
export const updateBidStatus = async (id, status, updates = {}, user = null) => {
  const bid = await Bid.findOne(findBidQuery(id));
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  const oldStatus = bid.status;
  if (status) bid.status = status;
  Object.assign(bid, updates);

  await bid.save();

  if (user && status && status !== oldStatus) {
    await AuditLog.create({
      actor: user.id,
      action: "BID_STATUS_UPDATE",
      entity: "Bid",
      entityId: bid._id,
      meta: {
        oldStatus,
        newStatus: bid.status,
      },
    });
  }

  const obj = bid.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
  };
};

/**
 * Create bid on multipart file upload.
 */
export const createBid = async ({
  tenderId,
  bidderName,
  gstNumber,
  panNumber,
  udyamNumber,
  uploadedBy,
  files = [],
}) => {
  let tender = null;
  if (tenderId) {
    const isObjectId =
      mongoose.Types.ObjectId.isValid(tenderId) &&
      String(new mongoose.Types.ObjectId(tenderId)) === tenderId;

    tender = isObjectId
      ? await Tender.findById(tenderId)
      : await Tender.findOne({ bidNumber: tenderId });
  }

  if (!tender) {
    tender =
      (await Tender.findOne()) ||
      (await Tender.create({
        bidNumber:
          tenderId ||
          `GEM/${new Date().getFullYear()}/B/${Math.floor(
            1000000 + Math.random() * 9000000
          )}`,
        organisation: "Ministry of Railways",
        itemCategory: "General Procurement",
        quantity: 1,
        estimatedValue: 1000000,
        bidEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: uploadedBy,
      }));
  }

  const bid = await Bid.create({
    tender: tender._id,
    tenderId: tender.bidNumber,
    bidderName: bidderName || "Uploaded Bidder",
    gstNumber,
    panNumber,
    udyamNumber,
    status: "processing",
    uploadedBy,
  });

  let uploadedDocuments = [];
  if (files && files.length > 0) {
    try {
      uploadedDocuments = await documentsService.uploadBidDocuments(
        bid._id,
        files,
        [],
        uploadedBy
      );
    } catch (err) {
      await Bid.findByIdAndDelete(bid._id);
      throw err;
    }
  }

  await AuditLog.create({
    actor: uploadedBy,
    action: "BID_CREATE",
    entity: "Bid",
    entityId: bid._id,
    meta: {
      tenderId: tender.bidNumber,
      bidderName: bid.bidderName,
      fileCount: uploadedDocuments.length,
    },
  });

  const obj = bid.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    documents: uploadedDocuments,
  };
};
