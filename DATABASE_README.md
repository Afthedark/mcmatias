# SQL Completo de la Base de Datos - MultiCentro Matias

## 📁 Archivo Creado
✅ **`database_complete.sql`** - Script completo de MySQL

## 🗄️ Estructura Incluida

### **Tablas Principales (8 tablas)**
- `roles` - Roles de usuarios (cajero, técnico, administrador, etc.)
- `sucursales` - Sucursales del negocio
- `categorias` - Categorías para productos y servicios
- `usuarios` - Usuarios del sistema con contraseña hasheada
- `clientes` - Clientes del negocio
- `productos` - Productos con categorías y precios
- `inventario` - Inventario por sucursal
- `servicios_tecnicos` - Servicios técnicos con múltiples fotos

### **Tablas de Transacciones (2 tablas)**
- `ventas` - Ventas generales
- `detalle_venta` - Detalles de cada venta

### **Vistas Útiles (3 vistas)**
- `vista_inventario_sucursal` - Inventario detallado con estado de stock
- `vista_ventas_detalle` - Ventas con información completa
- `vista_servicios_detalle` - Servicios técnicos con estado y técnico

### **Triggers Automáticos (3 triggers)**
- `tr_calcular_subtotal_venta` - Calcula y valida precios
- `tr_actualizar_inventario_venta` - Descuenta stock automáticamente
- `tr_restaurar_inventario_cancelacion` - Restaura stock si se cancela venta

### **Stored Procedures (3 procedimientos)**
- `sp_reporte_ventas_fecha()` - Reporte de ventas por rango
- `sp_productos_bajo_stock()` - Productos con bajo inventario
- `sp_dashboard_kpis()` - KPIs para dashboard principal

## 🔧 Características Avanzadas

### **Seguridad**
- ✅ Contraseñas hasheadas con bcrypt (`$2b$10$...`)
- ✅ Claves foráneas con restricciones ON DELETE/UPDATE
- ✅ Índices únicos en campos críticos
- ✅ Validación de stock en tiempo real

### **Optimización**
- ✅ Índices compuestos para consultas frecuentes
- ✅ Índices FULLTEXT para búsquedas de texto
- ✅ Triggers automáticos para mantener consistencia
- ✅ Vistas predefinidas para reporting

### **Datos de Ejemplo**
- ✅ 4 roles predefinidos
- ✅ 1 sucursal principal
- ✅ 10 categorías (5 productos, 5 servicios)
- ✅ 8 productos de ejemplo
- ✅ 5 clientes de ejemplo
- ✅ 3 ventas de ejemplo
- ✅ 3 servicios técnicos de ejemplo
- ✅ 1 usuario administrador con contraseña: `admin123`

## 🚀 Cómo Usar

### **Opción 1: Importar con MySQL Workbench**
```bash
# 1. Abre MySQL Workbench
# 2. Crea la base de datos
CREATE DATABASE tienda_multicentro_matias;
USE tienda_multicentro_matias;

# 3. Importa el archivo
File > Run SQL Script > database_complete.sql
```

### **Opción 2: Importar con línea de comandos**
```bash
mysql -u root -p tienda_multicentro_matias < database_complete.sql
```

### **Opción 3: Usar phpMyAdmin (cPanel)**
1. Ingresa a phpMyAdmin
2. Crea la base de datos: `tienda_multicentro_matias`
3. Selecciona la base de datos
4. Carga el archivo `database_complete.sql`

## 📋 Credenciales Iniciales

### **Usuario Administrador**
- **Email**: `admin@multicentromatias.com`
- **Contraseña**: `admin123`
- **Rol**: `administrador`
- **Sucursal**: `Casa Matriz`

### **Usuarios Predefinidos**
- El hash de contraseña está incluido en el SQL
- Puedes crear nuevos usuarios o usar el existente

## 🔄 Como Migrar del Backend

### **Si quieres dejar de usar Sequelize:**
1. **Ejecuta este SQL** para crear la estructura
2. **Modifica tu backend** para usar consultas SQL nativas
3. **Elimina los archivos de modelos** si ya no los necesitas
4. **Actualiza las rutas** para trabajar con SQL

### **Si quieres seguir con Sequelize:**
1. Usa este SQL como **referencia** de la estructura
2. Compara con tus modelos actuales
3. Importa datos de ejemplo si los necesitas

## 🎯 Beneficios de Tener el SQL

### **Ventajas sobre Sequelize:**
- ✅ **Control total** sobre la estructura de datos
- ✅ **Rendimiento superior** con consultas optimizadas
- ✅ **Debugging más fácil** - puedes ejecutar SQL directamente
- ✅ **Backup/Restore** más sencillo
- ✅ **Independencia de frameworks** - menos dependencias
- ✅ **Control de versiones** - puedes trackear cambios de schema

### **Flexibilidad:**
- ✅ **Modificaciones rápidas** - edita SQL y ejecuta
- ✅ **Testing** - puedes probar consultas directamente
- ✅ **Reporting** - vistas y procedimientos listos para usar
- ✅ **Mantenimiento** - triggers automáticos

## 🎛️ Consultas Útiles

### **Verificar datos iniciales:**
```sql
SELECT * FROM usuarios WHERE correo_electronico = 'admin@multicentromatias.com';
SELECT * FROM vista_inventario_sucursal LIMIT 5;
SELECT * FROM vista_ventas_detalle ORDER BY fecha_venta DESC LIMIT 5;
```

### **Ejecutar KPIs del dashboard:**
```sql
CALL sp_dashboard_kpis();
```

### **Ver productos con bajo stock:**
```sql
CALL sp_productos_bajo_stock(10);
```

### **Generar reporte de ventas:**
```sql
CALL sp_reporte_ventas_fecha('2024-01-01', '2024-01-31');
```

---

**🎉 ¡Listo! Ahora tienes una base de datos MySQL completa con toda la estructura, datos de ejemplo, y funcionalidad avanzada lista para usar sin depender de Node.js!**

**📝 Nota**: Guarda este archivo como backup de tu estructura de datos. Puedes modificarlo, extenderlo, y usarlo como base para futuros cambios.