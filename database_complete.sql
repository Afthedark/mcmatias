-- =====================================================
-- MULTI CENTRO MATIAS - Base de Datos para Django REST
-- Solo Tablas Estructurales (Sin Datos, Sin Triggers, Sin Vistas)
-- Para Backend con Endpoints Personalizados
-- =====================================================

-- =====================================================
-- TABLAS PRINCIPALES
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
-- VISTAS ÚTILES
-- =====================================================

-- Vista de Inventario por Sucursal
CREATE OR REPLACE VIEW vista_inventario_sucursal AS
SELECT 
    s.id_sucursal,
    s.nombre AS nombre_sucursal,
    p.id_producto,
    p.nombre_producto,
    p.codigo_barras,
    c.nombre_categoria,
    i.cantidad,
    p.precio,
    (i.cantidad * p.precio) AS valor_total,
    CASE 
        WHEN i.cantidad <= 5 THEN 'Bajo Stock'
        WHEN i.cantidad <= 10 THEN 'Stock Mediano'
        ELSE 'Stock Suficiente'
    END AS estado_stock
FROM inventario i
JOIN productos p ON i.id_producto = p.id_producto
JOIN sucursales s ON i.id_sucursal = s.id_sucursal
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE s.activo = TRUE;

-- Vista de Ventas Detalladas
CREATE OR REPLACE VIEW vista_ventas_detalle AS
SELECT 
    v.id_venta,
    v.numero_boleta,
    v.fecha_venta,
    v.total_venta,
    cl.id_cliente,
    cl.nombre_apellido AS nombre_cliente,
    u.id_usuario,
    u.nombre_apellido AS nombre_usuario,
    r.nombre_rol AS rol_usuario,
    s.nombre AS sucursal,
    COUNT(dv.id_detalle_venta) AS total_productos,
    SUM(dv.cantidad) AS total_unidades
FROM ventas v
LEFT JOIN clientes cl ON v.id_cliente = cl.id_cliente
JOIN usuarios u ON v.id_usuario = u.id_usuario
JOIN roles r ON u.id_rol = r.id_rol
JOIN sucursales s ON u.id_sucursal = s.id_sucursal
LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
GROUP BY v.id_venta, v.numero_boleta, v.fecha_venta, v.total_venta, 
         cl.id_cliente, cl.nombre_apellido, u.id_usuario, u.nombre_apellido, 
         r.nombre_rol, s.nombre;

-- Vista de Servicios Técnicos
CREATE OR REPLACE VIEW vista_servicios_detalle AS
SELECT 
    st.id_servicio,
    st.numero_servicio,
    st.descripcion_problema,
    st.fecha_inicio,
    st.estado,
    cl.id_cliente,
    cl.nombre_apellido AS nombre_cliente,
    cl.celular AS celular_cliente,
    u.id_usuario,
    u.nombre_apellido AS nombre_tecnico,
    r.nombre_rol AS rol_tecnico,
    s.nombre AS sucursal,
    c.nombre_categoria,
    CASE 
        WHEN st.estado = 'En Reparación' THEN 1
        WHEN st.estado = 'Para Retirar' THEN 2
        WHEN st.estado = 'Entregado' THEN 3
        ELSE 4
    END AS orden_estado
FROM servicios_tecnicos st
JOIN clientes cl ON st.id_cliente = cl.id_cliente
JOIN usuarios u ON st.id_usuario = u.id_usuario
JOIN roles r ON u.id_rol = r.id_rol
JOIN sucursales s ON st.id_sucursal = s.id_sucursal
LEFT JOIN categorias c ON st.id_categoria = c.id_categoria;

