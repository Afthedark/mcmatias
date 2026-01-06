const { ServicioTecnico, Cliente, Usuario, Sucursal, Categoria } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const servicios = await ServicioTecnico.findAll({
            include: [Cliente, Usuario, Sucursal, Categoria]
        });
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const servicio = await ServicioTecnico.findByPk(req.params.id, {
            include: [Cliente, Usuario, Sucursal, Categoria]
        });
        if (!servicio) return res.status(404).json({ message: 'Servicio técnico no encontrado' });
        res.json(servicio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const servicioData = { ...req.body };

        // Si hay archivos subidos (hasta 3 fotos)
        if (req.files) {
            if (req.files.foto_1) servicioData.foto_1 = `/uploads/images/${req.files.foto_1[0].filename}`;
            if (req.files.foto_2) servicioData.foto_2 = `/uploads/images/${req.files.foto_2[0].filename}`;
            if (req.files.foto_3) servicioData.foto_3 = `/uploads/images/${req.files.foto_3[0].filename}`;
        }

        const servicio = await ServicioTecnico.create(servicioData);
        res.status(201).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const servicioData = { ...req.body };

        // Si hay archivos subidos, actualizar las rutas
        if (req.files) {
            if (req.files.foto_1) servicioData.foto_1 = `/uploads/images/${req.files.foto_1[0].filename}`;
            if (req.files.foto_2) servicioData.foto_2 = `/uploads/images/${req.files.foto_2[0].filename}`;
            if (req.files.foto_3) servicioData.foto_3 = `/uploads/images/${req.files.foto_3[0].filename}`;
        }

        const [updated] = await ServicioTecnico.update(servicioData, {
            where: { id_servicio: req.params.id }
        });

        if (!updated) return res.status(404).json({ message: 'Servicio técnico no encontrado' });

        const updatedServicio = await ServicioTecnico.findByPk(req.params.id);
        res.json(updatedServicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await ServicioTecnico.destroy({
            where: { id_servicio: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Servicio técnico no encontrado' });
        res.json({ message: 'Servicio técnico eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
