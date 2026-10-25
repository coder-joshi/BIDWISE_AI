import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import { resolveSafePath } from "../storage/storage.service.js";

const DEFAULT_SECRET = "bidwise_secure_file_url_secret_key_2026";
const SIGNED_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getSecret() {
  if (process.env.NODE_ENV === "production" && !process.env.FILE_URL_SECRET) {
    throw new Error("FATAL: FILE_URL_SECRET environment variable must be set in production");
  }
  return process.env.FILE_URL_SECRET || DEFAULT_SECRET;
}

/**
 * Generate a short-lived HMAC-signed token for file streaming.
 * Token encodes: storageKey, expiry timestamp.
 *
 * @param {string} storageKey - Relative managed storage key
 * @param {number} [ttlMs=300000] - Expiry in milliseconds (default 5 min)
 * @returns {{ url: string, expiresAt: string, token: string }}
 */
export function generateSignedFileUrl(storageKey, ttlMs = SIGNED_URL_TTL_MS) {
  if (!storageKey || typeof storageKey !== "string") {
    throw ApiError.badRequest("Invalid storage key for signed URL generation");
  }

  // Ensure storageKey does not contain directory traversal before signing
  resolveSafePath(storageKey);

  const expiresAt = new Date(Date.now() + ttlMs);
  const payload = {
    key: storageKey,
    exp: expiresAt.getTime(),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadStr)
    .digest("base64url");

  const token = `${payloadStr}.${signature}`;

  return {
    url: `/api/v1/files/${token}`,
    expiresAt: expiresAt.toISOString(),
    token,
  };
}

/**
 * Validate HMAC signature and expiration on a signed file token.
 * Prevents path traversal and forged tokens.
 *
 * @param {string} token
 * @returns {string} Validated storageKey
 */
export function verifySignedFileToken(token) {
  if (!token || typeof token !== "string") {
    throw ApiError.badRequest("Missing file access token");
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    throw ApiError.unauthorized("Invalid file access token format");
  }

  const [payloadStr, signature] = parts;

  // Constant-time comparison of HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadStr)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw ApiError.unauthorized("Invalid or tampered file access token signature");
  }

  let payload;
  try {
    const jsonStr = Buffer.from(payloadStr, "base64url").toString("utf-8");
    payload = JSON.parse(jsonStr);
  } catch {
    throw ApiError.badRequest("Malformed token payload");
  }

  if (!payload || !payload.key || typeof payload.key !== "string" || !payload.exp) {
    throw ApiError.badRequest("Invalid token payload parameters");
  }

  if (Date.now() > payload.exp) {
    throw ApiError.unauthorized("File access token has expired (limit 5 minutes)");
  }

  // Strict path traversal assertion
  try {
    resolveSafePath(payload.key);
  } catch {
    throw ApiError.forbidden("Path traversal detected in file key");
  }

  return payload.key;
}

export default {
  generateSignedFileUrl,
  verifySignedFileToken,
};