-- =====================================================
-- TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- Trigger para calcular subtotal en detalle_venta
DELIMITER //
CREATE TRIGGER tr_calcular_subtotal_venta
BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    -- Verificar stock disponible
    DECLARE stock_actual INT;
    DECLARE precio_producto DECIMAL(10,2);
    
    SELECT cantidad INTO stock_actual 
    FROM inventario 
    WHERE id_producto = NEW.id_producto AND id_sucursal = 1; -- Ajustar sucursal según lógica
    
    IF stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
    END IF;
    
    -- Obtener precio del producto
    SELECT precio INTO precio_producto 
    FROM productos 
    WHERE id_producto = NEW.id_producto;
    
    -- Precio de venta (puede ser diferente al precio base)
    IF NEW.precio_venta IS NULL OR NEW.precio_venta = 0 THEN
        SET NEW.precio_venta = precio_producto;
    END IF;
END//
DELIMITER ;

-- Trigger para actualizar inventario después de venta
DELIMITER //
CREATE TRIGGER tr_actualizar_inventario_venta
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    -- Descontar del inventario (asumiendo sucursal 1, ajustar según lógica)
    UPDATE inventario 
    SET cantidad = cantidad - NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_producto = NEW.id_producto AND id_sucursal = 1;
END//
DELIMITER ;

-- Trigger para restaurar inventario si se cancela venta
DELIMITER //
CREATE TRIGGER tr_restaurar_inventario_cancelacion
AFTER DELETE ON detalle_venta
FOR EACH ROW
BEGIN
    -- Restaurar al inventario (asumiendo sucursal 1)
    UPDATE inventario 
    SET cantidad = cantidad + OLD.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_producto = OLD.id_producto AND id_sucursal = 1;
END//
DELIMITER ;

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Insertar Roles
INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'cajero'),
(2, 'tecnico'),
(3, 'cajero+tecnico'),
(4, 'administrador')
ON DUPLICATE KEY UPDATE nombre_rol = VALUES(nombre_rol);

-- Insertar Sucursal Principal
INSERT INTO sucursales (id_sucursal, nombre, direccion, activo) VALUES
(1, 'Casa Matriz', 'Dirección Principal', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), direccion = VALUES(direccion);

-- Insertar Categorías
INSERT INTO categorias (id_categoria, nombre_categoria, tipo) VALUES
-- Categorías de Productos
(1, 'Electrónicos', 'producto'),
(2, 'Hogar', 'producto'),
(3, 'Juguetes', 'producto'),
(4, 'Ropa', 'producto'),
(5, 'Libros', 'producto'),
-- Categorías de Servicios
(6, 'Reparación Celulares', 'servicio'),
(7, 'Reparación Laptops', 'servicio'),
(8, 'Mantenimiento General', 'servicio'),
(9, 'Reparación Consolas', 'servicio'),
(10, 'Servicio Técnico Especializado', 'servicio')
ON DUPLICATE KEY UPDATE nombre_categoria = VALUES(nombre_categoria), tipo = VALUES(tipo);

-- Insertar Usuario Administrador
INSERT INTO usuarios (id_usuario, nombre_apellido, correo_electronico, contraseña, id_rol, id_sucursal, activo) VALUES
(1, 'Administrador Principal', 'admin@multicentromatias.com', '$2b$10$LZZ.ANeZeHt/aTFqML2uxew.2HVMP3kn735CJqL7cnB2wSt0lLFp6', 4, 1, TRUE)
ON DUPLICATE KEY UPDATE 
    nombre_apellido = VALUES(nombre_apellido),
    correo_electronico = VALUES(correo_electronico),
    id_rol = VALUES(id_rol),
    id_sucursal = VALUES(id_sucursal);

