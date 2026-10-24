import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { EVALUATION_STATUS_VALUES } from "../../../common/constants/statuses.js";

const allowedReviewStatuses = EVALUATION_STATUS_VALUES.filter(
  (s) => s !== "pending" && s !== "tamper_alert"
);

export default class ReviewEvaluationDto extends BaseDto {
  static schema = Joi.object({
    status: Joi.string()
      .valid(...allowedReviewStatuses)
      .required()
      .messages({
        "any.only": `Status must be one of: ${allowedReviewStatuses.join(", ")}`,
        "any.required": "Review status is required",
      }),
    reason: Joi.string()
      .trim()
      .min(3)
      .max(1000)
      .required()
      .messages({
        "string.empty": "Reason is required for officer review override",
        "string.min": "Reason must be at least 3 characters",
        "any.required": "Reason is required for officer review override",
      }),
  });
}
