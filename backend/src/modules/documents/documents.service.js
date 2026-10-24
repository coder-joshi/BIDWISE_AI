import fs from "fs";
import Document from "./document.model.js";
import Bid from "../bids/bids.model.js";
import Tender from "../tenders/tender.model.js";
import AuditLog from "../audit/audit-log.model.js";
import storageService, {
  sanitizeFilename,
  computeFileSha256,
} from "../storage/storage.service.js";
import validateUploadedFile from "./document-validator.js";
import ApiError from "../../common/utils/api-error.js";
import { DOCUMENT_TYPE_VALUES } from "../../common/constants/statuses.js";

/**
 * Upload one or more documents for a bid.
 * Enforces magic bytes validation, sha256 deduplication per bid,
 * and zero disk leaks on validation or database failure.
 */
export const uploadBidDocuments = async (bidId, files, types = [], userId) => {
  if (!files || files.length === 0) {
    throw ApiError.badRequest("No files uploaded");
  }

  const bid = await Bid.findById(bidId);
  if (!bid) {
    // Clean up all uploaded temp files if bid doesn't exist
    await Promise.all(
      files.map((f) => (fs.existsSync(f.path) ? fs.promises.unlink(f.path) : null))
    );
    throw ApiError.notFound("Bid not found");
  }

  const createdDocs = [];
  const savedKeys = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let savedStorageKey = null;

    try {
      // 1. Validate real file type and page count via magic bytes
      const { mimetype, ext, pageCount } = await validateUploadedFile(file.path);

      // 2. Compute SHA-256 digest
      const sha256 = await computeFileSha256(file.path);

      // 3. Reject duplicate within the same bid with 409 Conflict
      const existing = await Document.findOne({ bid: bid._id, sha256 });
      if (existing) {
        throw ApiError.conflict(
          `Duplicate document detected: "${file.originalname}" has already been uploaded for this bid.`
        );
      }

      // 4. Move from temp to permanent managed storage
      const saveResult = await storageService.save(file.path, {
        subfolder: `bids/${bid._id}`,
        ext,
      });
      savedStorageKey = saveResult.storageKey;
      savedKeys.push(savedStorageKey);

      // Determine document type
      const requestedType = Array.isArray(types) ? types[i] : types;
      const validDocType =
        requestedType && DOCUMENT_TYPE_VALUES.includes(requestedType)
          ? requestedType
          : "other";

      // 5. Create database record (processingStatus stays "uploaded")
      const doc = await Document.create({
        ownerKind: "bid",
        tender: bid.tender,
        bid: bid._id,
        type: validDocType,
        originalName: sanitizeFilename(file.originalname),
        storageKey: savedStorageKey,
        mimetype,
        sizeBytes: saveResult.sizeBytes,
        sha256,
        pageCount,
        processingStatus: "uploaded",
        uploadedBy: userId,
      });

      createdDocs.push(doc);
    } catch (err) {
      // Immediate atomic cleanup: remove current temp file
      if (file.path && fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
      // If file was already saved to permanent storage, clean it up
      if (savedStorageKey) {
        await storageService.remove(savedStorageKey);
      }
      // Clean up remaining un-processed temp files in this batch
      for (let j = i + 1; j < files.length; j++) {
        if (files[j]?.path && fs.existsSync(files[j].path)) {
          await fs.promises.unlink(files[j].path).catch(() => {});
        }
      }
      // Clean up all already created files from storage and DB in this failed batch
      for (const key of savedKeys) {
        await storageService.remove(key);
      }
      if (createdDocs.length > 0) {
        await Document.deleteMany({
          _id: { $in: createdDocs.map((d) => d._id) },
        });
      }

      throw err;
    }
  }

  // Record audit log
  await AuditLog.create({
    actor: userId,
    action: "BID_DOCUMENTS_UPLOAD",
    entity: "Bid",
    entityId: bid._id,
    meta: {
      count: createdDocs.length,
      docIds: createdDocs.map((d) => d._id),
    },
  });

  return createdDocs;
};

/**
 * Upload the official specification document for a tender.
 */
export const uploadTenderDocument = async (tenderId, file, userId) => {
  if (!file) {
    throw ApiError.badRequest("No tender document uploaded");
  }

  const tender = await Tender.findById(tenderId);
  if (!tender) {
    if (fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path);
    }
    throw ApiError.notFound("Tender not found");
  }

  let savedStorageKey = null;

  try {
    const { mimetype, ext, pageCount } = await validateUploadedFile(file.path);
    const sha256 = await computeFileSha256(file.path);

    const saveResult = await storageService.save(file.path, {
      subfolder: `tenders/${tender._id}`,
      ext,
    });
    savedStorageKey = saveResult.storageKey;

    const doc = await Document.create({
      ownerKind: "tender",
      tender: tender._id,
      bid: null,
      type: "tender_doc",
      originalName: sanitizeFilename(file.originalname),
      storageKey: savedStorageKey,
      mimetype,
      sizeBytes: saveResult.sizeBytes,
      sha256,
      pageCount,
      processingStatus: "uploaded",
      uploadedBy: userId,
    });

    await AuditLog.create({
      actor: userId,
      action: "TENDER_DOCUMENT_UPLOAD",
      entity: "Tender",
      entityId: tender._id,
      meta: {
        documentId: doc._id,
        originalName: doc.originalName,
      },
    });

    return doc;
  } catch (err) {
    if (file.path && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(() => {});
    }
    if (savedStorageKey) {
      await storageService.remove(savedStorageKey);
    }
    throw err;
  }
};

/**
 * List all documents associated with a bid.
 */
export const getBidDocuments = async (bidId) => {
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw ApiError.notFound("Bid not found");
  }

  return Document.find({ bid: bidId }).sort({ createdAt: 1 });
};

/**
 * Delete a document from storage and database.
 * Rejects if the parent bid is currently being processed.
 */
export const deleteDocument = async (documentId, userId) => {
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw ApiError.notFound("Document not found");
  }

  if (doc.bid) {
    const bid = await Bid.findById(doc.bid);
    if (bid && bid.status === "processing") {
      throw ApiError.badRequest(
        "Cannot delete document while bid is currently being processed."
      );
    }
  }

  // Remove physical file from disk
  await storageService.remove(doc.storageKey);

  // Delete DB record
  await Document.findByIdAndDelete(documentId);

  await AuditLog.create({
    actor: userId,
    action: "DOCUMENT_DELETE",
    entity: "Document",
    entityId: doc._id,
    meta: {
      originalName: doc.originalName,
      storageKey: doc.storageKey,
      bidId: doc.bid,
      tenderId: doc.tender,
    },
  });

  return { deleted: true, id: documentId };
};
