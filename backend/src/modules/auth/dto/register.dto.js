import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import { USER_ROLES, USER_ROLE_VALUES } from "../../../common/constants/statuses.js";

const SELF_REGISTER_ROLES = USER_ROLE_VALUES.filter((r) => r !== USER_ROLES.ADMIN);

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .message("Password must contain a minimum of 8 characters")
      .required(),
    role: Joi.string().valid(...SELF_REGISTER_ROLES).default(USER_ROLES.CUSTOMER),
  });
}

export default RegisterDto;