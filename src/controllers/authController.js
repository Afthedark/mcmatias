const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, Role, Sucursal } = require('../models');

exports.register = async (req, res) => {
    try {
        const { nombre_apellido, correo_electronico, contraseña, id_rol, id_sucursal } = req.body;

        const user = await Usuario.create({
            nombre_apellido,
            correo_electronico,
            contraseña,
            id_rol,
            id_sucursal
        });

        res.status(201).json({
            message: 'Usuario registrado con éxito',
            user: {
                id_usuario: user.id_usuario,
                nombre_apellido: user.nombre_apellido,
                correo_electronico: user.correo_electronico
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo_electronico, contraseña } = req.body;
        
        const user = await Usuario.findOne({
            where: { correo_electronico },
            include: [Role, Sucursal]
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id_usuario, rol: user.Role.nombre_rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nombre_apellido: user.nombre_apellido,
                rol: user.Role.nombre_rol,
                sucursal: user.Sucursal.nombre
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
