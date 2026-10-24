import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { httpLogger } from "./common/config/logger.js";
import {
  generalLimiter,
  authLimiter,
} from "./common/middleware/rate-limit.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import bidRoutes from "./modules/bids/bids.routes.js";
import tenderRoutes from "./modules/tenders/tenders.routes.js";

import {
  notFoundHandler,
  errorHandler,
} from "./common/middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(httpLogger);

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const envOrigins = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/tenders", tenderRoutes);
app.use("/api/v1/bids", bidRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
