import Joi from "joi";
import BaseDto from "./base.dto.js";

export const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const createObjectIdParamDto = (paramName = "id") =>
  class ParamIdDto extends BaseDto {
    static schema = Joi.object({
      [paramName]: Joi.string()
        .regex(OBJECT_ID_REGEX)
        .message("Invalid ID: must be a valid 24-character ObjectId")
        .required(),
    });
  };

export const ObjectIdParamDto = createObjectIdParamDto("id");
export const BidIdParamDto = createObjectIdParamDto("bidId");
export const TenderIdParamDto = createObjectIdParamDto("tenderId");

export class PaginationQueryDto extends BaseDto {
  static schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().optional(),
    search: Joi.string().trim().optional(),
  });
}
