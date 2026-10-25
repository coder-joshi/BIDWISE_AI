import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class RefreshTokenDto extends BaseDto {
  static schema = Joi.object({
    refreshToken: Joi.string().trim().min(1).optional(),
  });
}

export default RefreshTokenDto;
