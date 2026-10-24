const { Router } = require('express');
const controller = require('../controllers/property.controller');
const validate = require('../middlewares/validate');
const { listQuery, slugParam } = require('../validators/property.validators');

const router = Router();

router.get('/', validate(listQuery, 'query'), controller.list);
router.get('/stats', controller.stats);
router.get('/:slug', validate(slugParam, 'params'), controller.getOne);

module.exports = router;
