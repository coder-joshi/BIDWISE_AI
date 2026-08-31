import Bid from "./bids.model.js";
import ApiError from "../../common/utils/api-error.js";

const createBid = async ({ tenderId, bidderName, gstNumber, panNumber, udyamNumber, uploadedBy, files = [] }) => {
  const documents = files.map((f) => ({
    type:         "other",
    originalName: f.originalname,
    filename:     f.filename,
    path:         f.path,
    mimetype:     f.mimetype,
    sizeBytes:    f.size,
  }));

  const bid = await Bid.create({
    tenderId,
    bidderName,
    gstNumber,
    panNumber,
    udyamNumber,
    uploadedBy,
    documents,
    status: "processing",
  });

  return bid;
};

const getAllBids = async (uploadedBy) => {
  return await Bid.find({ uploadedBy }).sort({ createdAt: -1 }).lean();
};

const getBidById = async (id) => {
  const bid = await Bid.findById(id).populate("uploadedBy", "name email role");
  if (!bid) throw ApiError.notfound("Bid not found");
  return bid;
};

const updateBidStatus = async (id, status, { riskScore, complianceScore, fraudSignals } = {}) => {
  const bid = await Bid.findByIdAndUpdate(
    id,
    { status, riskScore, complianceScore, fraudSignals, verifiedAt: new Date() },
    { new: true }
  );
  if (!bid) throw ApiError.notfound("Bid not found");
  return bid;
};

export { createBid, getAllBids, getBidById, updateBidStatus };
