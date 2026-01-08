# Guía de Despliegue en cPanel

Esta guía explica paso a paso cómo subir y configurar tu proyecto Django en un hosting compartido con cPanel.

## 1. Preparación del Proyecto (Local)

Antes de subir nada, asegúrate de tener todo listo:

1.  **Driver de Base de Datos**: Asegúrate de que `config/__init__.py` tenga configurado `PyMySQL`.
2.  **Dependencias**: Genera tu lista final de librerías:
    ```bash
    pip freeze > requirements.txt
    ```
    *(Verifica que `djangorestframework-simplejwt`, `drf-spectacular`, `Pillow` y `PyMySQL` estén ahí).*
3.  **Archivos Estáticos**:
    En `settings.py`, asegúrate de tener:
    ```python
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    ```

## 2. Subida de Archivos

1.  Comprime TODO el contenido de la carpeta `backend` en un archivo `backend.zip`, **EXCEPTO**:
    -   ❌ Carpeta `venv` (NO la subas)
    -   ❌ Carpeta `.git`
    -   ❌ Archivo `db.sqlite3` (si existe)
    -   ❌ Carpeta `__pycache__`

2.  Entra al **Administrador de Archivos** de cPanel.
3.  Sube `backend.zip` a la raíz de tu hosting (o una carpeta privada fuera de `public_html`, ej: `/home/tu_usuario/proyectos/mcmatias`).
4.  Descomprime el archivo.

## 3. Configurar Python en cPanel

1.  Busca la herramienta **"Setup Python App"** (Configurar Aplicación Python).
2.  Haz clic en **"Create Application"**.
    -   **Python Version**: Elige 3.10 o superior (compatible con tu Django).
    -   **Application Root**: La ruta donde descomprimiste el proyecto (ej: `proyectos/mcmatias`).
    -   **Application URL**: La URL pública (ej: `mcmatias.com` o `api.mcmatias.com`).
    -   **Application Startup File**: `passenger_wsgi.py` (lo crearemos después si no existe, o cPanel creará uno por defecto).
    -   **Application Entry Point**: `application`.
3.  Haz clic en **CREATE**.

## 4. Instalación de Dependencias

1.  En la misma pantalla de la App Python, verás un comando bajo el título "Enter to the virtual environment". Copialo.
    -   Ej: `source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.13/bin/activate`
2.  Abre la **Terminal** de cPanel (o conéctate por SSH).
3.  Pega el comando para activar el entorno.
4.  Instala las librerías:
    ```bash
    cd proyectos/mcmatias
    pip install -r requirements.txt
    ```

## 5. Configurar `passenger_wsgi.py`

Edita el archivo `passenger_wsgi.py` que está en la carpeta de tu proyecto en el File Manager. Borra todo y pega esto:

```python
import os
import sys

# Ajusta esta ruta a la carpeta 'backend' de tu proyecto
sys.path.insert(0, os.path.dirname(__file__))

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

## 6. Variables de Entorno y Base de Datos

1.  Crea la base de datos MySQL y el usuario en cPanel.
2.  Edita (o crea) el archivo `.env` en la carpeta del proyecto en el servidor server con los datos REALES de la base de datos del hosting.

## 7. Migraciones y Estáticos

Vuelve a la terminal del servidor (con el entorno activado):

```bash
# Crear tablas en la BD del hosting
python manage.py migrate

# Recolectar archivos estáticos (CSS del admin y Swagger)
python manage.py collectstatic
```

## 8. Imágenes (Media)

Para que las fotos subidas se vean públicamente (ej. `midominio.com/media/foto.jpg`), necesitas conectar la carpeta `media` del proyecto con la carpeta pública `public_html`.

En la terminal:
```bash
ln -s /home/tu_usuario/proyectos/mcmatias/media /home/tu_usuario/public_html/media
```

## 9. Reiniciar

Vuelve a "Setup Python App" y haz clic en **RESTART**.

---

### Verificación
Entra a `http://tu-dominio.com/api/schema/swagger-ui/` y deberías ver la documentación de tu API funcionando.
