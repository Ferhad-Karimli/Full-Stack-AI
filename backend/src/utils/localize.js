const { LANGUAGES, DEFAULT_LANGUAGE } = require('../config/constants');

/** Normalises a requested language to one we support. */
const resolveLang = (lang) => {
  const code = String(lang || '').slice(0, 2).toLowerCase();
  return LANGUAGES.includes(code) ? code : DEFAULT_LANGUAGE;
};

/** Picks one language out of a { az, ru, en } object, falling back to the default. */
const pick = (field, lang) => {
  if (!field || typeof field !== 'object') return field ?? null;
  return field[lang] ?? field[DEFAULT_LANGUAGE] ?? Object.values(field)[0] ?? null;
};

module.exports = { resolveLang, pick };
