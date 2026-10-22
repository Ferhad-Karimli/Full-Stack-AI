const { resolveLang } = require('../utils/localize');

/**
 * Sets req.lang from ?lang=, then the Accept-Language header, then the default (az).
 */
module.exports = function language(req, res, next) {
  req.lang = resolveLang(req.query.lang || req.headers['accept-language']);
  res.setHeader('Content-Language', req.lang);
  next();
};
