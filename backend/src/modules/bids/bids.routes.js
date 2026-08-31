import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../auth/auth.middleware.js";
import * as controller from "./bids.controller.js";

// ── Multer disk storage ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/bids");
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

router.post("/upload", authenticate, upload.array("documents", 10), controller.upload);
router.get("/",        authenticate, controller.getAll);
router.get("/:id",     authenticate, controller.getById);
router.patch("/:id/status", authenticate, controller.updateStatus);

export default router;
