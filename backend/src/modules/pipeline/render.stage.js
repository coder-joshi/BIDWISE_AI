import fs from "fs";
import path from "path";
import crypto from "crypto";
import Document from "../documents/document.model.js";
import storageService from "../storage/storage.service.js";
import * as aiClient from "../integrations/ai.client.js";
import { DOCUMENT_PROCESSING_STATUSES } from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pipeline Stage 1: Render document pages into images.
 * Idempotent: Can re-render documents or overwrite page records safely.
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<{ renderedCount: number, totalPages: number }>}
 */
export async function runRenderStage(context) {
  const { bid } = context;

  const documents = await Document.find({ bid: bid._id });
  if (!documents || documents.length === 0) {
    throw new Error(`Cannot render documents: Bid ${bid._id} has no uploaded documents.`);
  }

  let totalPages = 0;
  const tempDir = storageService.getTempDir();

  for (const doc of documents) {
    logger.info({ bidId: bid._id, docId: doc._id, filename: doc.originalName }, "Rendering document");

    const fileBuffer = await storageService.read(doc.storageKey);
    const renderResult = await aiClient.renderDocument(fileBuffer, doc.originalName, doc.mimetype);

    const pages = [];
    const returnedPages = renderResult.pages || [];

    for (const page of returnedPages) {
      let imageKey = null;

      if (page.imageBase64) {
        // Decode base64 to image buffer and save into managed storage
        const base64Data = page.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, "base64");
        const tempFilename = `temp-render-${crypto.randomUUID()}.png`;
        const tempPath = path.join(tempDir, tempFilename);

        await fs.promises.writeFile(tempPath, imgBuffer);

        const saved = await storageService.save(tempPath, {
          subfolder: `bids/${bid._id}/pages`,
          ext: "png",
        });
        imageKey = saved.storageKey;
      } else {
        imageKey = `bids/${bid._id}/pages/placeholder-p${page.pageNumber || 1}.png`;
      }

      pages.push({
        n: page.pageNumber || pages.length + 1,
        imageKey,
        width: page.width || 612,
        height: page.height || 792,
      });
    }

    doc.pages = pages;
    doc.pageCount = renderResult.pageCount || pages.length || doc.pageCount;
    doc.processingStatus = DOCUMENT_PROCESSING_STATUSES.RENDERED;
    await doc.save();

    totalPages += pages.length;
  }

  return { renderedCount: documents.length, totalPages };
}

export default { run: runRenderStage };
