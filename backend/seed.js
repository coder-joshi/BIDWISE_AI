import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env") });
import connectDB from "./src/common/config/db.js";
import User from "./src/modules/auth/auth.model.js";
import Tender from "./src/modules/tenders/tender.model.js";
import Clause from "./src/modules/clauses/clause.model.js";
import Bid from "./src/modules/bids/bids.model.js";
import Document from "./src/modules/documents/document.model.js";
import ClauseEvaluation from "./src/modules/evaluations/evaluation.model.js";
import ForensicAlert from "./src/modules/forensics/forensic-alert.model.js";
import TecNote from "./src/modules/tec/tec-note.model.js";
import storageService, { initStorage, resolveSafePath } from "./src/modules/storage/storage.service.js";
import { logger } from "./src/common/config/logger.js";

// Deterministic ObjectIds for repeatable curl acceptance & denial testing
export const SEED_IDS = {
  ADMIN_USER: "660c1d2e4f8b9a001f3e7a00",
  OFFICER_USER: "660c1d2e4f8b9a001f3e7a02",
  BIDDER_USER: "660c1d2e4f8b9a001f3e7a03",
  TENDER: "660c1d2e4f8b9a001f3e7a01",
  CLAUSE_ATC01: "660c1d2e4f8b9a001f3e7b01",
  CLAUSE_ATC02: "660c1d2e4f8b9a001f3e7b02",
  CLAUSE_ATC03: "660c1d2e4f8b9a001f3e7b03",
  CLAUSE_ATC04: "660c1d2e4f8b9a001f3e7b04",
  CLAUSE_ATC05: "660c1d2e4f8b9a001f3e7b05",
  BID_ASTRANET: "660c1d2e4f8b9a001f3e7a11",
  BID_NEXUS: "660c1d2e4f8b9a001f3e7a12",
  BID_SHIVALIK: "660c1d2e4f8b9a001f3e7a13",
  DOC_ASTRANET: "660c1d2e4f8b9a001f3e7a21",
  DOC_NEXUS: "660c1d2e4f8b9a001f3e7a22",
  DOC_SHIVALIK: "660c1d2e4f8b9a001f3e7a23",
  EVAL_NEXUS_TURNOVER: "660c1d2e4f8b9a001f3e7a31",
  ALERT_SHIVALIK_ELA: "660c1d2e4f8b9a001f3e7a41",
};

const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function ensureSampleStorageFiles() {
  initStorage();
  const pngBuffer = Buffer.from(SAMPLE_PNG_BASE64, "base64");

  const relativeKeys = [
    `bids/${SEED_IDS.BID_ASTRANET}/AstraNet_Bid_Bundle.pdf`,
    `bids/${SEED_IDS.BID_ASTRANET}/pages/page-1.png`,
    `bids/${SEED_IDS.BID_NEXUS}/Nexus_Global_Bid_Bundle.pdf`,
    `bids/${SEED_IDS.BID_NEXUS}/pages/page-1.png`,
    `bids/${SEED_IDS.BID_SHIVALIK}/Shivalik_ISO_Cert.pdf`,
    `bids/${SEED_IDS.BID_SHIVALIK}/pages/page-1.png`,
    `bids/${SEED_IDS.BID_SHIVALIK}/ela/ela-page-1.png`,
  ];

  for (const key of relativeKeys) {
    const fullPath = resolveSafePath(key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, pngBuffer);
  }
}

