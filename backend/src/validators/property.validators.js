const { z } = require('zod');
const { PROPERTY_TYPES, SORT_OPTIONS, PAGINATION, LANGUAGES } = require('../config/constants');

const optionalNumber = z.coerce.number().nonnegative().optional();

const listQuery = z.object({
  lang: z.string().optional(),
  city: z.string().trim().min(1).max(64).optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  rooms: z.coerce.number().int().min(1).max(10).optional(), // "at least N rooms"
  featured: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(Object.keys(SORT_OPTIONS)).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
});

const slugParam = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug').max(128),
});

const inquiryBody = z.object({
  propertySlug: z.string().regex(/^[a-z0-9-]+$/).max(128),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40).regex(/^[+\d\s()-]+$/, 'Invalid phone number'),
  email: z.union([z.email().max(160), z.literal('')]).optional(),
  message: z.string().trim().max(2000).optional(),
  lang: z.enum(LANGUAGES).optional(),
});

module.exports = { listQuery, slugParam, inquiryBody };
