import apiResponse from "../../common/utils/api-response.js";
import * as evaluationsService from "./evaluations.service.js";

export const getById = async (req, res) => {
  const data = await evaluationsService.getEvaluationById(req.params.id);
  apiResponse.ok(res, "Evaluation evidence fetched successfully", data);
};

export const review = async (req, res) => {
  const { status, reason } = req.body;
  const result = await evaluationsService.reviewEvaluation(
    req.params.id,
    status,
    reason,
    req.user
  );
  apiResponse.ok(res, "Evaluation status reviewed and overridden successfully", result);
};

export default {
  getById,
  review,
};