async function seed() {
  ensureSampleStorageFiles();

  if (process.argv.includes("--dry-run")) {
    const sampleEval = new ClauseEvaluation({
      tender: SEED_IDS.TENDER,
      bid: SEED_IDS.BID_SHIVALIK,
      clause: SEED_IDS.CLAUSE_ATC05,
      status: "tamper_alert",
      evidence: [
        {
          document: SEED_IDS.DOC_SHIVALIK,
          page: 1,
          bbox: [0.704, 0.692, 0.145, 0.015],
          snippet: "Valid Until: 31-12-2027",
        },
      ],
    });
    await sampleEval.validate();
    logger.info({ SEED_IDS }, "Seed dry-run schema validation & sample file creation succeeded");
    return;
  }

  await connectDB();

  // Clean existing seeded entities by ID / email / bidNumber
  await Promise.all([
    User.deleteMany({
      email: {
        $in: [
          "admin@bidwise.gov.in",
          "officer@bidwise.gov.in",
          "bidder@vendor.in",
        ],
      },
    }),
    Tender.deleteMany({
      $or: [{ _id: SEED_IDS.TENDER }, { bidNumber: "GEM/2026/B/5489210" }],
    }),
    Clause.deleteMany({ tender: SEED_IDS.TENDER }),
    Bid.deleteMany({ tender: SEED_IDS.TENDER }),
    Document.deleteMany({ tender: SEED_IDS.TENDER }),
    ClauseEvaluation.deleteMany({ tender: SEED_IDS.TENDER }),
    ForensicAlert.deleteMany({
      bid: { $in: [SEED_IDS.BID_ASTRANET, SEED_IDS.BID_NEXUS, SEED_IDS.BID_SHIVALIK] },
    }),
    TecNote.deleteMany({
      bid: { $in: [SEED_IDS.BID_ASTRANET, SEED_IDS.BID_NEXUS, SEED_IDS.BID_SHIVALIK] },
    }),
  ]);

  // 1. Seed Users (passwords hashed automatically via User pre-save bcrypt hook)
  const [adminUser, officerUser, bidderUser] = await User.create([
    {
      _id: SEED_IDS.ADMIN_USER,
      name: "System Administrator",
      email: "admin@bidwise.gov.in",
      password: "Password@123",
      role: "admin",
      isVerified: true,
    },
    {
      _id: SEED_IDS.OFFICER_USER,
      name: "Rajesh Sharma (TEC Officer)",
      email: "officer@bidwise.gov.in",
      password: "Password@123",
      role: "procurement_officer",
      isVerified: true,
    },
    {
      _id: SEED_IDS.BIDDER_USER,
      name: "External Vendor Representative",
      email: "bidder@vendor.in",
      password: "Password@123",
      role: "customer",
      isVerified: true,
    },
  ]);

  // 2. Seed Tender
  const tender = await Tender.create({
    _id: SEED_IDS.TENDER,
    bidNumber: "GEM/2026/B/5489210",
    organisation: "Ministry of Railways",
    itemCategory: "Telecom & Optical Networking Equipment",
    quantity: 50,
    estimatedValue: 50000000,
    bidEndDate: new Date("2026-12-31T18:00:00.000Z"),
    status: "under_evaluation",
    miiPolicy: {
      classes: ["Class I"],
      localContentThreshold: { classI: 50, classII: 20 },
    },
    createdBy: officerUser._id,
  });

  // 3. Seed 5 Clauses
  const clauses = await Clause.create([
    {
      _id: SEED_IDS.CLAUSE_ATC01,
      tender: tender._id,
      code: "ATC 01",
      title: "Minimum Average Annual Turnover",
      type: "ATC",
      category: "turnover",
      requirement: "Bidder must have minimum average annual turnover of ₹25 Cr over the last 3 financial years.",
      ruleConfig: { minAvgTurnoverCr: 25, years: 3 },
      severity: "critical",
      isMandatory: true,
      featured: true,
      order: 1,
    },
    {
      _id: SEED_IDS.CLAUSE_ATC02,
      tender: tender._id,
      code: "ATC 02",
      title: "Make-in-India Class-I Local Content",
      type: "ATC",
      category: "mii",
      requirement: "Minimum 50% local content required for Class-I Local Supplier qualification.",
      ruleConfig: { miiClass: "Class I", localContentThreshold: 50 },
      severity: "major",
      isMandatory: true,
      featured: true,
      order: 2,
    },
    {
      _id: SEED_IDS.CLAUSE_ATC03,
      tender: tender._id,
      code: "ATC 03",
      title: "OEM Manufacturer Authorization Form (MAF)",
      type: "ATC",
      category: "oem_maf",
      requirement: "Bid-specific OEM MAF referencing GEM/2026/B/5489210 is mandatory.",
      ruleConfig: { tenderNumber: "GEM/2026/B/5489210" },
      severity: "critical",
      isMandatory: true,
      featured: true,
      order: 3,
    },
    {
      _id: SEED_IDS.CLAUSE_ATC04,
      tender: tender._id,
      code: "ATC 04",
      title: "MSME Udyam Manufacturing Classification",
      type: "ATC",
      category: "msme",
      requirement: "MSME exemption applies strictly to Manufacturing NIC codes; Trading entities are ineligible.",
      ruleConfig: { requireManufacturing: true },
      severity: "major",
      isMandatory: true,
      featured: true,
      order: 4,
    },
    {
      _id: SEED_IDS.CLAUSE_ATC05,
      tender: tender._id,
      code: "ATC 05",
      title: "BIS / ISO 9001:2015 Validity",
      type: "GTC",
      category: "bis_iso",
      requirement: "ISO 9001:2015 certificate must be valid on the bid closing date.",
      ruleConfig: { referenceDate: "2026-10-25" },
      severity: "critical",
      isMandatory: true,
      featured: true,
      order: 5,
    },
  ]);

  // 4. Seed 3 Demo Bidders (AstraNet, Nexus_Global, Shivalik_Digitech)
  const [bidAstraNet, bidNexus, bidShivalik] = await Bid.create([
    {
      _id: SEED_IDS.BID_ASTRANET,
      tender: tender._id,
      tenderId: tender.bidNumber,
      bidderName: "AstraNet",
      bidderType: "oem",
      gstNumber: "27AABCA1234F1Z5",
      panNumber: "AABCA1234F",
      udyamNumber: "UDYAM-MH-01-0012345",
      status: "verified",
      overallStatus: "compliant",
      compliancePercent: 100,
      clausesPassed: 5,
      clausesTotal: 5,
      criticalFailures: 0,
      tamperAlerts: 0,
      riskScore: 8,
      complianceScore: 100,
      uploadedBy: officerUser._id,
      verifiedAt: new Date(),
    },
    {
      _id: SEED_IDS.BID_NEXUS,
      tender: tender._id,
      tenderId: tender.bidNumber,
      bidderName: "Nexus_Global",
      bidderType: "reseller",
      gstNumber: "07AABCN9876D1Z2",
      panNumber: "AABCN9876D",
      udyamNumber: "UDYAM-DL-02-0098765",
      status: "verified",
      overallStatus: "disqualified",
      compliancePercent: 60,
      clausesPassed: 3,
      clausesTotal: 5,
      criticalFailures: 1,
      tamperAlerts: 0,
      riskScore: 72,
      complianceScore: 60,
      uploadedBy: officerUser._id,
      verifiedAt: new Date(),
    },
    {
      _id: SEED_IDS.BID_SHIVALIK,
      tender: tender._id,
      tenderId: tender.bidNumber,
      bidderName: "Shivalik_Digitech",
      bidderType: "msme",
      gstNumber: "24AABCS4567E1Z9",
      panNumber: "AABCS4567E",
      udyamNumber: "UDYAM-GJ-04-0045678",
      status: "verified",
      overallStatus: "flagged",
      compliancePercent: 80,
      clausesPassed: 4,
      clausesTotal: 5,
      criticalFailures: 0,
      tamperAlerts: 1,
      riskScore: 89,
      complianceScore: 80,
      uploadedBy: officerUser._id,
      verifiedAt: new Date(),
    },
  ]);

  // 5. Seed Documents with rendered page metadata
  const [docAstraNet, docNexus, docShivalik] = await Document.create([
    {
      _id: SEED_IDS.DOC_ASTRANET,
      ownerKind: "bid",
      tender: tender._id,
      bid: bidAstraNet._id,
      type: "other",
      originalName: "AstraNet_Bid_Bundle.pdf",
      storageKey: `bids/${SEED_IDS.BID_ASTRANET}/AstraNet_Bid_Bundle.pdf`,
      mimetype: "application/pdf",
      sizeBytes: 1024,
      sha256: "a111111111111111111111111111111111111111111111111111111111111111",
      pageCount: 1,
      pages: [
        {
          n: 1,
          imageKey: `bids/${SEED_IDS.BID_ASTRANET}/pages/page-1.png`,
          width: 612,
          height: 792,
        },
      ],
      processingStatus: "analyzed",
      uploadedBy: officerUser._id,
    },
    {
      _id: SEED_IDS.DOC_NEXUS,
      ownerKind: "bid",
      tender: tender._id,
      bid: bidNexus._id,
      type: "udyam",
      originalName: "Nexus_Global_Bid_Bundle.pdf",
      storageKey: `bids/${SEED_IDS.BID_NEXUS}/Nexus_Global_Bid_Bundle.pdf`,
      mimetype: "application/pdf",
      sizeBytes: 1024,
      sha256: "b222222222222222222222222222222222222222222222222222222222222222",
      pageCount: 1,
      pages: [
        {
          n: 1,
          imageKey: `bids/${SEED_IDS.BID_NEXUS}/pages/page-1.png`,
          width: 612,
          height: 792,
        },
      ],
      processingStatus: "analyzed",
      uploadedBy: officerUser._id,
    },
    {
      _id: SEED_IDS.DOC_SHIVALIK,
      ownerKind: "bid",
      tender: tender._id,
      bid: bidShivalik._id,
      type: "iso",
      originalName: "Shivalik_ISO_Cert.pdf",
      storageKey: `bids/${SEED_IDS.BID_SHIVALIK}/Shivalik_ISO_Cert.pdf`,
      mimetype: "application/pdf",
      sizeBytes: 1024,
      sha256: "c333333333333333333333333333333333333333333333333333333333333333",
      pageCount: 1,
      pages: [
        {
          n: 1,
          imageKey: `bids/${SEED_IDS.BID_SHIVALIK}/pages/page-1.png`,
          width: 612,
          height: 792,
        },
      ],
      processingStatus: "analyzed",
      uploadedBy: officerUser._id,
    },
  ]);

  // 6. Seed ClauseEvaluations
  await ClauseEvaluation.create([
    // AstraNet (All 5 Compliant)
    ...clauses.map((clause, idx) => ({
      tender: tender._id,
      bid: bidAstraNet._id,
      clause: clause._id,
      status: "compliant",
      extractedValue: ["₹34.2 Cr", "Class-I (68%)", "MAF Verified", "NIC 26100 (Mfg)", "Valid till 2028-11-30"][idx],
      reasoning: `AstraNet satisfies ${clause.code} (${clause.title}).`,
      confidence: 0.97,
      evidence: [
        {
          document: docAstraNet._id,
          page: 1,
          bbox: [0.12, 0.25, 0.75, 0.08], // Tests normalizeBbox array->object conversion!
          snippet: `Verified compliance evidence for ${clause.code}.`,
        },
      ],
    })),
    // Nexus_Global (Disqualified on ATC 01 Turnover & ATC 04 Udyam NIC 46510 Trading)
    {
      _id: SEED_IDS.EVAL_NEXUS_TURNOVER,
      tender: tender._id,
      bid: bidNexus._id,
      clause: clauses[0]._id,
      status: "non_compliant",
      extractedValue: "₹18.4 Cr",
      extractedFields: { averageTurnoverCr: 18.4 },
      calculation: { averageTurnoverCr: 18.4, requiredCr: 25, shortfallCr: 6.6 },
      reasoning: "Average annual turnover of ₹18.4 Cr is below the mandatory ₹25 Cr threshold.",
      confidence: 0.96,
      evidence: [
        {
          document: docNexus._id,
          page: 1,
          bbox: [0.1, 0.32, 0.75, 0.08],
          snippet: "Average annual turnover across FY21-24 certified at INR 18.40 Crores.",
        },
      ],
    },
    {
      tender: tender._id,
      bid: bidNexus._id,
      clause: clauses[1]._id,
      status: "compliant",
      extractedValue: "Class-I (54%)",
      reasoning: "Local content meets Class-I threshold.",
      confidence: 0.91,
      evidence: [{ document: docNexus._id, page: 1, bbox: [0.1, 0.45, 0.7, 0.06], snippet: "54% local content." }],
    },
    {
      tender: tender._id,
      bid: bidNexus._id,
      clause: clauses[2]._id,
      status: "compliant",
      extractedValue: "MAF Verified",
      reasoning: "MAF matches tender number.",
      confidence: 0.93,
      evidence: [{ document: docNexus._id, page: 1, bbox: [0.1, 0.55, 0.7, 0.06], snippet: "GEM/2026/B/5489210" }],
    },
    {
      tender: tender._id,
      bid: bidNexus._id,
      clause: clauses[3]._id,
      status: "non_compliant",
      extractedValue: "NIC 46510 (Trading)",
      extractedFields: { nicCode: "46510", activityType: "trading" },
      reasoning: "Udyam Registry mismatch: Registered as NIC 46510 (Trading). Trading companies are ineligible.",
      confidence: 0.98,
      evidence: [
        {
          document: docNexus._id,
          page: 1,
          bbox: [0.15, 0.62, 0.7, 0.07],
          snippet: "Major Activity: Trading (NIC 46510 - Wholesale of computers and peripheral equipment).",
        },
      ],
    },
    {
      tender: tender._id,
      bid: bidNexus._id,
      clause: clauses[4]._id,
      status: "compliant",
      extractedValue: "Valid till 2027-06-30",
      reasoning: "ISO 9001 certificate valid.",
      confidence: 0.94,
      evidence: [{ document: docNexus._id, page: 1, bbox: [0.1, 0.75, 0.7, 0.06], snippet: "Valid until 30-06-2027" }],
    },
    // Shivalik_Digitech (4 Compliant, 1 Tamper Alert on ISO Certificate)
    ...clauses.slice(0, 4).map((clause) => ({
      tender: tender._id,
      bid: bidShivalik._id,
      clause: clause._id,
      status: "compliant",
      extractedValue: "Compliant",
      reasoning: `Shivalik_Digitech satisfies ${clause.code}.`,
      confidence: 0.92,
      evidence: [{ document: docShivalik._id, page: 1, bbox: [0.1, 0.2, 0.7, 0.06], snippet: "Verified." }],
    })),
    {
      tender: tender._id,
      bid: bidShivalik._id,
      clause: clauses[4]._id,
      status: "tamper_alert",
      extractedValue: "Modified Expiry Date (2027-12-31)",
      reasoning: "High probability of image tampering detected in ISO Certificate (Expiry Date region).",
      confidence: 0.89,
      evidence: [
        {
          document: docShivalik._id,
          page: 1,
          bbox: [0.704, 0.692, 0.145, 0.015],
          snippet: "Valid Until: 31-12-2027 (ELA compression anomaly detected).",
        },
      ],
    },
  ]);

  // 7. Seed ForensicAlert for Shivalik_Digitech
  await ForensicAlert.create({
    _id: SEED_IDS.ALERT_SHIVALIK_ELA,
    bid: bidShivalik._id,
    document: docShivalik._id,
    page: 1,
    type: "ela",
    severity: "critical",
    documentValue: "Modified Expiry Date (2027-12-31)",
    registryValue: "Expired on 2024-12-31",
    registrySource: "mock",
    metadata: {
      bbox: [0.704, 0.692, 0.145, 0.015],
      confidence: "medium",
    },
    elaImageKey: `bids/${SEED_IDS.BID_SHIVALIK}/ela/ela-page-1.png`,
    note: "High probability of image tampering detected in ISO Certificate (Expiry Date region).",
    status: "open",
  });

  logger.info(
    {
      tenderId: tender._id.toString(),
      bids: [bidAstraNet._id.toString(), bidNexus._id.toString(), bidShivalik._id.toString()],
    },
    "Sample data seeded successfully"
  );
  console.log("✅ Seed completed! Sample IDs:");
  console.table(SEED_IDS);
}

seed()
  .then(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  })
  .catch(async (err) => {
    logger.error({ err }, "Seed failed");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
