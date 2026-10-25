import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { TEC_NOTE_STATUS_VALUES } from "../../../common/constants/statuses.js";

export default class UpdateTecNoteDto extends BaseDto {
  static schema = Joi.object({
    content: Joi.string()
      .trim()
      .min(1)
      .max(20000)
      .required()
      .messages({
        "string.empty": "TEC note content cannot be empty",
        "any.required": "TEC note content is required",
      }),
    status: Joi.string()
      .valid(...TEC_NOTE_STATUS_VALUES)
      .optional()
      .messages({
        "any.only": `Status must be one of: ${TEC_NOTE_STATUS_VALUES.join(", ")}`,
      }),
  });
}
