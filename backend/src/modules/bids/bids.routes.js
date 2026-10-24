import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../common/constants/statuses.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import { uploadDocumentsMiddleware } from "../../common/middleware/upload.middleware.js";
import UpdateBidStatusDto from "./dto/update-bid-status.dto.js";
import * as controller from "./bids.controller.js";
import * as documentsController from "../documents/documents.controller.js";
import * as jobController from "../jobs/job.controller.js";

const router = Router();

// All bid routes require authentication and authorization (admin or procurement_officer)
router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER));

// Job Queue & Pipeline endpoints
router.post("/:id/process", jobController.processBid);
router.get("/:id/status", jobController.getBidStatus);

// Legacy upload endpoint
router.post("/upload", uploadDocumentsMiddleware("documents", 10), controller.upload);

// Document upload & retrieval endpoints for a bid
router.post(
  "/:bidId/documents",
  uploadDocumentsMiddleware("documents", 10),
  documentsController.uploadBidDocuments
);
router.get("/:bidId/documents", documentsController.getBidDocuments);

// Bid CRUD
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.patch("/:id/status", validateDto(UpdateBidStatusDto), controller.updateStatus);

export default router;
