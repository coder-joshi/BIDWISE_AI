import BaseDto from "../../../common/dto/base.dto.js";
import ApiError from "../../../common/utils/api-error.js";
import Joi from "joi";

class LoginDto extends BaseDto {
  static schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  });
}

export default LoginDto;