-- Insertar Productos de Ejemplo
INSERT INTO productos (id_producto, nombre_producto, descripcion, codigo_barras, id_categoria, precio) VALUES
(1, 'Samsung Galaxy A54', 'Smartphone 128GB', '8806094664089', 1, 499.99),
(2, 'iPhone 15', 'iPhone 128GB', '194253098500', 1, 899.99),
(3, 'Laptop Dell Inspiron', 'Laptop 15.6" Intel i5', '884116375393', 2, 699.99),
(4, 'Tablet iPad', 'iPad 10.9" WiFi', '194253175160', 1, 549.99),
(5, 'Smart TV 55"', 'Samsung 4K UHD', '8806094800600', 1, 799.99),
(6, 'Auriculares Bluetooth', 'Sony WH-1000XM4', '027242901861', 1, 349.99),
(7, 'Cámara Digital', 'Canon EOS Rebel', '013803248342', 1, 549.99),
(8, 'Monitor 27"', 'LG UltraFine 4K', '8806098458155', 2, 499.99)
ON DUPLICATE KEY UPDATE 
    nombre_producto = VALUES(nombre_producto),
    descripcion = VALUES(descripcion),
    id_categoria = VALUES(id_categoria),
    precio = VALUES(precio);

-- Insertar Inventario Inicial
INSERT INTO inventario (id_producto, id_sucursal, cantidad) VALUES
(1, 1, 25),
(2, 1, 15),
(3, 1, 10),
(4, 1, 20),
(5, 1, 8),
(6, 1, 30),
(7, 1, 12),
(8, 1, 15)
ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad);

-- Insertar Clientes de Ejemplo
INSERT INTO clientes (id_cliente, nombre_apellido, cedula_identidad, celular, correo_electronico, direccion) VALUES
(1, 'Juan Pérez', '12345678', '555-1234', 'juan.perez@email.com', 'Calle Principal #123'),
(2, 'María García', '87654321', '555-5678', 'maria.garcia@email.com', 'Avenida Central #456'),
(3, 'Carlos Rodríguez', '45678901', '555-9012', 'carlos.rodriguez@email.com', 'Plaza Mayor #789'),
(4, 'Ana Martínez', '23456789', '555-3456', 'ana.martinez@email.com', 'Calle Secundaria #234'),
(5, 'Luis Fernández', '67890123', '555-7890', 'luis.fernandez@email.com', 'Boulevard Principal #567')
ON DUPLICATE KEY UPDATE 
    nombre_apellido = VALUES(nombre_apellido),
    cedula_identidad = VALUES(cedula_identidad),
    celular = VALUES(celular),
    correo_electronico = VALUES(correo_electronico);

-- Insertar Ventas de Ejemplo
INSERT INTO ventas (id_venta, numero_boleta, id_cliente, id_usuario, total_venta, fecha_venta) VALUES
(1, 'BOL-0001', 1, 1, 499.99, '2024-01-07 10:30:00'),
(2, 'BOL-0002', 2, 1, 899.99, '2024-01-07 11:15:00'),
(3, 'BOL-0003', 3, 1, 1199.98, '2024-01-07 14:20:00')
ON DUPLICATE KEY UPDATE 
    id_cliente = VALUES(id_cliente),
    total_venta = VALUES(total_venta),
    fecha_venta = VALUES(fecha_venta);

-- Insertar Detalles de Ventas
INSERT INTO detalle_venta (id_detalle_venta, id_venta, id_producto, cantidad, precio_venta) VALUES
(1, 1, 1, 1, 499.99),
(2, 2, 2, 1, 899.99),
(3, 3, 1, 1, 499.99),
(4, 3, 2, 1, 699.99)
ON DUPLICATE KEY UPDATE 
    id_producto = VALUES(id_producto),
    cantidad = VALUES(cantidad),
    precio_venta = VALUES(precio_venta);

-- Insertar Servicios Técnicos de Ejemplo
INSERT INTO servicios_tecnicos (id_servicio, numero_servicio, id_cliente, id_usuario, descripcion_problema, estado, id_sucursal, id_categoria) VALUES
(1, 'ST-0001', 1, 1, 'Pantalla rota, necesita reemplazo', 'Para Retirar', 1, 6),
(2, 'ST-0002', 2, 1, 'No enciende, posible problema de batería', 'En Reparación', 1, 6),
(3, 'ST-0003', 3, 1, 'Teclado no funciona correctamente', 'Entregado', 1, 7)
ON DUPLICATE KEY UPDATE 
    id_cliente = VALUES(id_cliente),
    id_usuario = VALUES(id_usuario),
    descripcion_problema = VALUES(descripcion_problema),
    estado = VALUES(estado),
    id_categoria = VALUES(id_categoria);

