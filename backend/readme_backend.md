# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa para gestionar inventario, ventas, clientes y servicios técnicos.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Base de Datos**: MySQL / MariaDB
- **Driver**: **PyMySQL** (para compatibilidad universal y cPanel)
- **Archivos**: **Pillow** (Gestión de imágenes)
- **Autenticación**: Open (AllowAny) en Dev / Configurable para Prod.

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal (Modelos, Vistas, Serializers)
├── config/              # Configuraciones de Django (settings.py)
├── instrucciones/       # Guías detalladas y documentación de endpoints
│   ├── cpanel_compatibility.md
│   ├── endpoints.md     # Guía de uso de la API (JSONs de ejemplo)
│   └── setup_guide.md   # Guía de instalación inicial
├── media/               # Archivos subidos por usuarios (Imágenes)
├── requirements.txt     # Dependencias del proyecto
└── manage.py            # CLI de Django
```

## 🚀 Instalación Rápida

Para instrucciones detalladas, ver [instrucciones/setup_guide.md](./instrucciones/setup_guide.md).

1.  **Entorno Virtual**:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
2.  **Dependencias**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Base de Datos**:
    - Asegúrate de tener MySQL/MariaDB corriendo.
    - Crea la BD `mcmatias_db`.
    - Configura `.env` con tus credenciales.
4.  **Migraciones**:
    ```bash
    python manage.py migrate
    ```
5.  **Ejecutar**:
    ```bash
    python manage.py runserver
    ```
    Visita: `http://127.0.0.1:8000/api/`

## 🌐 Endpoints y Pruebas

Documentación completa de cómo probar la API en: **[instrucciones/endpoints.md](./instrucciones/endpoints.md)**.

### Subida de Imágenes
Los endpoints `/api/productos/` y `/api/servicios_tecnicos/` soportan imágenes.
- **Importante**: Al probar en Postman, usa `form-data` en lugar de `raw JSON` para enviar archivos.

## ☁️ Despliegue en cPanel

Este proyecto está pre-configurado para funcionar en cPanel:
1.  Usa **PyMySQL** en `config/__init__.py` para evitar errores de compilación.
2.  Requiere crear un archivo `passenger_wsgi.py` en el servidor.
3.  Compatible con **MariaDB 10.4+**.
4.  **Imágenes**: Recuerda hacer un enlace simbólico de la carpeta `media` hacia `public_html/media` para que las fotos sean visibles públicamente.
