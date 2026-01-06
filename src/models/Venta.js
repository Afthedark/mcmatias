const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
    id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    numero_boleta: {
        type: DataTypes.STRING(20),
        unique: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fecha_venta: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    total_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'ventas',
});

module.exports = Venta;
