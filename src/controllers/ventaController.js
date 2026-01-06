const { Venta, DetalleVenta, Cliente, Usuario, Producto, Inventario } = require('../models');
const sequelize = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                Cliente,
                Usuario,
                {
                    model: DetalleVenta,
                    include: [Producto]
                }
            ],
            order: [['fecha_venta', 'DESC']]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [
                Cliente,
                Usuario,
                {
                    model: DetalleVenta,
                    include: [Producto]
                }
            ]
        });

        if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });
        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { numero_boleta, id_cliente, id_usuario, detalles } = req.body;

        // Validar que hay productos en la venta
        if (!detalles || detalles.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
        }

        // Calcular total de la venta
        let total_venta = 0;

        // Validar stock disponible antes de crear la venta
        for (const detalle of detalles) {
            const { id_producto, cantidad, precio_venta, id_sucursal } = detalle;

            // Buscar inventario
            const inventario = await Inventario.findOne({
                where: { id_producto, id_sucursal },
                transaction: t
            });

            if (!inventario) {
                await t.rollback();
                return res.status(400).json({
                    error: `El producto ${id_producto} no existe en el inventario de la sucursal ${id_sucursal}`
                });
            }

            if (inventario.cantidad < cantidad) {
                await t.rollback();
                return res.status(400).json({
                    error: `Stock insuficiente para el producto ${id_producto}. Disponible: ${inventario.cantidad}, Solicitado: ${cantidad}`
                });
            }

            total_venta += cantidad * precio_venta;
        }

        // Crear la venta
        const venta = await Venta.create({
            numero_boleta,
            id_cliente,
            id_usuario,
            total_venta
        }, { transaction: t });

        // Crear los detalles y actualizar inventario
        for (const detalle of detalles) {
            const { id_producto, cantidad, precio_venta, id_sucursal } = detalle;

            // Crear detalle de venta
            await DetalleVenta.create({
                id_venta: venta.id_venta,
                id_producto,
                cantidad,
                precio_venta
            }, { transaction: t });

            // Descontar del inventario
            await Inventario.decrement('cantidad', {
                by: cantidad,
                where: { id_producto, id_sucursal },
                transaction: t
            });
        }

        // Confirmar transacción
        await t.commit();

        // Obtener la venta completa con relaciones
        const ventaCompleta = await Venta.findByPk(venta.id_venta, {
            include: [
                Cliente,
                Usuario,
                {
                    model: DetalleVenta,
                    include: [Producto]
                }
            ]
        });

        res.status(201).json(ventaCompleta);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [DetalleVenta],
            transaction: t
        });

        if (!venta) {
            await t.rollback();
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Restaurar inventario
        for (const detalle of venta.DetalleVentas) {
            // Necesitamos saber de qué sucursal se vendió
            // Por simplicidad, asumimos que el usuario que vende está en una sucursal
            const usuario = await Usuario.findByPk(venta.id_usuario, { transaction: t });

            await Inventario.increment('cantidad', {
                by: detalle.cantidad,
                where: {
                    id_producto: detalle.id_producto,
                    id_sucursal: usuario.id_sucursal
                },
                transaction: t
            });
        }

        // Eliminar detalles
        await DetalleVenta.destroy({
            where: { id_venta: venta.id_venta },
            transaction: t
        });

        // Eliminar venta
        await venta.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Venta cancelada y stock restaurado' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};
