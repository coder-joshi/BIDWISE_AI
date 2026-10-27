import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { httpLogger } from "./common/config/logger.js";
import {
  generalLimiter,
  authLimiter,
} from "./common/middleware/rate-limit.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bidRoutes from "./modules/bids/bids.routes.js";
import tenderRoutes from "./modules/tenders/tenders.routes.js";
import documentRoutes from "./modules/documents/documents.routes.js";
import evaluationRoutes from "./modules/evaluations/evaluations.routes.js";
import fileRoutes from "./modules/files/files.routes.js";
import forensicsRoutes from "./modules/forensics/forensics.routes.js";
import { initStorage } from "./modules/storage/storage.service.js";

import {
  notFoundHandler,
  errorHandler,
} from "./common/middleware/error.middleware.js";

const app = express();

// Ensure upload directories exist on startup
initStorage();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(httpLogger);

// Serve Swagger UI documentation at /api/docs
try {
  const openapiPath = path.resolve(import.meta.dirname, "../docs/openapi.yaml");
  const swaggerDocument = YAML.load(openapiPath);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.error("Could not load openapi.yaml for Swagger UI:", err.message);
}

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bidwise-ai-n9dm.vercel.app",
];
const envOrigins = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length > 0 ? [...envOrigins, ...defaultOrigins] : defaultOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Return a proper 403 instead of throwing, which would cause a 500
    const err = new Error("Not allowed by CORS");
    err.status = 403;
    return callback(err);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight requests globally BEFORE any route or rate limiter

app.use(cors(corsOptions));

app.use(generalLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "BidWise Backend API" });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "Server is healthy",
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/tenders", tenderRoutes);
app.use("/api/v1/bids", bidRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/evaluations", evaluationRoutes);
app.use("/api/v1/files", fileRoutes);
app.use("/api/v1/forensics", forensicsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
