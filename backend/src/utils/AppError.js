class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details) {
    return new AppError(message, 400, details);
  }

  static notFound(message = 'Not found') {
    return new AppError(message, 404);
  }
}

module.exports = AppError;
