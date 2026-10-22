const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/inquiry.controller');
const validate = require('../middlewares/validate');
const { inquiryBody } = require('../validators/property.validators');

const router = Router();

// Protects the contact form from spam: 5 requests / 15 min per IP.
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later.' } },
});

router.post('/', inquiryLimiter, validate(inquiryBody, 'body'), controller.create);

module.exports = router;
