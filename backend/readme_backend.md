# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa con **Control de Acceso Basado en Roles (RBAC)** y **Aislamiento Multisucursal**.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0
- **API**: Django REST Framework 3.16+
- **Autenticación**: JWT (JSON Web Tokens) vía `djangorestframework-simplejwt`
- **Documentación**: Swagger UI (`drf-spectacular`)
- **Base de Datos**: MySQL / MariaDB
- **Driver**: **PyMySQL** + **cryptography** (Universal, optimizado para **cPanel** y compatible con MariaDB/MySQL 8.0+)
- **Archivos**: **Pillow** (Gestión de imágenes para productos y servicios)
- **Filtros**: **SearchFilter** de DRF para búsquedas server-side

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal
│   ├── models.py        # Modelos de datos (Producto, Cliente, Inventario, etc.)
│   ├── views.py         # ViewSets con RBAC, paginación y búsqueda
│   ├── serializers.py   # Serializadores con validaciones
│   └── urls.py          # Rutas de API con DefaultRouter
├── config/              # Configuraciones de Django
│   ├── settings.py      # Configuración global (pagination, JWT, CORS)
│   └──urls.py          # URLs principales
├── instrucciones/       # Guías: Setup, Despliegue, Endpoints
│   ├── deployment_cpanel.md # GUÍA PASO A PASO PARA CPANEL
│   ├── endpoints.md     # Ejemplos de JSON para Testing con RBAC
│   └── setup_guide.md   # Instalación Local
├── media/               # Archivos subidos (Imágenes de productos y servicios)
│   └── uploads/         # Subdirectorio para uploads
└── requirements.txt     # Dependencias Python
```

## 🚀 Instalación Rápida

```bash
# 1. Crear entorno virtual
python -m venv venv
.\venv\Scripts\activate  # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar .env con credenciales MySQL

# 4. Aplicar migraciones (crea tablas + Roles + Sucursal automáticamente)
python manage.py migrate

# 5. Crear superusuario (interactivo)
python manage.py createsuperuser

# 6. Correr servidor
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
| `/api/roles/` | Config | ❌ | - | 🌍 Global |
| `/api/sucursales/` | Config | ❌ | - | 🌍 Global |
| `/api/categorias/` | 🌍 Global | 🔍 | `nombre_categoria`, `tipo` | Visible para todos |
| `/api/categorias/?tipo=producto` | 🌍 Global | 🔍 | + Filtro por tipo | Visible para todos |
| `/api/usuarios/` | 🔒 Aislado | ❌ | - | **Solo users de MI sucursal** |
| `/api/clientes/` | 🌍 Global | 🔍 | `nombre_apellido`, `cedula_identidad`, `celular`, `correo_electronico` | Visible para todos |
| `/api/productos/` | 🌍 Global | 🔍 | `nombre_producto`, `codigo_barras`, `descripcion` | Visible para todos |
| `/api/inventario/` | 🔒 Aislado | ❌ | - | **Solo stock de MI sucursal** |
| `/api/ventas/` | 🔒 Aislado | ❌ | - | **Solo ventas de MI sucursal** |
| `/api/detalle_ventas/` | Relación | ❌ | - | Hereda de Venta |
| `/api/servicios_tecnicos/` | 🔒 Aislado | ❌ | - | **Solo servicios de MI sucursal** |

**Ejemplo de búsqueda**:
```
GET /api/clientes/?search=juan&page=1
GET /api/categorias/?tipo=servicio&search=reparacion
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

### API y Frontend
- ✅ **Endpoint de Perfil**: `/api/perfil/` con actualización parcial (PATCH) y validación de contraseñas
- ✅ **Paginación Universal**: 10 items/página en todos los endpoints
- ✅ **Búsqueda Server-Side**: Implementado en Categorías, Clientes y Productos
- ✅ **Productos Searchable**: Búsqueda por `nombre_producto`, `codigo_barras`, `descripcion`
- ✅ **Serializers Enriquecidos**: Productos incluye `nombre_categoria`, Inventario incluye `nombre_producto` y `nombre_sucursal`
- ✅ **Ventas Enriquecidas**: VentaSerializer incluye `nombre_cliente`, `nombre_usuario`, `nombre_sucursal`
- ✅ **DetalleVenta Enriquecido**: Incluye `nombre_producto` para facilitar visualización
- ✅ **Campo `tipo_pago`**: En modelo Ventas (Efectivo/QR)

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

### Sistema de Numeración Automática
- ✅ **ServicioTecnico**: Auto-genera `numero_servicio` con formato `ST-YYYY-XXXXX`
- ✅ **Venta**: Auto-genera `numero_boleta` con formato `VTA-YYYY-XXXXX`
- ✅ **Secuencias anuales**: Los contadores se reinician automáticamente cada año


## 🔧 Modelos de Datos

### Rol
- `id_rol` (PK)
- `nombre_rol` (String, Unique)
- **`numero_rol`** (Integer, Unique) - **NUEVO**: Para jerarquías (1=SuperAdmin, 2+=Otros)

### Principales Relaciones
- **Usuario** → Rol (FK), Sucursal (FK)
- **Producto** → Categoría (FK)
- **Inventario** → Producto (FK), Sucursal (FK)
- **Venta** → Usuario (FK), Cliente (FK), **Sucursal (FK)** ← **NUEVO**
- **DetalleVenta** → Venta (FK), Producto (FK)
- **ServicioTecnico** → Cliente (FK), Usuario (FK), Sucursal (FK)

### Campos de Imagen
- **Producto**: `foto_producto` (opcional)
- **ServicioTecnico**: `foto_1`, `foto_2`, `foto_3` (opcionales)

## ☁️ Despliegue en Producción

Consulta `instrucciones/deployment_cpanel.md` para la guía completa de subida a producción con cPanel.

**Recomendaciones**:
- Configura `DEBUG=False` en producción
- Usa `collectstatic` para archivos estáticos
- Configura CORS correctamente para tu dominio frontend
- Usa HTTPS en producción
- **Asigna correctamente `numero_rol=1` solo al Super Admin**

