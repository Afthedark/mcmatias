# Guía Completa de Endpoints (Postman / Insomnia)

Esta guía detalla los cuerpos JSON requeridos para operar cada uno de los endpoints del sistema **MCMatias Backend**.

## Configuración Global
- **Base URL**: `http://127.0.0.1:8000/api`
- **Headers Globales**:
    - `Content-Type`: `application/json` (Excepto al subir archivos)
    - `Accept`: `application/json`
    - `Authorization`: `Bearer <tu_access_token>` (Para endpoints protegidos)

## 🔑 Autenticación (JWT)

Para acceder a los recursos, primero debes obtener un token.

### Login (Obtener Token)
**POST** `/token/`
```json
{
  "correo_electronico": "admin@mcmatias.com",
  "password": "tu_password_aqui"
}
```
**Respuesta:**
```json
{
  "access": "eyJhbG...",
  "refresh": "eyJhbG..."
}
```

### Refrescar Token
**POST** `/token/refresh/`
```json
{
  "refresh": "tu_refresh_token_aqui"
}
```

---

## 👤 Perfil de Usuario (`/perfil/`)

Gestión del perfil del usuario autenticado actualmente.

### Obtener Perfil Actual
**GET** `/perfil/`

**Headers:**
- `Authorization`: `Bearer <tu_access_token>`

**Respuesta:**
```json
{
  "id_usuario": 1,
  "nombre_apellido": "Admin Sistema",
  "correo_electronico": "admin@mcmatias.com"
}
```

### Actualizar Perfil
**PATCH** `/perfil/`

**Headers:**
- `Authorization`: `Bearer <tu_access_token>`
- `Content-Type`: `application/json`

**Body (Actualizar solo nombre y email):**
```json
{
  "nombre_apellido": "Nuevo Nombre",
  "correo_electronico": "nuevo@email.com"
}
```

**Body (Actualizar con contraseña):**
```json
{
  "nombre_apellido": "Nuevo Nombre",
  "correo_electronico": "nuevo@email.com",
  "password": "nueva_contraseña_segura",
  "confirm_password": "nueva_contraseña_segura"
}
```

**Notas:**
- Todos los campos son opcionales en PATCH (actualización parcial)
- Si incluyes `password`, debes incluir también `confirm_password`
- La contraseña debe tener al menos 4 caracteres
- Las contraseñas deben coincidir

---

> **IMPORTANTE PARA SUBIDA DE IMÁGENES**:
> Cuando uses endpoints que requieren subir fotos (`/productos/` o `/servicios_tecnicos/`), **NO** uses JSON.
> En Postman, selecciona **Body** -> **form-data**.
> - Escribe los campos de texto (ej. `nombre_producto`) como texto.
> - Escribe el campo de imagen (ej. `foto_producto`) y cambia el tipo de "Text" a **"File"** para seleccionar tu archivo.

---

## 1. Roles (`/roles/`)
Gestión de tipos de usuario (ej. Administrador, Vendedor).

**POST / PUT Body:**
```json
{
  "nombre_rol": "Administrador"
}
```

---

## 2. Sucursales (`/sucursales/`)
Tiendas físicas o puntos de venta.

**POST / PUT Body:**
```json
{
  "nombre": "Sucursal Centro",
  "direccion": "Av. Principal #123",
  "activo": true
}
```

---

## 3. Categorías (`/categorias/`)
Clasificación de productos o servicios.
- `tipo`: Puede ser 'producto' o 'servicio'.

**POST / PUT Body:**
```json
{
  "nombre_categoria": "Laptops",
  "tipo": "producto"
}
```

---

## 4. Usuarios (`/usuarios/`)
Usuarios del sistema con acceso al login.
- Requiere `id_rol` y `id_sucursal` existentes.

**POST Body:**
```json
{
  "nombre_apellido": "Juan Pérez",
  "correo_electronico": "juan@mcmatias.com",
  "password": "securePassword123",
  "id_rol": 1,
  "id_sucursal": 1,
  "activo": true
}
```

---

## 5. Clientes (`/clientes/`)
Personas que compran o solicitan servicios.

**POST / PUT Body:**
```json
{
  "nombre_apellido": "María González",
  "cedula_identidad": "12345678",
  "celular": "+591 70000000",
  "correo_electronico": "maria@email.com",
  "direccion": "Calle Falsa 123"
}
```

---

## 6. Productos (`/productos/`)
Inventario general (catálogo).
- Requiere `id_categoria`.

**POST / PUT Body:**
```json
{
  "nombre_producto": "MacBook Pro M3",
  "descripcion": "Laptop Apple con chip M3, 16GB RAM",
  "codigo_barras": "PER-MAC-001",
  "precio": 2500.00,
  "id_categoria": 1,
  "foto_producto": "url_o_path_de_la_imagen.jpg"
}
```

---

## 7. Inventario (`/inventario/`)
Existencias de un producto en una sucursal específica.
- Relaciona `id_producto` con `id_sucursal`.

**POST / PUT Body:**
```json
{
  "id_producto": 1,
  "id_sucursal": 1,
  "cantidad": 50
}
```

---

## 8. Ventas (`/ventas/`)
Cabecera de una transacción de venta.
- Se crea primero la venta y luego sus detalles.
- `tipo_pago`: "Efectivo" o "QR"

**POST Body:**
```json
{
  "numero_boleta": "B-0001",
  "id_cliente": 1,
  "id_usuario": 1,
  "total_venta": 150.50,
  "tipo_pago": "Efectivo"
}
```

---

## 9. Detalle de Ventas (`/detalle_ventas/`)
Renglones de productos dentro de una venta.
- Requiere el ID de la venta creada anteriormente (`id_venta`).

**POST Body:**
```json
{
  "id_venta": 1,
  "id_producto": 1,
  "cantidad": 2,
  "precio_venta": 75.25
}
```

---

## 10. Servicios Técnicos (`/servicios_tecnicos/`)
Órdenes de reparación o mantenimiento.
- `estado`: 'En Reparación', 'Para Retirar', 'Entregado'.

**POST Body:**
```json
{
  "numero_servicio": "SRV-2024-001",
  "id_cliente": 1,
  "id_usuario": 1,
  "id_sucursal": 1,
  "id_categoria": 2,
  "descripcion_problema": "Pantalla rota y no carga batería",
  "estado": "En Reparación",
  "foto_1": "ruta/foto_danio.jpg"
}
```

