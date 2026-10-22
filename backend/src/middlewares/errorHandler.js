const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    error: {
      message: status >= 500 && env.isProd ? 'Internal server error' : err.message,
      ...(err.details && { details: err.details }),
    },
  });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

module.exports = { errorHandler, notFound };
