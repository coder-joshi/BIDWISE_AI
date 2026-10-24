import mongoose from "mongoose";
import ForensicAlert from "./forensic-alert.model.js";
import Bid from "../bids/bids.model.js";
import ApiError from "../../common/utils/api-error.js";
import { generateSignedFileUrl } from "../files/file-token.service.js";

/**
 * List forensic alerts for a bid.
 * Returns { items, page, limit, total } format.
 *
 * @param {string} bidId
 * @param {Object} query - { page, limit, status, severity }
 * @returns {Promise<Object>}
 */
export async function getBidForensicAlerts(bidId, query = {}) {
  const isObjectId =
    mongoose.Types.ObjectId.isValid(bidId) &&
    String(new mongoose.Types.ObjectId(bidId)) === bidId;

  const bid = await Bid.findOne(isObjectId ? { _id: bidId } : { tenderId: bidId });
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const filter = { bid: bid._id };
  if (query.status) filter.status = query.status;
  if (query.severity) filter.severity = query.severity;

  const [alerts, total] = await Promise.all([
    ForensicAlert.find(filter)
      .populate("document", "originalName mimetype")
      .sort({ severity: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ForensicAlert.countDocuments(filter),
  ]);

  const items = alerts.map((alert) => {
    const signedEla = alert.elaImageKey
      ? generateSignedFileUrl(alert.elaImageKey)
      : null;

    return {
      id: alert._id.toString(),
      _id: alert._id.toString(),
      bidId: alert.bid.toString(),
      documentId: alert.document?._id?.toString() || null,
      documentName: alert.document?.originalName || null,
      page: alert.page,
      type: alert.type,
      severity: alert.severity,
      documentValue: alert.documentValue || null,
      registryValue: alert.registryValue || null,
      registrySource: alert.registrySource,
      metadata: alert.metadata || {},
      hasElaImage: Boolean(alert.elaImageKey),
      elaUrl: signedEla?.url || null,
      note: alert.note || null,
      status: alert.status,
      createdAt: alert.createdAt,
    };
  });

  return {
    items,
    page,
    limit,
    total,
  };
}

/**
 * Get detailed comparison data for a forensic alert.
 *
 * @param {string} id - ForensicAlert ObjectId
 * @returns {Promise<Object>}
 */
export async function getForensicAlertById(id) {
  const alert = await ForensicAlert.findById(id)
    .populate("document", "originalName mimetype storageKey")
    .populate("bid", "bidderName tenderId status overallStatus");

  if (!alert) {
    throw ApiError.notFound("Forensic alert not found");
  }

  const signedEla = alert.elaImageKey
    ? generateSignedFileUrl(alert.elaImageKey)
    : null;

  return {
    id: alert._id.toString(),
    _id: alert._id.toString(),
    bidId: alert.bid?._id?.toString() || alert.bid?.toString(),
    bidderName: alert.bid?.bidderName || null,
    tenderId: alert.bid?.tenderId || null,
    documentId: alert.document?._id?.toString() || null,
    documentName: alert.document?.originalName || null,
    page: alert.page,
    type: alert.type,
    severity: alert.severity,
    comparison: {
      documentValue: alert.documentValue || null,
      registryValue: alert.registryValue || null,
      registrySource: alert.registrySource,
      isSimulated: alert.registrySource === "mock",
    },
    metadata: alert.metadata || {},
    ela: {
      hasElaImage: Boolean(alert.elaImageKey),
      url: signedEla?.url || null,
      expiresAt: signedEla?.expiresAt || null,
    },
    note: alert.note || null,
    status: alert.status,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
  };
}

/**
 * Generate short-lived signed URL for ELA forensics overlay image.
 *
 * @param {string} id - ForensicAlert ObjectId
 * @returns {Promise<{ url: string, expiresAt: string, alertId: string }>}
 */
export async function getAlertElaUrl(id) {
  const alert = await ForensicAlert.findById(id);
  if (!alert) {
    throw ApiError.notFound("Forensic alert not found");
  }

  if (!alert.elaImageKey) {
    throw ApiError.notFound("No Error Level Analysis (ELA) image available for this alert");
  }

  const signed = generateSignedFileUrl(alert.elaImageKey);
  return {
    url: signed.url,
    expiresAt: signed.expiresAt,
    alertId: alert._id.toString(),
  };
}

export default {
  getBidForensicAlerts,
  getForensicAlertById,
  getAlertElaUrl,
};
