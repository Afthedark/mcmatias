# Guía de Llenado de Datos Manual - MCMatias

Este documento explica cómo poblar tu base de datos manualmente utilizando **Postman** (o la interfaz web de Django REST Framework).

## 💡 Orden de Llenado (Muy Importante)

Debido a las **Llaves Foráneas (Foreign Keys)**, no puedes llenar las tablas en cualquier orden. Debes seguir este flujo para evitar errores de integridad:

1.  **Roles**: Crea primero los roles (Admin, Vendedor).
2.  **Sucursales**: Registra las tiendas físicas.
3.  **Categorías**: Define las categorías de tus productos y servicios.
4.  **Usuarios**: Crea los usuarios asignándoles un Rol y una Sucursal.
5.  **Clientes**: Registra a tus clientes.
6.  **Productos**: Crea el catálogo (requiere Categoría).
7.  **Inventario**: Asigna stock de productos a sucursales concretas.
8.  **Ventas**: Registra la cabecera de la venta.
9.  **Detalle Ventas**: Agrega los productos a la venta creada.
10. **Servicios Técnicos**: Registra órdenes de reparación.

---

## 🛠 Cómo llenar desde Postman

### Configuración Global
- **URL Base**: `http://127.0.0.1:8000/api`
- **Headers**:
    - `Content-Type`: `application/json`
    - `Authorization`: `Bearer <TU_TOKEN>` (Si el acceso está restringido)

### 🔑 Paso 0: Obtener Token (Login)
Antes de empezar a llenar datos, obtén tu token de acceso enviando tus credenciales a:
`POST /api/token/`
```json
{
  "correo_electronico": "admin@mcmatias.com",
  "password": "tu_password"
}
```
Copia el valor de `access` y úsalo en el header **Authorization** de las siguientes peticiones como `Bearer <TOKEN>`.

### 1. Crear Roles (`POST /api/roles/`)
```json
{
  "nombre_rol": "Administrador"
}
```

### 2. Crear Sucursales (`POST /api/sucursales/`)
```json
{
  "nombre": "MCMatias Central",
  "direccion": "Calle Falsa 123",
  "activo": true
}
```

### 3. Crear Usuarios (`POST /api/usuarios/`)
*Nota: El password se encriptará automáticamente.*
```json
{
    "nombre_apellido": "Admin Sistema",
    "correo_electronico": "admin@mcmatias.com",
    "password": "adminpassword123",
    "id_rol": 1,
    "id_sucursal": 1,
    "activo": true
}
```

### 4. Crear Productos con Imagen (`POST /api/productos/`)
**Importante:** Para subir la imagen en Postman:
1.  Usa el Body tipo **form-data**.
2.  Campos `nombre_producto`, `precio`, `id_categoria` como **Text**.
3.  Campo `foto_producto` cámbialo a tipo **File** y selecciona tu imagen.

### 5. Registrar Inventario (`POST /api/inventario/`)
```json
{
  "id_producto": 1,
  "id_sucursal": 1,
  "cantidad": 100
}
```

---

## 🔍 Consejos útiles
- **Ver IDs**: Antes de crear un Usuario, haz un `GET` a `/api/roles/` para ver qué ID tiene el rol que creaste (normalmente es el `1`).
- **Nombres exactos**: Respeta las mayúsculas y minúsculas en los nombres de los campos.
- **Errores**: Si recibes un error `400 Bad Request`, revisa que no falte ningún campo obligatorio o que el ID que estás enviando (como `id_sucursal`) realmente exista.
