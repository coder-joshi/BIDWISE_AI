import path from "path";
import { verifySignedFileToken } from "./file-token.service.js";
import storageService from "../storage/storage.service.js";
import ApiError from "../../common/utils/api-error.js";

const MIME_MAP = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
};

/**
 * Public file streaming endpoint for signed short-lived tokens.
 * GET /api/v1/files/:token
 */
export const streamFile = async (req, res) => {
  const { token } = req.params;

  // Verifies signature, expiry, and path traversal
  const storageKey = verifySignedFileToken(token);

  const stat = await storageService.stat(storageKey);
  if (!stat || !stat.isFile()) {
    throw ApiError.notFound("File not found on storage disk");
  }

  const ext = path.extname(storageKey).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes cache header matching token TTL
  res.setHeader("X-Content-Type-Options", "nosniff");

  const stream = storageService.getStream(storageKey);
  stream.pipe(res);
};

export default { streamFile };
