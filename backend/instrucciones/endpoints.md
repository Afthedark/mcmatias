# Guía Completa de Endpoints (Postman / Insomnia)

Esta guía detalla los cuerpos JSON requeridos para operar cada uno de los endpoints del sistema **MCMatias Backend**.

## Configuración Global
- **Base URL**: `http://127.0.0.1:8000/api`
- **Headers Globales**:
    - `Content-Type`: `application/json` (Excepto al subir archivos)
    - `Accept`: `application/json`
    - `Authorization`: `Bearer <tu_access_token>` (Para endpoints protegidos)

## 📋 Características Generales

### 🔐 RBAC (Control de Acceso por Roles)
El sistema implementa control de acceso basado en `numero_rol`:
- **Super Admin (numero_rol=1)**: Acceso global a TODOS los datos de TODAS las sucursales.
- **Otros roles (2+)**: Solo ven/crean datos de SU sucursal asignada.

**Módulos Aislados por Sucursal** 🔒:
- Usuarios, Inventario, Ventas, Servicios Técnicos

**Módulos Globales** 🌍:
- Productos, Clientes, Categorías (visibles para todos)

### Paginación
Todos los endpoints de listado soportan paginación automática:
- **Items por página**: 10
- **Parámetro**: `?page=N`
- **Respuesta** incluye:
  - `count`: Total de registros
  - `next`: URL de la siguiente página (null si es la última)
  - `previous`: URL de la página anterior (null si es la primera)
  - `results`: Array con los items de la página actual

**Ejemplo de respuesta paginada**:
```json
{
  "count": 47,
  "next": "http://127.0.0.1:8000/api/clientes/?page=2",
  "previous": null,
  "results": [
    { "id_cliente": 1, "nombre_apellido": "Juan Pérez", ... },
    // ... 9 items más
  ]
}
```

### Búsqueda Server-Side 🔍
Algunos endpoints soportan búsqueda:
- **Parámetro**: `?search=término`
- **Combinable** con paginación: `?search=juan&page=2`

Endpoints con búsqueda:
- `/clientes/` - Busca en: nombre, CI, celular, email
- `/categorias/` - Busca en: nombre_categoria, tipo

### Métodos HTTP
- **GET**: Listar (con paginación) o ver detalle
- **POST**: Crear nuevo registro
- **PATCH**: Actualizar parcialmente (solo los campos enviados)
- **PUT**: Actualizar completamente (requiere todos los campos)
- **DELETE**: Eliminar registro

---

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
  "access": "eyJhbG...",  // 60 minutos de vida
  "refresh": "eyJhbG..."  // 1 día de vida
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

## 1. Roles (`/api/roles/`)
Gestión de tipos de usuario (ej. Administrador, Vendedor).

### Listar Roles
**GET** `/roles/`

### Crear Rol
**POST** `/roles/`
```json
{
  "nombre_rol": "Administrador",
  "numero_rol": 2
}
```

**Nota**: El campo `numero_rol` define la jerarquía:
- `1` = Super Administrador (acceso global)
- `2+` = Otros roles (acceso restringido a su sucursal)

### Actualizar Rol (Parcial)
**PATCH** `/roles/1/`
```json
{
  "nombre_rol": "Super Administrador",
  "numero_rol": 1
}
```

### Eliminar Rol
**DELETE** `/roles/1/`

---

## 2. Sucursales (`/sucursales/`)
Tiendas físicas o puntos de venta.

### Listar Sucursales
**GET** `/sucursales/`

### Crear Sucursal
**POST** `/sucursales/`
```json
{
  "nombre": "Sucursal Centro",
  "direccion": "Av. Principal #123",
  "activo": true
}
```

### Actualizar Sucursal (Parcial)
**PATCH** `/sucursales/1/`
```json
{
  "activo": false
}
```

---

## 3. Categorías (`/categorias/`) 🔍

Clasificación de productos o servicios con **búsqueda** y **filtro por tipo**.

### Listar Todas las Categorías
**GET** `/categorias/`

### Filtrar por Tipo
**GET** `/categorias/?tipo=producto`
**GET** `/categorias/?tipo=servicio`

### Buscar Categorías
**GET** `/categorias/?search=laptop`

### Combinar Filtro y Búsqueda
**GET** `/categorias/?tipo=servicio&search=reparacion&page=1`

### Crear Categoría
**POST** `/categorias/`
```json
{
  "nombre_categoria": "Laptops",
  "tipo": "producto"
}
```

**Valores válidos para `tipo`**:
- `"producto"` - Para categorías de productos
- `"servicio"` - Para categorías de servicios técnicos

