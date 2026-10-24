import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { TENDER_STATUS_VALUES } from "../../../common/constants/statuses.js";

export class UpdateTenderDto extends BaseDto {
  static schema = Joi.object({
    bidNumber: Joi.string().trim().uppercase().optional(),
    organisation: Joi.string().trim().optional(),
    itemCategory: Joi.string().trim().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    estimatedValue: Joi.number().min(0).optional(),
    bidEndDate: Joi.date().iso().optional(),
    miiPolicy: Joi.object({
      classes: Joi.array().items(Joi.string().trim()).optional(),
      localContentThreshold: Joi.object({
        classI: Joi.number().min(0).max(100).optional(),
        classII: Joi.number().min(0).max(100).optional(),
      }).optional(),
    }).optional(),
    status: Joi.string().valid(...TENDER_STATUS_VALUES).optional(),
  }).min(1);
}

export default UpdateTenderDto;
