const { Producto, Categoria } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const productos = await Producto.findAll({ include: Categoria });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, { include: Categoria });
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const productoData = { ...req.body };

        // Si hay un archivo subido, guardar la ruta
        if (req.file) {
            productoData.foto_producto = `/uploads/images/${req.file.filename}`;
        }

        const producto = await Producto.create(productoData);
        res.status(201).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const productoData = { ...req.body };

        // Si hay un archivo subido, actualizar la ruta
        if (req.file) {
            productoData.foto_producto = `/uploads/images/${req.file.filename}`;
        }

        const [updated] = await Producto.update(productoData, {
            where: { id_producto: req.params.id }
        });

        if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });

        const updatedProducto = await Producto.findByPk(req.params.id);
        res.json(updatedProducto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Producto.destroy({
            where: { id_producto: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
