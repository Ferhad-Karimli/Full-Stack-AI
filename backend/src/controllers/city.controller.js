const cityService = require('../services/city.service');

async function list(req, res) {
  res.json({ success: true, data: await cityService.list(req.lang) });
}

module.exports = { list };
