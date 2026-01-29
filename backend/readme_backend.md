# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa con **Control de Acceso Basado en Roles (RBAC)** y **Aislamiento Multisucursal**.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0.1
- **API**: Django REST Framework 3.16+
- **Autenticación**: JWT (JSON Web Tokens) vía `djangorestframework-simplejwt`
- **Documentación**: Swagger UI (`drf-spectacular`)
- **Base de Datos**: MySQL / MariaDB
- **Driver**: **PyMySQL** + **cryptography** (Universal, optimizado para **cPanel** y compatible con MariaDB/MySQL 8.0+)
- **Archivos**: **Pillow** (Gestión de imágenes para productos y servicios)
- **Reportes**: **openpyxl** (Excel) y **reportlab** (PDF)
- **Filtros**: **SearchFilter** de DRF para búsquedas server-side
- **Variables de Entorno**: `python-dotenv` (carga automática de `.env`)
- **Producción (VPS)**: `gunicorn` (app server) + `nginx` (proxy inverso para `/static/` y `/media/`)
- **Opcional**: `uvicorn` (ASGI, útil si se requiere)

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal
│   ├── models.py        # Modelos de datos (Producto, Cliente, Inventario, etc.)
│   ├── views.py         # ViewSets con RBAC, paginación y búsqueda
│   ├── views_reports.py # Endpoints de reportes (dashboard, PDF, Excel)
│   ├── serializers.py   # Serializadores con validaciones
│   └── urls.py          # Rutas de API con DefaultRouter
├── config/              # Configuraciones de Django
│   ├── settings.py      # Configuración global (pagination, JWT, CORS)
│   └── urls.py          # URLs principales
├── instrucciones/       # Guías: Setup, Despliegue, Endpoints
│   ├── deployment_cpanel.md # GUÍA PASO A PASO PARA CPANEL
│   ├── endpoints.md     # Ejemplos de JSON para Testing con RBAC
│   ├── setup_guide.md   # Instalación Local
│   └── setup_guide_vps.md # Despliegue en VPS (Gunicorn + Nginx + Systemd)
├── logs/                # Logs de Gunicorn (se mantiene con .gitkeep)
├── media/               # Archivos subidos (Imágenes de productos y servicios)
│   └── uploads/         # Subdirectorio para uploads
├── gunicorn.conf.py     # Configuración de Gunicorn (VPS)
├── run_local.sh         # Script de ejecución local (Linux/WSL)
├── run_prod.sh          # Script de ejecución producción (VPS)
└── requirements.txt     # Dependencias Python
```

## Configuración de Entorno (.env)

Este proyecto lee variables desde `backend/.env` usando `python-dotenv`. Se carga automáticamente al ejecutar:
- Comandos de Django: `manage.py`
- Servidores WSGI/ASGI: `config/wsgi.py`, `config/asgi.py`
- Configuración global: `config/settings.py`

Ejemplo de `.env` mínimo:
```env
DEBUG=False
SECRET_KEY=una_clave_larga_y_secreta

DB_NAME=mcmatias_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306

# Lista separada por comas, sin espacios (ej: 127.0.0.1,localhost,167.86.66.229)
ALLOWED_HOSTS=127.0.0.1,localhost
```

Notas:
- `DEBUG` se evalúa como texto: debe ser exactamente `True` para habilitarlo.
- `ALLOWED_HOSTS` se parsea con comas.

## Instalación Rápida (Local)

```bash
# 1. Crear entorno virtual
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/WSL
# source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar .env con credenciales MySQL

# 4. Aplicar migraciones (crea tablas + Roles + Sucursal automáticamente)
python manage.py migrate

# 5. Crear superusuario (interactivo)
python manage.py createsuperuser

