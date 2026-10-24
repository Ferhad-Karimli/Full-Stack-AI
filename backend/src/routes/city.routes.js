const { Router } = require('express');
const controller = require('../controllers/city.controller');

const router = Router();

router.get('/', controller.list);

module.exports = router;
