const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre_apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    cedula_identidad: {
        type: DataTypes.STRING(20),
    },
    celular: {
        type: DataTypes.STRING(20),
    },
    correo_electronico: {
        type: DataTypes.STRING(100),
    },
    direccion: {
        type: DataTypes.TEXT,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'clientes',
});

module.exports = Cliente;
