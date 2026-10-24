import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";
import {
  CLAUSE_TYPE_VALUES,
  CLAUSE_CATEGORY_VALUES,
  SEVERITY_LEVEL_VALUES,
} from "../../../common/constants/statuses.js";

const singleClauseSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  title: Joi.string().trim().required(),
  type: Joi.string().valid(...CLAUSE_TYPE_VALUES).required(),
  category: Joi.string().valid(...CLAUSE_CATEGORY_VALUES).required(),
  requirement: Joi.string().trim().required(),
  ruleConfig: Joi.object().unknown().default({}),
  severity: Joi.string().valid(...SEVERITY_LEVEL_VALUES).default("major"),
  isMandatory: Joi.boolean().default(true),
  featured: Joi.boolean().default(false),
  order: Joi.number().integer().default(0),
});

export class CreateClausesDto extends BaseDto {
  static schema = Joi.object({
    clauses: Joi.array().items(singleClauseSchema).min(1).required(),
  });
}

export default CreateClausesDto;
