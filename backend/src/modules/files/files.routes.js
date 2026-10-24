import { Router } from "express";
import validateDto from "../../common/middleware/validate.middleware.js";
import FileTokenParamDto from "./dto/file-token-param.dto.js";
import * as controller from "./files.controller.js";

const router = Router();

// Public streaming route for signed tokens (no bearer auth header required)
router.get("/:token", validateDto(FileTokenParamDto, "params"), controller.streamFile);

export default router;
