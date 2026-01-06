const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre_apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    correo_electronico: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    contraseña: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_sucursal: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'usuarios',
    hooks: {
        beforeCreate: async (user) => {
            if (user.contraseña) {
                const salt = await bcrypt.genSalt(10);
                user.contraseña = await bcrypt.hash(user.contraseña, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('contraseña')) {
                const salt = await bcrypt.genSalt(10);
                user.contraseña = await bcrypt.hash(user.contraseña, salt);
            }
        },
    },
});

module.exports = Usuario;
