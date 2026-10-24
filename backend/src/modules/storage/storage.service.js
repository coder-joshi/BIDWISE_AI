import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

/**
 * Ensures required storage directories exist on startup.
 */
export const initStorage = () => {
  const dirs = [
    UPLOAD_ROOT,
    path.join(UPLOAD_ROOT, "temp"),
    path.join(UPLOAD_ROOT, "tenders"),
    path.join(UPLOAD_ROOT, "bids"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

/**
 * Safely resolves a relative storage key against UPLOAD_ROOT,
 * preventing directory traversal attacks.
 */
export const resolveSafePath = (storageKey) => {
  if (!storageKey || typeof storageKey !== "string") {
    throw new Error("Invalid storage key");
  }

  const safePath = path.resolve(UPLOAD_ROOT, storageKey);

  // Assert path stays within upload root
  if (!safePath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Path traversal detected");
  }

  return safePath;
};

/**
 * Sanitizes original filenames for safe storage in metadata.
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return "unnamed_file";
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
};

/**
 * Computes SHA-256 hash of a file on disk.
 */
export const computeFileSha256 = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
};

/**
 * Storage Service Interface Implementation for Local Disk
 */
class LocalDiskStorageService {
  constructor() {
    initStorage();
  }

  getUploadRoot() {
    return UPLOAD_ROOT;
  }

  getTempDir() {
    return path.join(UPLOAD_ROOT, "temp");
  }

  /**
   * Persists a temporary file into a permanent managed storage path.
   *
   * @param {string} tempFilePath - Current absolute path of temporary file
   * @param {Object} options - { subfolder: "bids/..." | "tenders/...", originalName: string, ext: string }
   * @returns {Promise<{ storageKey: string, sizeBytes: number, sha256: string }>}
   */
  async save(tempFilePath, { subfolder = "", ext = "" } = {}) {
    const safeExt = ext.startsWith(".") ? ext : ext ? `.${ext}` : "";
    const randomName = `${crypto.randomUUID()}${safeExt}`;
    const relativeKey = path.posix.join(subfolder.replace(/\\/g, "/"), randomName);
    const targetPath = resolveSafePath(relativeKey);

    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Move or copy file to destination
    await fs.promises.rename(tempFilePath, targetPath);

    const stats = await fs.promises.stat(targetPath);
    const sha256 = await computeFileSha256(targetPath);

    return {
      storageKey: relativeKey,
      sizeBytes: stats.size,
      sha256,
    };
  }

  /**
   * Reads raw buffer of stored file.
   */
  async read(storageKey) {
    const filePath = resolveSafePath(storageKey);
    return fs.promises.readFile(filePath);
  }

  /**
   * Returns stats of stored file, or null if not found.
   */
  async stat(storageKey) {
    try {
      const filePath = resolveSafePath(storageKey);
      return await fs.promises.stat(filePath);
    } catch {
      return null;
    }
  }

  /**
   * Removes a file from storage.
   */
  async remove(storageKey) {
    try {
      const filePath = resolveSafePath(storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      // Best-effort cleanup
      console.error(`Failed to remove file at storage key: ${storageKey}`, err);
    }
  }

  /**
   * Returns a readable stream for the file.
   */
  getStream(storageKey) {
    const filePath = resolveSafePath(storageKey);
    return fs.createReadStream(filePath);
  }
}

export const storageService = new LocalDiskStorageService();
export default storageService;