# 6. Correr servidor (desarrollo)
python manage.py runserver
```

**Nota**: El paso 4 (`migrate`) crea automáticamente:
- ✅ Todas las tablas del sistema
- ✅ 5 Roles predefinidos (Super Administrador con numero_rol=1, Administrador, Técnico, Cajero, Técnico y Cajero)
- ✅ Sucursal Central

Esto permite que `createsuperuser` funcione sin errores, asignando automáticamente el rol Super Admin (numero_rol=1) y la Sucursal Central al usuario creado.

### Comando de Setup Alternativo

Si necesitas recrear datos iniciales o crear un superusuario con credenciales predeterminadas:

```bash
python manage.py setup_initial_data --create-superuser
```

Esto crea:
- Roles y Sucursal (si no existen)
- Superusuario: `admin@mcmatias.com` / `admin123` ⚠️ Cambiar en producción


## 🔐 Sistema RBAC (Control de Acceso por Roles)

El sistema implementa un control de acceso basado en el campo **`numero_rol`** del modelo `Rol`.

### Jerarquía de Roles

| `numero_rol` | Nombre del Rol | Acceso |
|--------------|----------------|--------|
| **1** | Super Administrador | 👑 **Acceso Global** - Ve y gestiona TODOS los datos de TODAS las sucursales |
| **2+** | Administrador, Técnico, Cajero, etc. | 🔒 **Acceso Restringido** - Solo ve/gestiona datos de SU sucursal asignada |

### Arquitectura Híbrida de Datos

El sistema clasifica los módulos en dos tipos:

#### 🌍 **Globales (Compartidos entre sucursales)**
Estos datos son visibles para todos los usuarios, independientemente de su rol o sucursal:
- **Productos** - Catálogo unificado
- **Clientes** - Base de datos compartida
- **Categorías** - Organización global

#### 🔒 **Aislados (Por Sucursal)**
Cada usuario solo ve/modifica datos de su propia sucursal (excepto Super Admin que ve todo):
- **Usuarios** - Empleados por sucursal
- **Sucursales** - Cada usuario solo ve su sucursal asignada
- **Inventario** - Stock por sucursal
- **Ventas** - Ventas realizadas en cada sucursal
- **Servicios Técnicos** - Órdenes de servicio por sucursal

### Lógica de Implementación

```python
# Ejemplo de filtrado automático en ViewSets
def get_queryset(self):
    user = self.request.user
    # Super Admin (1): Ve todo
    if user.id_rol.numero_rol == 1:
        return Model.objects.all()
    # Otros: Solo su sucursal
    return Model.objects.filter(id_sucursal=user.id_sucursal)
```

### Auto-Asignación de Sucursal

Al crear registros en módulos aislados, el sistema **auto-asigna** la sucursal del usuario:

```python
def perform_create(self, serializer):
    # Roles normales: Forzar su sucursal
    if self.request.user.id_rol.numero_rol != 1:
        serializer.save(id_sucursal=self.request.user.id_sucursal)
    else:
        # Super Admin: Puede especificar sucursal (opcional)
        serializer.save()
