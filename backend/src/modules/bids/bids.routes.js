import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { USER_ROLES } from "../../common/constants/statuses.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import UpdateBidStatusDto from "./dto/update-bid-status.dto.js";
import * as controller from "./bids.controller.js";

// ── Multer disk storage ───────────────────────────────────────
const uploadDir = "./uploads/bids";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `bid-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are accepted"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ── Routes ─────────────────────────────────────────────────────
const router = Router();

// All bid routes require authentication and authorization (admin or procurement_officer)
router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER));

router.post("/upload", upload.array("documents", 10), controller.upload);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.patch("/:id/status", validateDto(UpdateBidStatusDto), controller.updateStatus);

export default router;
