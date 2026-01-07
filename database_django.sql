-- =====================================================
-- MULTI CENTRO MATIAS - Base de Datos para Django REST
-- Solo Tablas Estructurales (Sin Datos, Sin Triggers, Sin Vistas)
-- Para Backend con Endpoints Personalizados
-- =====================================================

-- Crear base de datos (descomentar si es necesario)
-- CREATE DATABASE IF NOT EXISTS tienda_multicentro_matias;
-- USE tienda_multicentro_matias;

-- =====================================================
-- TABLAS PRINCIPALES - SOLO ESTRUCTURA
-- =====================================================

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    UNIQUE INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id_sucursal INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_sucursal_activa (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(100) NOT NULL,
    tipo ENUM('producto', 'servicio') NOT NULL,
    UNIQUE KEY idx_categoria_tipo (nombre_categoria, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_apellido VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_sucursal INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_usuario_email (correo_electronico),
    INDEX idx_usuario_rol (id_rol),
    INDEX idx_usuario_sucursal (id_sucursal),
    INDEX idx_usuario_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre_apellido VARCHAR(100) NOT NULL,
    cedula_identidad VARCHAR(20),
    celular VARCHAR(20),
    correo_electronico VARCHAR(100),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cliente_nombre (nombre_apellido),
    INDEX idx_cliente_cedula (cedula_identidad),
    INDEX idx_cliente_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre_producto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    codigo_barras VARCHAR(100) UNIQUE,
    id_categoria INT,
    precio DECIMAL(10,2) NOT NULL,
    foto_producto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_producto_categoria (id_categoria),
    INDEX idx_producto_codigo (codigo_barras),
    INDEX idx_producto_precio (precio),
    FULLTEXT INDEX idx_producto_nombre (nombre_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Inventario
CREATE TABLE IF NOT EXISTS inventario (
    id_inventario INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT NOT NULL,
    id_sucursal INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY idx_producto_sucursal (id_producto, id_sucursal),
    INDEX idx_inventario_producto (id_producto),
    INDEX idx_inventario_sucursal (id_sucursal),
    INDEX idx_inventario_cantidad (cantidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
    id_venta INT PRIMARY KEY AUTO_INCREMENT,
    numero_boleta VARCHAR(20) UNIQUE,
    id_cliente INT,
    id_usuario INT NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_venta_fecha (fecha_venta),
    INDEX idx_venta_cliente (id_cliente),
    INDEX idx_venta_usuario (id_usuario),
    INDEX idx_venta_boleta (numero_boleta),
    INDEX idx_venta_total (total_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalle de Ventas
CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle_venta INT PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_detalle_venta (id_venta),
    INDEX idx_detalle_producto (id_producto),
    INDEX idx_detalle_cantidad (cantidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios Técnicos
CREATE TABLE IF NOT EXISTS servicios_tecnicos (
    id_servicio INT PRIMARY KEY AUTO_INCREMENT,
    numero_servicio VARCHAR(20) UNIQUE,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    descripcion_problema TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('En Reparación', 'Para Retirar', 'Entregado') DEFAULT 'En Reparación',
    id_sucursal INT NOT NULL,
    id_categoria INT,
    foto_1 VARCHAR(255),
    foto_2 VARCHAR(255),
    foto_3 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_servicio_cliente (id_cliente),
    INDEX idx_servicio_usuario (id_usuario),
    INDEX idx_servicio_estado (estado),
    INDEX idx_servicio_categoria (id_categoria),
    INDEX idx_servicio_fecha (fecha_inicio),
    INDEX idx_servicio_numero (numero_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFICACIÓN FINAL DE LA ESTRUCTURA
-- =====================================================

SELECT 'Estructura de tablas creada exitosamente para Django REST' AS mensaje,
       NOW() AS fecha_creacion,
       VERSION() AS version_mysql;

-- Contar tablas creadas
SELECT 'Tabla' AS tipo, COUNT(*) AS cantidad FROM roles
UNION ALL
SELECT 'Sucursales', COUNT(*) FROM sucursales
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos
UNION ALL
SELECT 'Inventario', COUNT(*) FROM inventario
UNION ALL
SELECT 'Ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'Detalle Ventas', COUNT(*) FROM detalle_venta
UNION ALL
SELECT 'Servicios Técnicos', COUNT(*) FROM servicios_tecnicos;

-- =====================================================
-- FIN DEL SCRIPT - BASE LISTA PARA DJANGO REST
-- =====================================================