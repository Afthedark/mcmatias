# Backend API REST - MCMatias

Este es el proyecto backend para el sistema de gestión **MCMatias**, desarrollado con **Django** y **Django REST Framework (DRF)**. Provee una API RESTful completa para gestionar inventario, ventas, clientes y servicios técnicos.

## 🛠 Tecnologías

- **Lenguaje**: Python 3.10+
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Base de Datos**: MySQL / MariaDB
- **Driver**: PyMySQL (para compatibilidad universal y cPanel)
- **Autenticación**: JWT / Session (Configurable)

## 📂 Estructura del Proyecto

```
backend/
├── api/                 # Aplicación principal (Modelos, Vistas, Serializers)
├── config/              # Configuraciones de Django (settings.py)
├── instrucciones/       # Guías detalladas de instalación y despliegue
├── manage.py            # CLI de Django
├── requirements.txt     # Dependencias del proyecto
└── passenger_wsgi.py    # Archivo de entrada para cPanel (si aplica)
```

## 🚀 Instalación Rápida

Para instrucciones detalladas, ver [instrucciones/setup_guide.md](./instrucciones/setup_guide.md).

1.  **Clonar y entrar**:
    ```bash
    cd backend
    ```
2.  **Entorno Virtual**:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Dependencias**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configuración (.env)**:
    Crea un archivo `.env` basado en el ejemplo o tus credenciales de BD.
5.  **Migraciones**:
    ```bash
    python manage.py migrate
    ```
6.  **Ejecutar**:
    ```bash
    python manage.py runserver
    ```
    Visita: `http://127.0.0.1:8000/api/`

## 🌐 Endpoints Principales

Todos los recursos soportan `GET` (listar), `POST` (crear), `PUT` (editar), `DELETE` (borrar).

- `/api/usuarios/` - Gestión de usuarios y roles.
- `/api/productos/` - Catálogo de productos.
- `/api/inventario/` - Control de stock por sucursal.
- `/api/ventas/` - Registro de ventas.
- `/api/clientes/` - Cartera de clientes.
- `/api/servicios_tecnicos/` - Seguimiento de reparaciones.

## ☁️ Despliegue en cPanel

Este proyecto está pre-configurado para funcionar en cPanel:
1.  Usa **PyMySQL** en `config/__init__.py` para evitar errores de compilación de `mysqlclient`.
2.  Requiere crear un archivo `passenger_wsgi.py` en el servidor (ver guías en carpeta `instrucciones/`).
3.  Compatible con **MariaDB 10.4+**.