-- =====================================================
-- STORED PROCEDURES ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento para obtener reporte de ventas por rango de fechas
CREATE PROCEDURE sp_reporte_ventas_fecha(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        v.id_venta,
        v.numero_boleta,
        v.fecha_venta,
        v.total_venta,
        cl.nombre_apellido AS nombre_cliente,
        u.nombre_apellido AS nombre_vendedor,
        s.nombre AS sucursal,
        COUNT(dv.id_detalle_venta) AS num_productos,
        SUM(dv.cantidad) AS total_unidades
    FROM ventas v
    LEFT JOIN clientes cl ON v.id_cliente = cl.id_cliente
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    JOIN sucursales s ON u.id_sucursal = s.id_sucursal
    LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
    WHERE v.fecha_venta BETWEEN fecha_inicio AND fecha_fin
    GROUP BY v.id_venta
    ORDER BY v.fecha_venta DESC;
END//

-- Procedimiento para obtener productos con bajo stock
CREATE PROCEDURE sp_productos_bajo_stock(
    IN stock_minimo INT DEFAULT 10
)
BEGIN
    SELECT 
        p.id_producto,
        p.nombre_producto,
        p.codigo_barras,
        c.nombre_categoria,
        i.cantidad,
        p.precio,
        s.nombre AS sucursal
    FROM inventario i
    JOIN productos p ON i.id_producto = p.id_producto
    JOIN categorias c ON p.id_categoria = c.id_categoria
    JOIN sucursales s ON i.id_sucursal = s.id_sucursal
    WHERE i.cantidad <= stock_minimo
    ORDER BY i.cantidad ASC;
END//

-- Procedimiento para obtener KPIs del dashboard
CREATE PROCEDURE sp_dashboard_kpis()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM ventas WHERE DATE(fecha_venta) = CURDATE()) AS ventas_hoy,
        (SELECT COUNT(*) FROM clientes) AS total_clientes,
        (SELECT COUNT(*) FROM productos) AS total_productos,
        (SELECT COUNT(*) FROM productos p 
         JOIN inventario i ON p.id_producto = i.id_producto 
         WHERE i.cantidad <= 10 GROUP BY i.id_producto) AS productos_bajo_stock,
        (SELECT COUNT(*) FROM servicios_tecnicos WHERE estado = 'En Reparación') AS servicios_pendientes,
        (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) AS usuarios_activos;
END//

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para búsquedas frecuentes
CREATE INDEX idx_ventas_fecha_cliente ON ventas(fecha_venta, id_cliente);
CREATE INDEX idx_detalle_venta_producto_precio ON detalle_venta(id_producto, precio_venta);
CREATE INDEX idx_servicios_fecha_estado ON servicios_tecnicos(fecha_inicio, estado);
CREATE INDEX idx_productos_categoria_precio ON productos(id_categoria, precio);

-- Índices FULLTEXT para búsquedas
ALTER TABLE productos ADD FULLTEXT(nombre_producto, descripcion);
ALTER TABLE clientes ADD FULLTEXT(nombre_apellido);

-- =====================================================
-- VISTA FINAL DE VERIFICACIÓN
-- =====================================================

SELECT 'Base de datos MultiCentro Matias creada exitosamente' AS mensaje,
       NOW() AS fecha_creacion,
       VERSION() AS version_mysql;

-- Consultas de verificación
SELECT 'Roles' AS tabla, COUNT(*) AS registros FROM roles
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
-- FIN DEL SCRIPT
-- =====================================================