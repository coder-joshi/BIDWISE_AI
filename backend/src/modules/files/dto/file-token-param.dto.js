import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

export default class FileTokenParamDto extends BaseDto {
  static schema = Joi.object({
    token: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty": "Signed file token is required",
        "any.required": "Signed file token is required",
      }),
  });
}
