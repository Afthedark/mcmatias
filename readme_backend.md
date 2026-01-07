# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa para gestionar inventario, ventas, clientes y servicios técnicos.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Documentación**: Swagger UI (`drf-spectacular`)
- **Base de Datos**: MySQL / MariaDB
- **Driver**: **PyMySQL** (Universal y compatible con cPanel)
- **Archivos**: **Pillow** (Gestión de imágenes)

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal
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

## 📚 Documentación de API (Swagger)

Una vez corriendo el servidor, visita:
👉 **[http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)**

Aquí verás todos los endpoints documentados automáticamente e interactivos para probar.

## ☁️ Despliegue en Productos

Consulta `instrucciones/deployment_cpanel.md` para la guía completa de subida a producción, que cubre:
- Compresión de archivos.
- Configuración de "Setup Python App".
- Archivo `passenger_wsgi.py`.
- Enlaces simbólicos para imágenes.
