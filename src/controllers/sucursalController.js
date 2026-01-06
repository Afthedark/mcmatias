const { Sucursal } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const sucursales = await Sucursal.findAll();
        res.json(sucursales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.params.id);
        if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });
        res.json(sucursal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const sucursal = await Sucursal.create(req.body);
        res.status(201).json(sucursal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Sucursal.update(req.body, {
            where: { id_sucursal: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Sucursal no encontrada' });
        const updatedSucursal = await Sucursal.findByPk(req.params.id);
        res.json(updatedSucursal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Sucursal.destroy({
            where: { id_sucursal: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Sucursal no encontrada' });
        res.json({ message: 'Sucursal eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
