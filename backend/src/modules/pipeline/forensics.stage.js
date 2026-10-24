import fs from "fs";
import path from "path";
import crypto from "crypto";
import Document from "../documents/document.model.js";
import ForensicAlert from "../forensics/forensic-alert.model.js";
import storageService from "../storage/storage.service.js";
import * as aiClient from "../integrations/ai.client.js";
import { FORENSIC_ALERT_STATUSES } from "../../common/constants/statuses.js";
import { logger } from "../../common/config/logger.js";

/**
 * Pipeline Stage 5: Run forensics and image forgery detection on submitted documents.
 * Idempotent: Removes existing forensic alerts for this bid before inserting fresh alerts.
 *
 * @param {Object} context - { job, bid, tender }
 * @returns {Promise<{ alertCount: number }>}
 */
export async function runForensicsStage(context) {
  const { bid } = context;

  const documents = await Document.find({ bid: bid._id });
  let totalAlertsCreated = 0;
  const tempDir = storageService.getTempDir();

  for (const doc of documents) {
    try {
      const fileBuffer = await storageService.read(doc.storageKey);
      const forensicsResult = await aiClient.runForensics(fileBuffer, doc.originalName, doc.mimetype);
      const alerts = forensicsResult.alerts || [];

      // Clear previous alerts for this document to ensure idempotency on retries
      await ForensicAlert.deleteMany({ bid: bid._id, document: doc._id });

      for (const alert of alerts) {
        let elaImageKey = null;

        if (alert.elaImageBase64) {
          const base64Data = alert.elaImageBase64.replace(/^data:image\/\w+;base64,/, "");
          const imgBuffer = Buffer.from(base64Data, "base64");
          const tempFilename = `temp-ela-${crypto.randomUUID()}.png`;
          const tempPath = path.join(tempDir, tempFilename);

          await fs.promises.writeFile(tempPath, imgBuffer);

          const saved = await storageService.save(tempPath, {
            subfolder: `bids/${bid._id}/forensics`,
            ext: "png",
          });
          elaImageKey = saved.storageKey;
        }

        await ForensicAlert.create({
          bid: bid._id,
          document: doc._id,
          page: alert.page || 1,
          type: alert.type || "metadata",
          severity: alert.severity || "major",
          documentValue: alert.documentValue || null,
          registryValue: alert.registryValue || null,
          registrySource: alert.registrySource || "mock",
          metadata: alert.metadata || {},
          elaImageKey,
          note: alert.note || "Forensic anomaly detected",
          status: FORENSIC_ALERT_STATUSES.OPEN,
        });

        totalAlertsCreated++;
      }
    } catch (err) {
      logger.error({ err: err.message, docId: doc._id }, "Failed forensics check for document");
      // Continue with other documents if one forensics check fails
    }
  }

  logger.info({ bidId: bid._id, totalAlertsCreated }, "Forensics stage completed");
  return { alertCount: totalAlertsCreated };
}

export default { run: runForensicsStage };
