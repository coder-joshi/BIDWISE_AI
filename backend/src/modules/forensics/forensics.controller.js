import apiResponse from "../../common/utils/api-response.js";
import * as forensicsService from "./forensics.service.js";

export const getBidAlerts = async (req, res) => {
  const result = await forensicsService.getBidForensicAlerts(
    req.params.id,
    req.query
  );
  apiResponse.ok(res, "Bid forensic alerts fetched successfully", result);
};

export const getAlertById = async (req, res) => {
  const alert = await forensicsService.getForensicAlertById(req.params.id);
  apiResponse.ok(res, "Forensic alert comparison details fetched successfully", alert);
};

export const getElaUrl = async (req, res) => {
  const result = await forensicsService.getAlertElaUrl(req.params.id);
  apiResponse.ok(res, "ELA image signed URL generated successfully", result);
};

export default {
  getBidAlerts,
  getAlertById,
  getElaUrl,
};
