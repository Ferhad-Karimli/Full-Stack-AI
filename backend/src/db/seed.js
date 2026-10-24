/**
 * Seeds the database with default cities and 10 properties.
 *
 *   node src/db/seed.js            → insert/update default data (idempotent, by slug)
 *   node src/db/seed.js --if-empty → only seed when the properties table is empty
 *   node src/db/seed.js --reset    → wipe all data, then seed
 */
const { pool } = require('./pool');
const migrate = require('./migrate');
const { cities, properties } = require('./seed-data');

const args = new Set(process.argv.slice(2));

async function seed() {
  await migrate();
  const client = await pool.connect();
  try {
    if (args.has('--if-empty')) {
      const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM properties');
      if (rows[0].n > 0) {
        console.log(`[seed] skipped: ${rows[0].n} properties already exist`);
        return;
      }
    }

    await client.query('BEGIN');

    if (args.has('--reset')) {
      await client.query('TRUNCATE inquiries, properties, cities RESTART IDENTITY CASCADE');
      console.log('[seed] tables truncated');
    }

    const cityIds = {};
    for (const c of cities) {
      const { rows } = await client.query(
        `INSERT INTO cities (slug, name, image_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
         RETURNING id`,
        [c.slug, c.name, c.image_url]
      );
      cityIds[c.slug] = rows[0].id;
    }

    // Insert oldest first so "newest" sort shows the list top-down as written.
    const ordered = [...properties].reverse();
    for (const [i, p] of ordered.entries()) {
      await client.query(
        `INSERT INTO properties (
           slug, city_id, type, title, description, district, address,
           price, rooms, bathrooms, area, floor, total_floors,
           amenities, images, latitude, longitude, is_featured, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
                   NOW() - ($19 || ' hours')::interval)
         ON CONFLICT (slug) DO UPDATE SET
           city_id = EXCLUDED.city_id, type = EXCLUDED.type, title = EXCLUDED.title,
           description = EXCLUDED.description, district = EXCLUDED.district,
           address = EXCLUDED.address, price = EXCLUDED.price, rooms = EXCLUDED.rooms,
           bathrooms = EXCLUDED.bathrooms, area = EXCLUDED.area, floor = EXCLUDED.floor,
           total_floors = EXCLUDED.total_floors, amenities = EXCLUDED.amenities,
           images = EXCLUDED.images, latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude, is_featured = EXCLUDED.is_featured,
           updated_at = NOW()`,
        [
          p.slug, cityIds[p.city], p.type, p.title, p.description, p.district, p.address,
          p.price, p.rooms, p.bathrooms, p.area, p.floor, p.total_floors,
          p.amenities, p.images, p.latitude, p.longitude, p.is_featured,
          String((ordered.length - i) * 6),
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`[seed] ${cities.length} cities and ${properties.length} properties ready`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    process.exit(1);
  });
