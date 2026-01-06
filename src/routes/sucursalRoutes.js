const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, sucursalController.getAll);
router.get('/:id', auth, sucursalController.getById);
router.post('/', auth, sucursalController.create);
router.put('/:id', auth, sucursalController.update);
router.delete('/:id', auth, sucursalController.delete);

module.exports = router;