### Actualizar Categoría (Parcial)
**PATCH** `/categorias/1/`
```json
{
  "nombre_categoria": "Laptops Gaming"
}
```

---

## 4. Usuarios (`/usuarios/`) 🔒
Usuarios del sistema con acceso al login.
- Requiere `id_rol` y `id_sucursal` existentes.
- **RBAC**: Solo verás usuarios de TU sucursal (excepto Super Admin que ve todos).

### Listar Usuarios
**GET** `/usuarios/?page=1`

**Comportamiento**:
- Super Admin: Ve TODOS los usuarios.
- Otros: Solo ven compañeros de su sucursal.

### Crear Usuario
**POST** `/usuarios/`
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

### Actualizar Usuario (Parcial)
**PATCH** `/usuarios/1/`
```json
{
  "activo": false,
  "id_sucursal": 2
}
```

---

## 5. Clientes (`/clientes/`) 🔍

Personas que compran o solicitan servicios con **búsqueda** en múltiples campos.

### Listar Clientes
**GET** `/clientes/?page=1`

### Buscar Clientes
**GET** `/clientes/?search=juan`
**GET** `/clientes/?search=12345678`  (por CI)
**GET** `/clientes/?search=70000000`  (por celular)
**GET** `/clientes/?search=@gmail`    (por email)

**Campos de búsqueda**:
- `nombre_apellido`
- `cedula_identidad`
- `celular`
- `correo_electronico`

### Crear Cliente
**POST** `/clientes/`
```json
{
  "nombre_apellido": "María González",
  "cedula_identidad": "12345678",
  "celular": "+591 70000000",
  "correo_electronico": "maria@email.com",
  "direccion": "Calle Falsa 123"
}
```

**Nota**: Solo `nombre_apellido` es requerido, los demás campos son opcionales.

### Actualizar Cliente (Parcial)
**PATCH** `/clientes/1/`
```json
{
  "celular": "+591 71111111",
  "direccion": "Nueva Dirección 456"
}
```

---

## 6. Productos (`/productos/`)
Inventario general (catálogo).
- Requiere `id_categoria`.
- Soporta subida de imágenes.

### Listar Productos
**GET** `/productos/?page=1`

### Crear Producto (con JSON)
**POST** `/productos/`
```json
{
  "nombre_producto": "MacBook Pro M3",
  "descripcion": "Laptop Apple con chip M3, 16GB RAM",
  "codigo_barras": "PER-MAC-001",
  "precio": 2500.00,
  "id_categoria": 1
}
```

### Crear Producto (con Imagen - FormData)
**POST** `/productos/`

**Body Type**: `form-data`
```
nombre_producto: MacBook Pro M3
descripcion: Laptop Apple con chip M3, 16GB RAM
codigo_barras: PER-MAC-001
precio: 2500.00
id_categoria: 1
foto_producto: [FILE] macbook.jpg
```

### Actualizar Producto (Parcial)
**PATCH** `/productos/1/`
```json
{
  "precio": 2300.00,
  "descripcion": "Laptop Apple M3, 16GB RAM, 512GB SSD"
}
```

### Actualizar Producto con Imagen
**PATCH** `/productos/1/`

**Body Type**: `form-data`
```
precio: 2300.00
foto_producto: [FILE] nueva_imagen.jpg
```

---

## 7. Inventario (`/inventario/`) 🔒
Existencias de un producto en una sucursal específica.
- Relaciona `id_producto` con `id_sucursal`.
- **RBAC**: Solo verás stock de TU sucursal (excepto Super Admin).

### Listar Inventario
**GET** `/inventario/?page=1`

**Comportamiento**:
- Super Admin: Ve inventario de TODAS las sucursales.
- Otros: Solo ven stock de su sucursal.

### Crear Registro de Inventario
**POST** `/inventario/`
```json
{
  "id_producto": 1,
  "id_sucursal": 1,
  "cantidad": 50
}
```

**Auto-Asignación de Sucursal**:
- Si NO eres Super Admin, el sistema **fuerza** `id_sucursal` a tu sucursal automáticamente.
- No necesitas enviar `id_sucursal` (será ignorado si lo envías).

### Actualizar Inventario (Parcial)
**PATCH** `/inventario/1/`
```json
{
  "cantidad": 45
}
```

**Nota**: Al actualizar, `id_producto` e `id_sucursal` no se pueden modificar.

---

## 8. Ventas (`/ventas/`) 🔒
Cabecera de una transacción de venta.
- Se crea primero la venta y luego sus detalles.
- `tipo_pago`: "Efectivo" o "QR"
- **RBAC**: Solo verás ventas de TU sucursal (excepto Super Admin).

