import mongoose from "mongoose";
import {
  BID_STATUSES,
  BID_STATUS_VALUES,
  BID_DOCUMENT_TYPE_VALUES,
  DOCUMENT_VERIFICATION_STATUSES,
  DOCUMENT_VERIFICATION_STATUS_VALUES,
} from "../../common/constants/statuses.js";

const bidDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: BID_DOCUMENT_TYPE_VALUES,
    required: true,
  },
  originalName: { type: String, required: true },
  filename:     { type: String, required: true },
  path:         { type: String, required: true },
  mimetype:     { type: String },
  sizeBytes:    { type: Number },
  uploadedAt:   { type: Date, default: Date.now },
  extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
  verificationStatus: {
    type: String,
    enum: DOCUMENT_VERIFICATION_STATUS_VALUES,
    default: DOCUMENT_VERIFICATION_STATUSES.PENDING,
  },
});

const bidSchema = new mongoose.Schema(
  {
    tenderId:        { type: String, required: [true, "Tender ID is required"], trim: true },
    bidderName:      { type: String, required: [true, "Bidder name is required"], trim: true },
    gstNumber:       { type: String, trim: true },
    panNumber:       { type: String, trim: true },
    udyamNumber:     { type: String, trim: true },
    status: {
      type: String,
      enum: BID_STATUS_VALUES,
      default: BID_STATUSES.PENDING,
    },
    riskScore:        { type: Number, min: 0, max: 100, default: null },
    complianceScore:  { type: Number, min: 0, max: 100, default: null },
    fraudSignals:     { type: Number, default: 0 },
    documents:        [bidDocumentSchema],
    uploadedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    verifiedAt:       { type: Date, default: null },
    aiReport:         { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
