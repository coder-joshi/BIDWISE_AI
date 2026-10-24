import ApiError from "../utils/api-error.js";
import { logger } from "../config/logger.js";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    msg: `Cannot ${req.method} ${req.originalUrl}`,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // JWT errors -> 401 (frontend relies on 401 to trigger token refresh)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
  }
  // Mongoose validation error -> 400
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }
  // Mongoose cast error (e.g. invalid ObjectId) -> 400
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Mongoose duplicate key error -> 409
  else if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.length > 0 ? fields.join(", ") : "field";
    message = `Duplicate key error: ${fieldName} already exists`;
  }
  // Multer error -> 413 for size limit, 400 for other upload errors
  else if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File size exceeds allowed limit";
    } else {
      statusCode = 400;
      message = err.message || "File upload error";
    }
  }
  // ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Default unhandled errors -> 500 generic in production
  else if (statusCode === 500) {
    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  // Log error using pino
  if (req.log?.error) {
    req.log.error(err);
  } else {
    logger.error(err);
  }

  const response = {
    success: false,
    msg: message,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
