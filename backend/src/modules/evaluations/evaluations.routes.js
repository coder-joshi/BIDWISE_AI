import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../common/constants/statuses.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import { ObjectIdParamDto } from "../../common/dto/params.dto.js";
import ReviewEvaluationDto from "./dto/review-evaluation.dto.js";
import * as controller from "./evaluations.controller.js";

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER));

router.get("/:id", validateDto(ObjectIdParamDto, "params"), controller.getById);

router.patch(
  "/:id/review",
  validateDto({
    params: ObjectIdParamDto,
    body: ReviewEvaluationDto,
  }),
  controller.review
);

export default router;
