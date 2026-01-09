# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa para gestionar inventario, ventas, clientes y servicios técnicos.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Autenticación**: JWT (JSON Web Tokens) vía `django-rest-framework-simplejwt`
- **Documentación**: Swagger UI (`drf-spectacular`)
- **Base de Datos**: MySQL / MariaDB
- **Driver**: **PyMySQL** (Universal y compatible con cPanel)
- **Archivos**: **Pillow** (Gestión de imágenes)

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal
│   ├── models.py        # Modelos de datos
│   ├── views.py         # Vistas y endpoints
│   ├── serializers.py   # Serializadores
│   └── urls.py          # Rutas de API
├── config/              # Configuraciones de Django
├── instrucciones/       # Guías: Setup, Despliegue, Endpoints
│   ├── deployment_cpanel.md # GUÍA PASO A PASO PARA CPANEL
│   ├── endpoints.md     # Ejemplos de JSON para Testing
│   └── setup_guide.md   # Instalación Local
├── media/               # Archivos subidos (Imágenes)
└── requirements.txt     # Dependencias
```

## 🚀 Instalación Rápida

1.  **Entorno**: `python -m venv venv` -> Activar.
2.  **Librerías**: `pip install -r requirements.txt`.
3.  **BD**: Configurar `.env` + `python manage.py migrate`.
4.  **Correr**: `python manage.py runserver`.

## 🔑 Autenticación (JWT)

El sistema utiliza JWT para proteger los endpoints. Puedes obtener tus tokens en:
👉 **POST** `/api/token/` (Ver `instrucciones/endpoints.md` para detalles).

## 📋 Endpoints Principales

### Autenticación
- **POST** `/api/token/` - Obtener tokens de acceso
- **POST** `/api/token/refresh/` - Refrescar token de acceso

### Perfil de Usuario
- **GET** `/api/perfil/` - Obtener datos del usuario autenticado
- **PATCH** `/api/perfil/` - Actualizar perfil (nombre, email, contraseña)

### Gestión de Datos
- **CRUD completo** para: Roles, Sucursales, Categorías, Usuarios, Clientes, Productos, Inventario, Ventas, Detalle de Ventas, Servicios Técnicos

## 📚 Documentación de API (Swagger)

Una vez corriendo el servidor, visita:
👉 **[http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)**

Aquí verás todos los endpoints documentados automáticamente e interactivos para probar.

## ✨ Características Recientes

- ✅ Endpoint de perfil de usuario con actualización parcial (PATCH)
- ✅ Validación de contraseñas con confirmación
- ✅ Paginación ordenada en todos los endpoints
- ✅ Campo `tipo_pago` en modelo de Ventas (Efectivo/QR)

## ☁️ Despliegue en Producción

Consulta `instrucciones/deployment_cpanel.md` para la guía completa de subida a producción.

