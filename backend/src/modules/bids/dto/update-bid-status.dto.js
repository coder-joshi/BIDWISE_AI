import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import {
  BID_STATUS_VALUES,
  BID_OVERALL_STATUS_VALUES,
} from "../../../common/constants/statuses.js";

export class UpdateBidStatusDto extends BaseDto {
  static schema = Joi.object({
    status: Joi.string()
      .valid(...BID_STATUS_VALUES)
      .optional(),
    overallStatus: Joi.string()
      .valid(...BID_OVERALL_STATUS_VALUES)
      .optional(),
    riskScore: Joi.number().min(0).max(100).optional(),
    complianceScore: Joi.number().min(0).max(100).optional(),
    fraudSignals: Joi.number().min(0).optional(),
    aiReport: Joi.object().unknown().optional(),
  }).min(1);
}

export default UpdateBidStatusDto;
