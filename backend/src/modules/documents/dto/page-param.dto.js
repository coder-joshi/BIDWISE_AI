import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { OBJECT_ID_REGEX } from "../../../common/dto/params.dto.js";

export default class PageParamDto extends BaseDto {
  static schema = Joi.object({
    id: Joi.string()
      .regex(OBJECT_ID_REGEX)
      .message("Invalid document ID: must be a valid 24-character ObjectId")
      .required(),
    n: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        "number.base": "Page number must be an integer",
        "number.min": "Page number must be at least 1",
        "any.required": "Page number is required",
      }),
  });
}
