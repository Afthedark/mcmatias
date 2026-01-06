const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
    id_detalle_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.cantidad * this.precio_venta;
        },
        set(value) {
            throw new Error('No establezca el subtotal directamente');
        }
    },
}, {
    tableName: 'detalle_venta',
});

module.exports = DetalleVenta;
