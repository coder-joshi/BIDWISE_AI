import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import { uploadDocumentsMiddleware } from "../../common/middleware/upload.middleware.js";
import {
  ObjectIdParamDto,
  PaginationQueryDto,
} from "../../common/dto/params.dto.js";
import CreateTenderDto from "./dto/create-tender.dto.js";
import UpdateTenderDto from "./dto/update-tender.dto.js";
import CreateClausesDto from "./dto/create-clauses.dto.js";
import CreateBidderDto from "../bids/dto/create-bidder.dto.js";
import * as controller from "./tenders.controller.js";
import * as documentsController from "../documents/documents.controller.js";

const router = Router();

// All tender routes require authentication and authorization (admin or procurement_officer)
router.use(authenticate, authorize("admin", "procurement_officer"));

router.post("/", validateDto(CreateTenderDto), controller.create);
router.get("/", validateDto(PaginationQueryDto, "query"), controller.getAll);
router.get("/:id", validateDto(ObjectIdParamDto, "params"), controller.getById);
router.patch(
  "/:id",
  validateDto({ params: ObjectIdParamDto, body: UpdateTenderDto }),
  controller.update
);

// Tender document upload
router.post(
  "/:tenderId/documents",
  uploadDocumentsMiddleware("documents", 10),
  documentsController.uploadTenderDocument
);

router.post(
  "/:id/clauses",
  validateDto({ params: ObjectIdParamDto, body: CreateClausesDto }),
  controller.addClauses
);
router.get(
  "/:id/clauses",
  validateDto(ObjectIdParamDto, "params"),
  controller.getClauses
);

router.post(
  "/:id/bids",
  validateDto({ params: ObjectIdParamDto, body: CreateBidderDto }),
  controller.createBidder
);
router.get(
  "/:id/bids",
  validateDto(ObjectIdParamDto, "params"),
  controller.getBidsByTender
);

export default router;
