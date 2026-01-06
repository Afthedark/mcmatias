const Role = require('./Role');
const Sucursal = require('./Sucursal');
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Inventario = require('./Inventario');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const ServicioTecnico = require('./ServicioTecnico');

// Relationships

// Usuarios
Role.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Role, { foreignKey: 'id_rol' });

Sucursal.hasMany(Usuario, { foreignKey: 'id_sucursal' });
Usuario.belongsTo(Sucursal, { foreignKey: 'id_sucursal' });

// Categorias, Productos y Servicios
Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });

Categoria.hasMany(ServicioTecnico, { foreignKey: 'id_categoria' });
ServicioTecnico.belongsTo(Categoria, { foreignKey: 'id_categoria' });

// Inventario
Producto.hasMany(Inventario, { foreignKey: 'id_producto' });
Inventario.belongsTo(Producto, { foreignKey: 'id_producto' });

Sucursal.hasMany(Inventario, { foreignKey: 'id_sucursal' });
Inventario.belongsTo(Sucursal, { foreignKey: 'id_sucursal' });

// Ventas
Cliente.hasMany(Venta, { foreignKey: 'id_cliente' });
Venta.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Usuario.hasMany(Venta, { foreignKey: 'id_usuario' });
Venta.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Venta.hasMany(DetalleVenta, { foreignKey: 'id_venta' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'id_venta' });

Producto.hasMany(DetalleVenta, { foreignKey: 'id_producto' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'id_producto' });

// Servicios Técnicos
Cliente.hasMany(ServicioTecnico, { foreignKey: 'id_cliente' });
ServicioTecnico.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Usuario.hasMany(ServicioTecnico, { foreignKey: 'id_usuario' });
ServicioTecnico.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Sucursal.hasMany(ServicioTecnico, { foreignKey: 'id_sucursal' });
ServicioTecnico.belongsTo(Sucursal, { foreignKey: 'id_sucursal' });

module.exports = {
    Role,
    Sucursal,
    Usuario,
    Cliente,
    Categoria,
    Producto,
    Inventario,
    Venta,
    DetalleVenta,
    ServicioTecnico,
};
