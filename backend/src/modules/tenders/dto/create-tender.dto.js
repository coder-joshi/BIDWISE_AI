import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { TENDER_STATUS_VALUES } from "../../../common/constants/statuses.js";

export class CreateTenderDto extends BaseDto {
  static schema = Joi.object({
    bidNumber: Joi.string().trim().uppercase().required(),
    organisation: Joi.string().trim().required(),
    itemCategory: Joi.string().trim().required(),
    quantity: Joi.number().integer().min(1).required(),
    estimatedValue: Joi.number().min(0).required(),
    bidEndDate: Joi.date().iso().required(),
    miiPolicy: Joi.object({
      classes: Joi.array().items(Joi.string().trim()).default([]),
      localContentThreshold: Joi.object({
        classI: Joi.number().min(0).max(100).default(50),
        classII: Joi.number().min(0).max(100).default(20),
      }).default(),
    }).optional(),
    status: Joi.string().valid(...TENDER_STATUS_VALUES).optional(),
  });
}

export default CreateTenderDto;
