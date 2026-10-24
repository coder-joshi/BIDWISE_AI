import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import {
  GST_REGEX,
  PAN_REGEX,
  UDYAM_REGEX,
} from "../../../common/dto/params.dto.js";

export class CreateBidderDto extends BaseDto {
  static schema = Joi.object({
    bidderName: Joi.string().trim().min(2).max(150).required(),
    bidderType: Joi.string().trim().optional(),
    gstNumber: Joi.string()
      .trim()
      .uppercase()
      .regex(GST_REGEX)
      .message("Invalid GST number format (expected e.g. 27AABCB1234F1Z5)")
      .optional()
      .allow(null, ""),
    panNumber: Joi.string()
      .trim()
      .uppercase()
      .regex(PAN_REGEX)
      .message("Invalid PAN number format (expected e.g. AABCB1234F)")
      .optional()
      .allow(null, ""),
    udyamNumber: Joi.string()
      .trim()
      .uppercase()
      .regex(UDYAM_REGEX)
      .message("Invalid Udyam format (expected e.g. UDYAM-MH-01-0012345)")
      .optional()
      .allow(null, ""),
  });
}

export default CreateBidderDto;
