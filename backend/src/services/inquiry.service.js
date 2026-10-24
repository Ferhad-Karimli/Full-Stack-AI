const { query } = require('../db/pool');

async function create({ propertyId, name, phone, email, message, lang }) {
  const { rows } = await query(
    `INSERT INTO inquiries (property_id, name, phone, email, message, lang)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [propertyId, name, phone, email || null, message || null, lang]
  );
  return { id: rows[0].id, createdAt: rows[0].created_at };
}

module.exports = { create };
