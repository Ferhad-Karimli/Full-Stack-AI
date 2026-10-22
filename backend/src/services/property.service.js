const { query } = require('../db/pool');
const { SORT_OPTIONS } = require('../config/constants');
const { pick } = require('../utils/localize');

const BASE_SELECT = `
  SELECT p.*, c.slug AS city_slug, c.name AS city_name
  FROM properties p
  JOIN cities c ON c.id = p.city_id
`;

/** Shapes a DB row into the public API format for one language. */
function toDto(row, lang, { full = false } = {}) {
  const dto = {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: pick(row.title, lang),
    district: pick(row.district, lang),
    city: { slug: row.city_slug, name: pick(row.city_name, lang) },
    price: Number(row.price),
    currency: row.currency,
    pricePeriod: row.price_period,
    rooms: row.rooms,
    bathrooms: row.bathrooms,
    area: Number(row.area),
    coverImage: row.images[0] || null,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
  };

  if (full) {
    Object.assign(dto, {
      description: pick(row.description, lang),
      address: row.address,
      floor: row.floor,
      totalFloors: row.total_floors,
      amenities: row.amenities,
      images: row.images,
      location:
        row.latitude != null
          ? { lat: Number(row.latitude), lng: Number(row.longitude) }
          : null,
      isAvailable: row.is_available,
    });
  }
  return dto;
}

async function list(filters, lang) {
  const where = ['p.is_available = TRUE'];
  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.city) where.push(`c.slug = ${add(filters.city)}`);
  if (filters.type) where.push(`p.type = ${add(filters.type)}`);
  if (filters.minPrice != null) where.push(`p.price >= ${add(filters.minPrice)}`);
  if (filters.maxPrice != null) where.push(`p.price <= ${add(filters.maxPrice)}`);
  if (filters.rooms != null) where.push(`p.rooms >= ${add(filters.rooms)}`);
  if (filters.featured) where.push(`p.is_featured = ${add(filters.featured === 'true')}`);
  if (filters.q) {
    const term = add(`%${filters.q}%`);
    const l = add(lang);
    where.push(
      `(p.title ->> ${l} ILIKE ${term} OR p.district ->> ${l} ILIKE ${term}
        OR c.name ->> ${l} ILIKE ${term} OR p.address ILIKE ${term})`
    );
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const orderSql = `ORDER BY ${SORT_OPTIONS[filters.sort]}, p.id DESC`;
  const offset = (filters.page - 1) * filters.limit;

  const [items, count] = await Promise.all([
    query(
      `${BASE_SELECT} ${whereSql} ${orderSql} LIMIT ${add(filters.limit)} OFFSET ${add(offset)}`,
      params
    ),
    query(
      `SELECT COUNT(*)::int AS total FROM properties p JOIN cities c ON c.id = p.city_id ${whereSql}`,
      params.slice(0, params.length - 2)
    ),
  ]);

  const total = count.rows[0].total;
  return {
    items: items.rows.map((r) => toDto(r, lang)),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
}

async function getBySlug(slug, lang) {
  const { rows } = await query(`${BASE_SELECT} WHERE p.slug = $1`, [slug]);
  if (!rows[0]) return null;

  const property = toDto(rows[0], lang, { full: true });

  // Up to 3 similar listings: same city first, then same type.
  const similar = await query(
    `${BASE_SELECT}
     WHERE p.id <> $1 AND p.is_available = TRUE
     ORDER BY (p.city_id = $2) DESC, (p.type = $3) DESC, p.is_featured DESC, p.created_at DESC
     LIMIT 3`,
    [rows[0].id, rows[0].city_id, rows[0].type]
  );
  property.similar = similar.rows.map((r) => toDto(r, lang));

  return property;
}

async function getIdBySlug(slug) {
  const { rows } = await query('SELECT id FROM properties WHERE slug = $1', [slug]);
  return rows[0]?.id ?? null;
}

async function stats() {
  const { rows } = await query(`
    SELECT COUNT(*)::int AS properties,
           COUNT(DISTINCT city_id)::int AS cities,
           COALESCE(MIN(price), 0)::float AS "minPrice",
           COALESCE(MAX(price), 0)::float AS "maxPrice"
    FROM properties WHERE is_available = TRUE
  `);
  return rows[0];
}

module.exports = { list, getBySlug, getIdBySlug, stats };
