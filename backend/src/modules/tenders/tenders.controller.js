import apiResponse from "../../common/utils/api-response.js";
import * as tenderService from "./tenders.service.js";
import * as bidsService from "../bids/bids.service.js";

export const create = async (req, res) => {
  const tender = await tenderService.createTender(req.body, req.user.id);
  apiResponse.created(res, "Tender created successfully", tender);
};

export const getAll = async (req, res) => {
  const result = await tenderService.getTenders(req.query);
  apiResponse.ok(res, "Tenders fetched successfully", result);
};

export const getById = async (req, res) => {
  const tender = await tenderService.getTenderById(req.params.id);
  apiResponse.ok(res, "Tender details fetched successfully", tender);
};

export const update = async (req, res) => {
  const tender = await tenderService.updateTender(req.params.id, req.body, req.user);
  apiResponse.ok(res, "Tender updated successfully", tender);
};

export const addClauses = async (req, res) => {
  const clauses = await tenderService.addClauses(req.params.id, req.body.clauses);
  apiResponse.created(res, "Clauses added successfully", clauses);
};

export const getClauses = async (req, res) => {
  const clauses = await tenderService.getClauses(req.params.id);
  apiResponse.ok(res, "Clauses fetched successfully", clauses);
};

export const createBidder = async (req, res) => {
  const bid = await bidsService.createBidder(req.params.id, req.body, req.user.id);
  apiResponse.created(res, "Bidder record created successfully", bid);
};

export const getBidsByTender = async (req, res) => {
  const bids = await bidsService.getBidsByTender(req.params.id);
  apiResponse.ok(res, "Tender bidders fetched successfully", bids);
};
