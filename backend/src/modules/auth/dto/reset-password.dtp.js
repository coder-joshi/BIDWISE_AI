import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class ResetPasswordDto extends BaseDto {
  static schema = Joi.object({
    // The token from the URL is required
    token: Joi.string().required(),

    // Using the exact same validation and custom message you used in register.dto.js
    newPassword: Joi.string()
      .min(8)
      .message("Password must contain minimum 8 characters")
      .required(),
  });
}

export default ResetPasswordDto;
