import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class ResetPasswordDto extends BaseDto {
  static schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .message("Password must contain minimum 8 characters")
      .required(),
  });
}

export default ResetPasswordDto;
