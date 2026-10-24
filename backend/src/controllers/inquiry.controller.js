const inquiryService = require('../services/inquiry.service');
const propertyService = require('../services/property.service');
const AppError = require('../utils/AppError');

async function create(req, res) {
  const { propertySlug, lang, ...fields } = req.valid.body;

  const propertyId = await propertyService.getIdBySlug(propertySlug);
  if (!propertyId) throw AppError.notFound('Property not found');

  const inquiry = await inquiryService.create({
    ...fields,
    propertyId,
    lang: lang || req.lang,
  });

  res.status(201).json({ success: true, data: inquiry });
}

module.exports = { create };
