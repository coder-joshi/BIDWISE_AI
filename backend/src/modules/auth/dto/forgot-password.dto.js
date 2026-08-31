import BaseDto from "../../../common/dto/base.dto.js";
import Joi from "joi";

class ForgotPasswordDto extends BaseDto {
  static schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
  });
}

export default ForgotPasswordDto;
