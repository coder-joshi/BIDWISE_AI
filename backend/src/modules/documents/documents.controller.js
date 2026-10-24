import apiResponse from "../../common/utils/api-response.js";
import * as documentsService from "./documents.service.js";

export const uploadBidDocuments = async (req, res) => {
  const docs = await documentsService.uploadBidDocuments(
    req.params.bidId,
    req.files,
    req.body.type,
    req.user.id
  );
  apiResponse.created(res, "Documents uploaded successfully", docs);
};

export const uploadTenderDocument = async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  const doc = await documentsService.uploadTenderDocument(
    req.params.tenderId,
    file,
    req.user.id
  );
  apiResponse.created(res, "Tender document uploaded successfully", doc);
};

export const getBidDocuments = async (req, res) => {
  const docs = await documentsService.getBidDocuments(req.params.bidId);
  apiResponse.ok(res, "Bid documents fetched successfully", docs);
};

export const deleteDocument = async (req, res) => {
  const result = await documentsService.deleteDocument(req.params.id, req.user.id);
  apiResponse.ok(res, "Document deleted successfully", result);
};
