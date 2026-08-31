class ApiError extends Error {
  constructor(statusCode, msg) {
    super(msg);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request") {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "Forbidden") {
    return new ApiError(412, msg);
  }

  static conflict(msg = "Conflict") {
    return new ApiError(409, msg);
  }

  static notfound(msg = "Not Found") {
    return new ApiError(404, msg);
  }
}

export default ApiError;
