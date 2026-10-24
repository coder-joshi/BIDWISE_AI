import multer from "multer";
import crypto from "crypto";
import path from "path";
import storageService from "../../modules/storage/storage.service.js";
import ApiError from "../utils/api-error.js";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const tempDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageService.getTempDir());
  },
  filename: (req, file, cb) => {
    // Never write original filename to disk; use random UUID
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `tmp-${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        "Invalid file format: only PDF, PNG, and JPG files are accepted."
      )
    );
  }
};

const multerInstance = multer({
  storage: tempDiskStorage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 10,                  // max 10 files per request
  },
});

/**
 * Middleware handling multipart uploads and mapping Multer errors.
 */
export const uploadDocumentsMiddleware = (fieldName = "documents", maxCount = 10) => {
  const uploadHandler =
    maxCount === 1
      ? multerInstance.single(fieldName)
      : multerInstance.array(fieldName, maxCount);

  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(413, "File size exceeds the 25MB limit."));
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return next(new ApiError(400, "Maximum of 10 files can be uploaded at once."));
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return next(
              new ApiError(
                400,
                `Unexpected field "${err.field}". Files must be uploaded under field "${fieldName}".`
              )
            );
          }
          return next(new ApiError(400, err.message));
        }
        return next(err);
      }
      next();
    });
  };
};

export default uploadDocumentsMiddleware;
