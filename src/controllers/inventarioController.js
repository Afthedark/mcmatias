const { Inventario, Producto, Sucursal } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const inventarios = await Inventario.findAll({
            include: [Producto, Sucursal]
        });
        res.json(inventarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getByBranch = async (req, res) => {
    try {
        const inventarios = await Inventario.findAll({
            where: { id_sucursal: req.params.id_sucursal },
            include: [Producto, Sucursal]
        });
        res.json(inventarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getByProduct = async (req, res) => {
    try {
        const inventarios = await Inventario.findAll({
            where: { id_producto: req.params.id_producto },
            include: [Producto, Sucursal]
        });
        res.json(inventarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const inventario = await Inventario.create(req.body);
        res.status(201).json(inventario);
    } catch (error) {
        // Manejo de error de duplicado (producto ya existe en esa sucursal)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Este producto ya existe en el inventario de esta sucursal. Use la función de actualizar.'
            });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Inventario.update(req.body, {
            where: { id_inventario: req.params.id }
        });

        if (!updated) return res.status(404).json({ message: 'Registro de inventario no encontrado' });

        const updatedInventario = await Inventario.findByPk(req.params.id, {
            include: [Producto, Sucursal]
        });
        res.json(updatedInventario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Inventario.destroy({
            where: { id_inventario: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Registro de inventario no encontrado' });
        res.json({ message: 'Registro de inventario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
