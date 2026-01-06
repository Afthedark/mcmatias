const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', auth, productoController.getAll);
router.get('/:id', auth, productoController.getById);
router.post('/', auth, upload.single('foto_producto'), productoController.create);
router.put('/:id', auth, upload.single('foto_producto'), productoController.update);
router.delete('/:id', auth, productoController.delete);

module.exports = router;
