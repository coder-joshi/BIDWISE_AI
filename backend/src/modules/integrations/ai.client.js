import { logger } from "../../common/config/logger.js";

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
const AI_REQUEST_TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "120000", 10);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// 1x1 transparent PNG base64 for mocks
const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const isMockEnabled = () => {
  return process.env.MOCK_AI === "true" || process.env.NODE_ENV === "test";
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch wrapper with timeout and retry on network failure.
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`AI service responded with HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);

      const isNetworkError =
        err.name === "AbortError" ||
        err.cause?.code === "ECONNREFUSED" ||
        err.message.includes("fetch failed") ||
        err.message.includes("aborted");

      if (attempt < retries && isNetworkError) {
        logger.warn(
          { attempt: attempt + 1, retries, url, error: err.message },
          "AI service request failed, retrying..."
        );
        await wait(RETRY_DELAY_MS * Math.pow(2, attempt));
        continue;
      }

      throw new Error(`AI service unavailable at ${url}: ${err.message}`);
    }
  }
}

/**
 * Render document pages into images.
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @param {string} [mimetype]
 * @returns {Promise<{ pageCount: number, pages: Array<{ pageNumber: number, imageBase64: string, width: number, height: number }> }>}
 */
export async function renderDocument(fileBuffer, filename, mimetype = "application/pdf") {
  if (isMockEnabled()) {
    logger.debug({ filename }, "MOCK_AI: returning mock render pages");
    return {
      pageCount: 3,
      pages: [
        { pageNumber: 1, imageBase64: PLACEHOLDER_PNG_BASE64, width: 612, height: 792 },
        { pageNumber: 2, imageBase64: PLACEHOLDER_PNG_BASE64, width: 612, height: 792 },
        { pageNumber: 3, imageBase64: PLACEHOLDER_PNG_BASE64, width: 612, height: 792 },
      ],
    };
  }

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimetype });
  formData.append("file", blob, filename);

  const url = `${AI_SERVICE_URL}/render`;
  return await fetchWithRetry(url, {
    method: "POST",
    body: formData,
  });
}

/**
 * Analyze bid documents against tender clauses.
 * @param {Object} tender
 * @param {Array<Object>} clauses
 * @param {Array<Object>} documents
 * @returns {Promise<{ evaluations: Array<Object> }>}
 */
export async function analyzeDocuments(tender, clauses = [], documents = []) {
  if (isMockEnabled()) {
    logger.debug({ clauseCount: clauses.length }, "MOCK_AI: returning mock analysis evaluations");
    const primaryDocId = documents[0]?._id?.toString() || documents[0]?.id || "mock-doc-id";
    const tenderNumber = tender?.bidNumber || tender?.tenderId || "GEM/2026/B/1000000";

    const evaluations = clauses.map((clause) => {
      const code = clause.code || "CLAUSE";
      const category = (clause.category || "").toLowerCase();

      let extractedValue = "Compliant";
      let extractedFields = {};

      if (category === "turnover") {
        extractedValue = "₹32.5 Cr";
        extractedFields = {
          turnoverYears: [
            { year: "2023-24", amountCr: 35.0 },
            { year: "2022-23", amountCr: 30.5 },
            { year: "2021-22", amountCr: 32.0 },
          ],
        };
      } else if (category === "mii") {
        extractedValue = "Class-I (65%)";
        extractedFields = {
          localContentPercent: 65,
          miiClass: "Class I",
        };
      } else if (category === "oem_maf") {
        extractedValue = `MAF valid for ${tenderNumber}`;
        extractedFields = {
          mafTenderNumber: tenderNumber,
          mafManufacturer: "Certified OEM Corp",
        };
      } else if (category === "msme") {
        extractedValue = "NIC 26100 (Manufacturing)";
        extractedFields = {
          nicCode: "26100",
          activityType: "manufacturing",
          nicDescription: "Manufacture of electronic components",
        };
      } else if (category === "bis_iso") {
        extractedValue = "Valid until 2028-12-31";
        extractedFields = {
          certificationNumber: "ISO-9001-2024-X",
          certBody: "TUV",
          validFrom: "2024-01-01",
          validUntil: "2028-12-31",
        };
      } else {
        extractedFields = {
          generalCompliance: true,
          evidenceFound: true,
        };
      }

      return {
        clauseCode: code,
        extractedValue,
        extractedFields,
        reasoning: `Clause ${code} evaluated against bidder documentation with high fidelity.`,
        confidence: 0.95,
        evidence: [
          {
            document: primaryDocId,
            page: 1,
            bbox: { x: 0.1, y: 0.15, w: 0.8, h: 0.1 },
            snippet: `Extracted verification snippet for clause ${code}`,
          },
        ],
      };
    });

    return { evaluations };
  }

  const url = `${AI_SERVICE_URL}/analyze`;
  return await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tender, clauses, documents }),
  });
}

/**
 * Run forensics analysis on a document.
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @param {string} [mimetype]
 * @returns {Promise<{ alerts: Array<Object> }>}
 */
export async function runForensics(fileBuffer, filename, mimetype = "application/pdf") {
  if (isMockEnabled()) {
    logger.debug({ filename }, "MOCK_AI: returning mock forensic alerts");
    return {
      alerts: [
        {
          page: 1,
          type: "metadata",
          severity: "minor",
          documentValue: "Producer: Mock PDF Tool v2.1",
          metadata: {
            producer: "Mock PDF Tool v2.1",
            creationDate: "2026-01-01T00:00:00.000Z",
            tamperScore: 0.05,
          },
          elaImageBase64: null,
          note: "Metadata clean, no significant tampering signals detected.",
        },
      ],
    };
  }

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimetype });
  formData.append("file", blob, filename);

  const url = `${AI_SERVICE_URL}/forensics`;
  return await fetchWithRetry(url, {
    method: "POST",
    body: formData,
  });
}
