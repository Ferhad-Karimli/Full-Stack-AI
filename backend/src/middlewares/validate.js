const AppError = require('../utils/AppError');

/**
 * Validates req[source] with a zod schema and stores the parsed result
 * on req.valid[source] (Express 5 makes req.query read-only).
 */
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return next(AppError.badRequest('Validation failed', details));
  }
  req.valid = { ...(req.valid || {}), [source]: result.data };
  next();
};
