const { query } = require('../db/pool');
const { pick } = require('../utils/localize');

async function list(lang) {
  const { rows } = await query(`
    SELECT c.slug, c.name, c.image_url, COUNT(p.id)::int AS property_count
    FROM cities c
    LEFT JOIN properties p ON p.city_id = c.id AND p.is_available = TRUE
    GROUP BY c.id
    ORDER BY property_count DESC, c.slug ASC
  `);

  return rows.map((r) => ({
    slug: r.slug,
    name: pick(r.name, lang),
    imageUrl: r.image_url,
    propertyCount: r.property_count,
  }));
}

module.exports = { list };
