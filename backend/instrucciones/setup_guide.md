# Guía de Instalación y Configuración - MCMatias Backend

## 1. Requisitos Previos

- Python 3.10 o superior
- MySQL 8.0+ o MariaDB 10.4+
- `pip` (Gestor de paquetes de Python)

## 2. Configuración Inicial

### Clonar y Entorno Virtual
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Instalar Dependencias
```bash
pip install -r requirements.txt
```

### Configurar Variables de Entorno
Crea un archivo `.env` en la carpeta `backend/` con tus credenciales:

```ini
DEBUG=True
SECRET_KEY=tu_clave_secreta_segura
DB_NAME=mcmatias_db
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
```

## 3. Base de Datos (MySQL)

Este proyecto usa **PyMySQL** como driver para maximizar la compatibilidad.
1. Crea la base de datos en tu servidor MySQL (`CREATE DATABASE mcmatias_db;`).
2. Ejecuta las migraciones:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Ejecución

```bash
python manage.py runserver
```

### URLs Importantes:
- **API Root**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Documentación Swagger**: [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)
- **Panel Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 5. Características Especiales

### Documentación Automática (Swagger)
El proyecto usa `drf-spectacular`. Cada vez que agregues una vista o modelo, la documentación en `/api/schema/swagger-ui/` se actualizará automáticamente.

### Imágenes (Media Uploads)
Las imágenes se guardan en `backend/media/uploads/images/`.
Para desarrollo, Django las sirve automáticamente si `DEBUG=True`.
Para producción (cPanel), revisa la guía `deployment_cpanel.md`.