### Listar Ventas
**GET** `/ventas/?page=1`

**Comportamiento**:
- Super Admin: Ve ventas de TODAS las sucursales.
- Otros: Solo ven ventas realizadas en su sucursal.

### Crear Venta
**POST** `/ventas/`
```json
{
  "numero_boleta": "B-0001",
  "id_cliente": 1,
  "id_usuario": 1,
  "id_sucursal": 1,
  "total_venta": 150.50,
  "tipo_pago": "Efectivo"
}
```

**Auto-Asignación de Sucursal**:
- Si NO eres Super Admin, el sistema **fuerza** `id_sucursal` a tu sucursal.
- Puedes omitir `id_sucursal` en el JSON (se asigna automáticamente).

**Valores válidos para `tipo_pago`**:
- `"Efectivo"`
- `"QR"`

### Actualizar Venta (Parcial)
**PATCH** `/ventas/1/`
```json
{
  "tipo_pago": "QR",
  "total_venta": 155.00
}
```

---

## 9. Detalle de Ventas (`/detalle_ventas/`)
Renglones de productos dentro de una venta.
- Requiere el ID de la venta creada anteriormente (`id_venta`).

### Listar Detalles
**GET** `/detalle_ventas/?page=1`

### Crear Detalle de Venta
**POST** `/detalle_ventas/`
```json
{
  "id_venta": 1,
  "id_producto": 1,
  "cantidad": 2,
  "precio_venta": 75.25
}
```

### Actualizar Detalle (Parcial)
**PATCH** `/detalle_ventas/1/`
```json
{
  "cantidad": 3,
  "precio_venta": 70.00
}
```

---

## 10. Servicios Técnicos (`/servicios_tecnicos/`) 🔒
Órdenes de reparación o mantenimiento.
- `estado`: 'En Reparación', 'Para Retirar', 'Entregado'.
- **RBAC**: Solo verás servicios de TU sucursal (excepto Super Admin).

### Listar Servicios
**GET** `/servicios_tecnicos/?page=1`

**Comportamiento**:
- Super Admin: Ve servicios de TODAS las sucursales.
- Otros: Solo ven órdenes de su sucursal.

### Crear Servicio Técnico
**POST** `/servicios_tecnicos/`
```json
{
  "numero_servicio": "SRV-2024-001",
  "id_cliente": 1,
  "id_usuario": 1,
  "id_sucursal": 1,
  "id_categoria": 2,
  "descripcion_problema": "Pantalla rota y no carga batería",
  "estado": "En Reparación"
}
```

**Auto-Asignación de Sucursal**:
- Si NO eres Super Admin, el sistema **fuerza** `id_sucursal` a tu sucursal.
- El campo se auto-completa incluso si lo omites.

### Crear Servicio con Foto (FormData)
**POST** `/servicios_tecnicos/`

**Body Type**: `form-data`
```
numero_servicio: SRV-2024-001
id_cliente: 1
id_usuario: 1
id_sucursal: 1
id_categoria: 2
descripcion_problema: Pantalla rota y no carga batería
estado: En Reparación
foto_problema: [FILE] danio.jpg
```

**Valores válidos para `estado`**:
- `"En Reparación"`
- `"Para Retirar"`
- `"Entregado"`

### Actualizar Servicio (Parcial)
**PATCH** `/servicios_tecnicos/1/`
```json
{
  "estado": "Para Retirar"
}
```

---

## 📌 Notas Importantes

1. **PATCH vs PUT**:
   - Usa **PATCH** para actualizar solo campos específicos (recomendado)
   - Usa **PUT** si deseas reemplazar todo el registro (requiere todos los campos)

2. **Paginación**:
   - Todos los listados retornan 10 items por página
   - Usa `?page=N` para navegar entre páginas
   - Revisa `count` para conocer el total de registros

3. **Búsqueda**:
   - Case-insensitive (no distingue mayúsculas/minúsculas)
   - Busca coincidencias parciales
   - Compatible con paginación

4. **Imágenes**:
   - Usa `form-data` en lugar de JSON
   - Campos de imagen: `foto_producto`, `foto_problema`
   - Formatos soportados: JPG, PNG, WebP

5. **Foreign Keys**:
   - Al crear/actualizar, verifica que los IDs existan
   - Al eliminar, verifica que no haya relaciones dependientes

---

## 🔗 Recursos Adicionales

- **Swagger UI**: [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)
- **Backend README**: Ver `readme_backend.md` para configuración
- **Frontend README**: Ver `../frontend/readme_frontend.md` para integración