```

## 🔑 Autenticación (JWT)

El sistema utiliza JWT para proteger los endpoints. Puedes obtener tus tokens en:
👉 **POST** `/api/token/` (Ver `instrucciones/endpoints.md` para detalles).

**Configuración de Tokens**:
- **Access Token**: 60 minutos de vida
- **Refresh Token**: 1 día de vida
- Header: `Authorization: Bearer {access_token}`

## 📋 Endpoints Principales

### Autenticación
- **POST** `/api/token/` - Obtener tokens de acceso
- **POST** `/api/token/refresh/` - Refrescar token de acceso

### Perfil de Usuario
- **GET** `/api/perfil/` - Obtener datos del usuario autenticado
- **PATCH** `/api/perfil/` - Actualizar perfil (nombre, email, contraseña)

### Gestión de Datos con RBAC, Paginación y Búsqueda

Todos los ViewSets soportan:
- **RBAC**: Filtrado automático por rol y sucursal
- **Paginación**: 10 items por página por defecto (`?page=2`)
- **Operaciones CRUD**: GET (list/detail), POST, PATCH, DELETE
- **Búsqueda**: Endpoints marcados con 🔍

#### Endpoints Disponibles

| Endpoint | Tipo | Búsqueda | Campos de Búsqueda | RBAC |
|----------|------|----------|-------------------|------|
| `/api/roles/` | Config | ❌ | - | 🔒 **Solo Super Admin** |
| `/api/sucursales/` | Config | ❌ | - | 🔒 **Solo MI sucursal** |
| `/api/categorias/` | 🌍 Global | 🔍 | `nombre_categoria`, `tipo` | Visible para todos |
| `/api/categorias/?tipo=producto` | 🌍 Global | 🔍 | + Filtro por tipo | Visible para todos |
| `/api/categorias/{id}/reactivar/` | Custom Action | ❌ | - | Reactivar categoría inactiva |
| `/api/usuarios/` | 🔒 Aislado | 🔍 | `nombre_apellido`, `correo_electronico` | **Solo users de MI sucursal** |
| `/api/usuarios/{id}/reactivar/` | Custom Action | ❌ | - | Reactivar usuario inactivo |
| `/api/clientes/` | 🌍 Global | 🔍 | `nombre_apellido`, `cedula_identidad`, `celular`, `correo_electronico` | Visible para todos |
| `/api/clientes/{id}/reactivar/` | Custom Action | ❌ | - | Reactivar cliente inactivo |
| `/api/productos/` | 🌍 Global | 🔍 | `nombre_producto`, `codigo_barras`, `descripcion` | Visible para todos |
| `/api/productos/{id}/reactivar/` | Custom Action | ❌ | - | Reactivar producto inactivo |
| `/api/inventario/` | 🔒 Aislado | 🔍 | `id_producto__nombre_producto`, `id_producto__codigo_barras` | **Solo stock de MI sucursal** |
| `/api/ventas/` | 🔒 Aislado | 🔍 | `numero_boleta`, `id_cliente__nombre_apellido`, `id_cliente__cedula_identidad` | **Solo ventas de MI sucursal** |
| `/api/ventas/{id}/anular/` | Custom Action | ❌ | - | PATCH para anular venta |
| `/api/detalle_ventas/` | Relación | ❌ | - | Hereda de Venta |
| `/api/detalle_ventas/?id_venta=X` | Relación | ❌ | - | Filtrado por venta |
| `/api/servicios_tecnicos/` | 🔒 Aislado | 🔍 | `numero_servicio`, `id_cliente__nombre_apellido`, `marca_dispositivo`, `modelo_dispositivo` | **Solo servicios de MI sucursal** |
| `/api/servicios_tecnicos/{id}/anular/` | Custom Action | ❌ | - | PATCH para anular servicio |
| `/api/reportes/ventas/dashboard/` | Reporte | ❌ | - | KPIs + gráficos (ventas) |
| `/api/reportes/ventas/pdf/` | Reporte | ❌ | - | Exportación PDF |
| `/api/reportes/ventas/excel/` | Reporte | ❌ | - | Exportación Excel |
| `/api/reportes/servicios/dashboard/` | Reporte | ❌ | - | KPIs + gráficos (servicios) |
| `/api/reportes/servicios/pdf/` | Reporte | ❌ | - | Exportación PDF |
| `/api/reportes/servicios/excel/` | Reporte | ❌ | - | Exportación Excel |
| `/api/perfil/` | Usuario Auth | ❌ | - | Perfil del usuario autenticado |

**Ejemplo de búsqueda**:
```
GET /api/clientes/?search=juan&page=1
GET /api/categorias/?tipo=servicio&search=reparacion
GET /api/productos/?search=laptop
GET /api/inventario/?search=samsung
GET /api/ventas/?search=juan
GET /api/usuarios/?search=maria
GET /api/detalle_ventas/?id_venta=5
```

**Comportamiento RBAC**:
- **Super Admin (numero_rol=1)**: `GET /api/ventas/` devuelve TODAS las ventas.
- **Cajero (numero_rol=4)**: `GET /api/ventas/` devuelve solo ventas de su sucursal.

## 🎯 Características Implementadas

### RBAC (Role-Based Access Control)
- ✅ Control de acceso por `numero_rol`
- ✅ Filtrado automático por sucursal en módulos aislados
- ✅ Auto-asignación de sucursal al crear registros
- ✅ Super Admin con acceso "Ojo de Dios" (ve todo)
- ✅ **Módulo Roles restringido solo a Super Admin** (numero_rol=1)

### Paginación
- Configurado globalmente en `settings.py`
- 10 items por página
- Respuesta incluye: `count`, `next`, `previous`, `results`

### Búsqueda Server-Side
- Implementada con `SearchFilter` de DRF
- Búsqueda case-insensitive
- Búsqueda en múltiples campos (OR lógico)
- Combinable con filtros (ej. `?tipo=producto&search=laptop`)

### Actualización Parcial (PATCH)
- Todos los endpoints soportan PATCH para updates parciales
- No requiere enviar todos los campos, solo los que cambien

### Filtros Personalizados
- **Categorías**: Filtro por `tipo` vía `get_queryset()`
- Ejemplo: `/api/categorias/?tipo=servicio` devuelve solo servicios técnicos

### Reportes (Ventas y Servicios)
- KPIs agregados por rango de fechas
- Filtro por sucursal disponible para Super Admin
- Exportación a PDF y Excel desde endpoints dedicados

## 📚 Documentación de API (Swagger)

Una vez corriendo el servidor, visita:
👉 **[http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)**

Aquí verás todos los endpoints documentados automáticamente e interactivos para probar.

## ✨ Características Recientes

### Sistema de Inicialización Automática
- ✅ **Data Migration Automática**: La migración `0006_initial_data.py` crea automáticamente Roles y Sucursal al ejecutar `migrate`
- ✅ **Comando de Setup Manual**: `python manage.py setup_initial_data --create-superuser` para inicialización rápida
- ✅ **Createsuperuser Mejorado**: Asigna automáticamente rol Super Admin y sucursal sin requerir inputs adicionales

### RBAC y Multisucursal
- ✅ **RBAC Completo**: Control de acceso por `numero_rol` con aislamiento multisucursal
- ✅ **Campo `numero_rol`**: Agregado al modelo `Rol` para jerarquías numéricas (1=SuperAdmin, 2+=Otros)
- ✅ **Campo `id_sucursal` en Venta**: Para aislamiento correcto de ventas por sucursal
- ✅ **Auto-Asignación de Sucursal**: Al crear inventario, ventas o servicios, se asigna automáticamente la sucursal del usuario
- ✅ **Restricción de Módulo Roles**: Solo Super Admin puede acceder al endpoint `/api/roles/`

### API y Frontend
- ✅ **Endpoint de Perfil**: `/api/perfil/` con actualización parcial (PATCH) y validación de contraseñas
- ✅ **Paginación Universal**: 10 items/página en todos los endpoints
- ✅ **Búsqueda Server-Side**: Implementado en Categorías, Clientes, Productos, Inventario, Ventas, Usuarios y Servicios
- ✅ **Productos Searchable**: Búsqueda por `nombre_producto`, `codigo_barras`, `descripcion`
- ✅ **Serializers Enriquecidos**: Productos incluye `nombre_categoria`, Inventario incluye `nombre_producto` y `nombre_sucursal`
- ✅ **Ventas Enriquecidas**: VentaSerializer incluye `nombre_cliente`, `nombre_usuario`, `nombre_sucursal`
- ✅ **DetalleVenta Enriquecido**: Incluye `nombre_producto` para facilitar visualización
- ✅ **Campo `tipo_pago`**: En modelo Ventas (Efectivo/QR)

### Sistema de Soft Delete (Borrado Lógico)
- ✅ **Campo `activo`**: Implementado en Productos, Clientes, Categorías, Sucursales y **Usuarios**
- ✅ **Productos**:
  - DELETE hace soft delete (marca como inactivo)
  - Valida stock = 0 en TODAS las sucursales antes de eliminar
  - Muestra mensaje detallado con stock por sucursal si hay inventario
  - Endpoint `PATCH /api/productos/{id}/reactivar/` para reactivar
  - Parámetro `?incluir_inactivos=true` para ver todos
- ✅ **Clientes**:
  - DELETE hace soft delete (marca como inactivo)
  - Endpoint `PATCH /api/clientes/{id}/reactivar/` para reactivar
  - Parámetro `?incluir_inactivos=true` para ver todos
- ✅ **Categorías**:
  - DELETE hace soft delete (marca como inactiva)
  - Endpoint `PATCH /api/categorias/{id}/reactivar/` para reactivar
  - Parámetro `?incluir_inactivas=true` para ver todas
- ✅ **Usuarios**:
  - DELETE hace soft delete (marca como inactivo)
  - Endpoint `PATCH /api/usuarios/{id}/reactivar/` para reactivar usuarios inactivos
  - **Bloqueo de login**: Usuarios inactivos NO pueden iniciar sesión (validación en endpoint `/api/token/`)
  - Parámetro `?incluir_inactivos=true` para ver todos

### Módulo de Ventas
- ✅ **Auto-generación de `numero_boleta`**: Formato `VTA-YYYY-XXXXX` con secuencia anual automática
- ✅ **Auto-asignación de Usuario y Sucursal**: Al crear venta se asigna automáticamente el usuario autenticado
- ✅ **Sistema de Anulación de Ventas**:
  - Campo `estado` (Completada/Anulada)
  - Campo `motivo_anulacion` y `fecha_anulacion`
  - Endpoint custom `PATCH /api/ventas/{id}/anular/` que restaura inventario automáticamente
  - Validación para evitar doble anulación
- ✅ **Gestión Automática de Stock**:
  - Validación de stock disponible antes de confirmar venta
  - Descuento automático de inventario al crear DetalleVenta
  - Restauración automática de stock al anular venta
  - Filtrado por `id_venta` en endpoint de detalles: `/api/detalle_ventas/?id_venta=X`
- ✅ **Búsqueda de Ventas**: Por número de boleta, nombre del cliente o cédula

### Sistema de Numeración Automática
- ✅ **ServicioTecnico**: Auto-genera `numero_servicio` con formato `ST-YYYY-XXXXX`
- ✅ **Venta**: Auto-genera `numero_boleta` con formato `VTA-YYYY-XXXXX`
- ✅ **Secuencias anuales**: Los contadores se reinician automáticamente cada año
- ✅ **Implementado en modelos**: Se genera dentro del método `save()` de cada modelo

### Módulo de Servicios Técnicos
- ✅ **CRUD Completo**: Crear, leer, actualizar servicios técnicos
- ✅ **Auto-generación de `numero_servicio`**: Formato `ST-YYYY-XXXXX` con secuencia anual
- ✅ **Auto-asignación de Usuario y Sucursal**: Al crear servicio se asigna automáticamente
- ✅ **Sistema de Anulación de Servicios**:
  - Campo `estado` (En Reparación/Para Retirar/Entregado/Anulado)
  - Endpoint custom `PATCH /api/servicios_tecnicos/{id}/anular/`
  - **Roles permitidos**: 1 (Super Admin), 2 (Administrador), 5 (Técnico y Cajero)
  - Rol 4 (Cajero) **NO** puede anular servicios
  - Validación para evitar doble anulación
- ✅ **Upload de Imágenes**: Hasta 3 fotos por servicio (`foto_1`, `foto_2`, `foto_3`)
- ✅ **Información del Dispositivo**: Marca, modelo, descripción del problema
- ✅ **Categorización**: FK a categorías tipo "servicio"
- ✅ **RBAC Completo**: Cada sucursal ve solo sus servicios (Super Admin ve todos)
- ✅ **Búsqueda de Servicios**: Por número de servicio, cliente, marca o modelo del dispositivo


## 🔧 Modelos de Datos

### Rol
- `id_rol` (PK)
- `nombre_rol` (String, Unique)
- **`numero_rol`** (Integer, Unique) - Para jerarquías (1=SuperAdmin, 2+=Otros)

### Usuario
- `id_usuario` (PK)
- `nombre_apellido` (String)
- `correo_electronico` (Email, Unique)
- `password` (Hashed)
- `id_rol` (FK → Rol)
- `id_sucursal` (FK → Sucursal)
- **`activo`** (Boolean, default=True) - Para soft delete

### Principales Relaciones
- **Usuario** → Rol (FK), Sucursal (FK)
- **Producto** → Categoría (FK)
- **Inventario** → Producto (FK), Sucursal (FK) - Unique together
- **Venta** → Usuario (FK), Cliente (FK), Sucursal (FK)
- **DetalleVenta** → Venta (FK), Producto (FK)
- **ServicioTecnico** → Cliente (FK), Usuario (FK), Sucursal (FK), Categoría (FK)

### Campos de Imagen
- **Producto**: `foto_producto` (opcional)
- **ServicioTecnico**: `foto_1`, `foto_2`, `foto_3` (opcionales)
- **Upload Path**: `media/uploads/images/`

## ☁️ Despliegue en Producción

Este repositorio incluye dos caminos de despliegue:
- **VPS (Linux) con Gunicorn + Nginx + Systemd**: ver `instrucciones/setup_guide_vps.md`
- **cPanel**: ver `instrucciones/deployment_cpanel.md`

### Gunicorn (VPS)

El backend incluye configuración y scripts listos:
- Configuración: `gunicorn.conf.py`
- Desarrollo Linux/WSL: `run_local.sh`
- Producción VPS: `run_prod.sh`

Ejecución mínima:
```bash
gunicorn --config gunicorn.conf.py
```

Logs:
- Gunicorn escribirá en `backend/logs/access.log` y `backend/logs/error.log` (carpeta `logs/` existe con `.gitkeep`).

### Static/Media en Producción (Importante)

En `config/urls.py` los archivos media se sirven automáticamente solo cuando `DEBUG=True`.

En producción:
- Ejecuta `python manage.py collectstatic --noinput` para `/static/`.
- Configura **Nginx** para servir:
  - `location /static/ { alias .../staticfiles/; }`
  - `location /media/ { alias .../media/; }`
- Gunicorn debe encargarse solo de la aplicación Python (API).

**Recomendaciones**:
- Configura `DEBUG=False` en producción
- Usa `collectstatic` para archivos estáticos
- Configura `ALLOWED_HOSTS` correctamente (incluye tu IP o dominio)
- Usa HTTPS en producción
- **Asigna correctamente `numero_rol=1` solo al Super Admin**
