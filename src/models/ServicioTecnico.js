const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServicioTecnico = sequelize.define('ServicioTecnico', {
    id_servicio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    numero_servicio: {
        type: DataTypes.STRING(20),
        unique: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    descripcion_problema: {
        type: DataTypes.TEXT,
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.ENUM('En Reparación', 'Para Retirar', 'Entregado'),
        defaultValue: 'En Reparación',
    },
    id_sucursal: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_categoria: {
        type: DataTypes.INTEGER,
    },
    foto_1: { type: DataTypes.STRING(255) },
    foto_2: { type: DataTypes.STRING(255) },
    foto_3: { type: DataTypes.STRING(255) },
}, {
    tableName: 'servicios_tecnicos',
});

module.exports = ServicioTecnico;
