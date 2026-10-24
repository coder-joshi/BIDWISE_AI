import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import { ObjectIdParamDto } from "../../common/dto/params.dto.js";
import PageParamDto from "./dto/page-param.dto.js";
import * as controller from "./documents.controller.js";

const router = Router();

router.use(authenticate, authorize("admin", "procurement_officer"));

router.delete("/:id", validateDto(ObjectIdParamDto, "params"), controller.deleteDocument);
router.get("/:id/pages/:n/url", validateDto(PageParamDto, "params"), controller.getPageUrl);

export default router;
