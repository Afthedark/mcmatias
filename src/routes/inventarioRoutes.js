const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, inventarioController.getAll);
router.get('/sucursal/:id_sucursal', auth, inventarioController.getByBranch);
router.get('/producto/:id_producto', auth, inventarioController.getByProduct);
router.post('/', auth, inventarioController.create);
router.put('/:id', auth, inventarioController.update);
router.delete('/:id', auth, inventarioController.delete);

module.exports = router;
