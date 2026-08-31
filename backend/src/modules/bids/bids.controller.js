import apiResponse from "../../common/utils/api-response.js";
import * as bidsService from "./bids.service.js";

const upload = async (req, res) => {
  const { tenderId, bidderName, gstNumber, panNumber, udyamNumber } = req.body;
  const bid = await bidsService.createBid({
    tenderId,
    bidderName,
    gstNumber,
    panNumber,
    udyamNumber,
    uploadedBy: req.user.id,
    files: req.files || [],
  });
  apiResponse.created(res, "Bid uploaded successfully", bid);
};

const getAll = async (req, res) => {
  const bids = await bidsService.getAllBids(req.user.id);
  apiResponse.ok(res, "Bids fetched", bids);
};

const getById = async (req, res) => {
  const bid = await bidsService.getBidById(req.params.id);
  apiResponse.ok(res, "Bid fetched", bid);
};

const updateStatus = async (req, res) => {
  const bid = await bidsService.updateBidStatus(req.params.id, req.body.status, req.body);
  apiResponse.ok(res, "Bid status updated", bid);
};

export { upload, getAll, getById, updateStatus };
