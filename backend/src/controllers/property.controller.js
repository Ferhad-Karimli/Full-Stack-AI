const propertyService = require('../services/property.service');
const AppError = require('../utils/AppError');

async function list(req, res) {
  const result = await propertyService.list(req.valid.query, req.lang);
  res.json({ success: true, data: result.items, pagination: result.pagination });
}

async function getOne(req, res) {
  const property = await propertyService.getBySlug(req.valid.params.slug, req.lang);
  if (!property) throw AppError.notFound('Property not found');
  res.json({ success: true, data: property });
}

async function stats(req, res) {
  res.json({ success: true, data: await propertyService.stats() });
}

module.exports = { list, getOne, stats };
