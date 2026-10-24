import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { PDFDocument } from "pdf-lib";
import ApiError from "../../common/utils/api-error.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg"]);

/**
 * Validates a file on disk using magic bytes (not just headers)
 * and determines its page count.
 *
 * @param {string} filePath - Absolute path to uploaded file on disk
 * @returns {Promise<{ mimetype: string, ext: string, pageCount: number }>}
 */
export const validateUploadedFile = async (filePath) => {
  // Read real MIME type and extension from magic bytes
  const detected = await fileTypeFromFile(filePath);

  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime) || !ALLOWED_EXTENSIONS.has(detected.ext)) {
    throw ApiError.badRequest(
      "Invalid file type. Only PDF, PNG, and JPG documents are accepted."
    );
  }

  let pageCount = 1;

  if (detected.mime === "application/pdf") {
    try {
      const buffer = await fs.promises.readFile(filePath);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();
    } catch {
      throw ApiError.badRequest(
        "Corrupted or password-protected PDF document could not be read."
      );
    }
  }

  return {
    mimetype: detected.mime,
    ext: detected.ext,
    pageCount,
  };
};

export default validateUploadedFile;
