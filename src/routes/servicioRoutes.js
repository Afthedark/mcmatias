const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', auth, servicioController.getAll);
router.get('/:id', auth, servicioController.getById);
router.post('/', auth, upload.fields([
    { name: 'foto_1', maxCount: 1 },
    { name: 'foto_2', maxCount: 1 },
    { name: 'foto_3', maxCount: 1 }
]), servicioController.create);
router.put('/:id', auth, upload.fields([
    { name: 'foto_1', maxCount: 1 },
    { name: 'foto_2', maxCount: 1 },
    { name: 'foto_3', maxCount: 1 }
]), servicioController.update);
router.delete('/:id', auth, servicioController.delete);

module.exports = router;
