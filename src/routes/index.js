const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const sucursalRoutes = require('./sucursalRoutes');
const clienteRoutes = require('./clienteRoutes');
const productoRoutes = require('./productoRoutes');
const servicioRoutes = require('./servicioRoutes');
const inventarioRoutes = require('./inventarioRoutes');
const ventaRoutes = require('./ventaRoutes');

router.use('/auth', authRoutes);
router.use('/sucursales', sucursalRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/servicios', servicioRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/ventas', ventaRoutes);

module.exports = router;
