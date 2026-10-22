const { Router } = require('express');
const { pool } = require('../db/pool');
const propertyRoutes = require('./property.routes');
const cityRoutes = require('./city.routes');
const inquiryRoutes = require('./inquiry.routes');

const router = Router();

router.get('/health', async (req, res) => {
  let db = 'up';
  try {
    await pool.query('SELECT 1');
  } catch {
    db = 'down';
  }
  res.status(db === 'up' ? 200 : 503).json({ status: db === 'up' ? 'ok' : 'degraded', db, uptime: process.uptime() });
});

router.use('/properties', propertyRoutes);
router.use('/cities', cityRoutes);
router.use('/inquiries', inquiryRoutes);

module.exports = router;
