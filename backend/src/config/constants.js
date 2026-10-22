const LANGUAGES = ['az', 'ru', 'en'];
const DEFAULT_LANGUAGE = 'az';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'studio', 'penthouse'];

const SORT_OPTIONS = {
  newest: 'p.created_at DESC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  area_desc: 'p.area DESC',
};

const PAGINATION = { defaultLimit: 12, maxLimit: 50 };

module.exports = { LANGUAGES, DEFAULT_LANGUAGE, PROPERTY_TYPES, SORT_OPTIONS, PAGINATION };
