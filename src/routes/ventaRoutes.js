const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ventaController.getAll);
router.get('/:id', auth, ventaController.getById);
router.post('/', auth, ventaController.create);
router.delete('/:id', auth, ventaController.delete);

module.exports = router;
