const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre_producto: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
    },
    codigo_barras: {
        type: DataTypes.STRING(100),
        unique: true,
    },
    id_categoria: {
        type: DataTypes.INTEGER,
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    foto_producto: {
        type: DataTypes.STRING(255),
    },
}, {
    tableName: 'productos',
});

module.exports = Producto;
