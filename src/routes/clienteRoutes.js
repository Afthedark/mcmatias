const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, clienteController.getAll);
router.get('/:id', auth, clienteController.getById);
router.post('/', auth, clienteController.create);
router.put('/:id', auth, clienteController.update);
router.delete('/:id', auth, clienteController.delete);

module.exports = router;
