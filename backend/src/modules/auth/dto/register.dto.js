import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { USER_ROLES, USER_ROLE_VALUES } from "../../../common/constants/statuses.js";

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
      .min(8)
      .message("Password must contain a minimum of 8 characters")
      .required(),
    role: Joi.string().valid(...USER_ROLE_VALUES).default(USER_ROLES.CUSTOMER),
  });
}

export default RegisterDto;