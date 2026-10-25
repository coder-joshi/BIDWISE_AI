import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../common/constants/statuses.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import {
  ObjectIdParamDto,
  BidIdParamDto,
  PaginationQueryDto,
} from "../../common/dto/params.dto.js";
import { uploadDocumentsMiddleware } from "../../common/middleware/upload.middleware.js";
import UpdateBidStatusDto from "./dto/update-bid-status.dto.js";
import UploadBidDto from "./dto/upload-bid.dto.js";
import * as controller from "./bids.controller.js";
import * as documentsController from "../documents/documents.controller.js";
import * as jobController from "../jobs/job.controller.js";
import * as forensicsController from "../forensics/forensics.controller.js";
import * as tecController from "../tec/tec.controller.js";
import UpdateTecNoteDto from "../tec/dto/update-tec-note.dto.js";

const router = Router();

// All bid routes require authentication and authorization (admin or procurement_officer)
router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER));

// Job Queue & Pipeline endpoints
router.post("/:id/process", validateDto(ObjectIdParamDto, "params"), jobController.processBid);
router.get("/:id/status", validateDto(ObjectIdParamDto, "params"), jobController.getBidStatus);
router.get(
  "/:id/forensics",
  validateDto({ params: ObjectIdParamDto, query: PaginationQueryDto }),
  forensicsController.getBidAlerts
);

// TEC rejection note endpoints
router.post("/:id/tec-note", validateDto(ObjectIdParamDto, "params"), tecController.generateDraft);
router.patch(
  "/:id/tec-note",
  validateDto({ params: ObjectIdParamDto, body: UpdateTecNoteDto }),
  tecController.updateNote
);
router.get("/:id/tec-note", validateDto(ObjectIdParamDto, "params"), tecController.getNote);
router.get("/:id/tec-note/export", validateDto(ObjectIdParamDto, "params"), tecController.exportPdf);

// Legacy upload endpoint (deprecated: routes uploaded files through documentsService.uploadBidDocuments)
router.post(
  "/upload",
  uploadDocumentsMiddleware("documents", 10),
  validateDto(UploadBidDto, "body"),
  controller.upload
);

// Document upload & retrieval endpoints for a bid
router.post(
  "/:bidId/documents",
  validateDto(BidIdParamDto, "params"),
  uploadDocumentsMiddleware("documents", 10),
  documentsController.uploadBidDocuments
);
router.get("/:bidId/documents", validateDto(BidIdParamDto, "params"), documentsController.getBidDocuments);

// Bid CRUD
router.get("/", validateDto(PaginationQueryDto, "query"), controller.getAll);
router.get("/:id", validateDto(ObjectIdParamDto, "params"), controller.getById);
router.patch(
  "/:id/status",
  validateDto({ params: ObjectIdParamDto, body: UpdateBidStatusDto }),
  controller.updateStatus
);

export default router;
