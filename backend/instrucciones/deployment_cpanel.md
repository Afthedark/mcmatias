# Guía de Despliegue en cPanel

Esta guía explica paso a paso cómo desplegar tu proyecto Django en un hosting compartido con cPanel y cómo subir actualizaciones.

---

## 🚀 PARTE 1: Despliegue Inicial

### 1. Preparación del Proyecto (Local)

Antes de subir nada, asegúrate de tener todo listo:

1.  **Driver de Base de Datos**: Verifica que `config/__init__.py` tenga configurado `PyMySQL`.
2.  **Dependencias actualizadas**:
    ```bash
    pip freeze > requirements.txt
    ```
    *(Verifica que incluya: `djangorestframework-simplejwt`, `drf-spectacular`, `Pillow`, `PyMySQL`)*

3.  **Configuración de estáticos** en `settings.py`:
    ```python
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    ```

4.  **Test local final**:
    ```bash
    python manage.py migrate
    python manage.py collectstatic
    python manage.py runserver
    ```

### 2. Subida de Archivos

1.  **Comprimir el proyecto**  
    Crea `backend.zip` con TODO el contenido de `backend`, **EXCEPTO**:
    -   ❌ Carpeta `venv`
    -   ❌ Carpeta `.git`
    -   ❌ Archivo `db.sqlite3`
    -   ❌ Carpetas `__pycache__`
    -   ❌ Carpeta `staticfiles` (la regenerarás en el servidor)
    -   ❌ Carpeta `media/uploads` (si tiene datos de prueba)

2.  **Subir al servidor**:
    -   Entra al **Administrador de Archivos** de cPanel.
    -   Sube `backend.zip` a una carpeta privada fuera de `public_html`:  
        Ejemplo: `/home/tu_usuario/proyectos/mcmatias`
    -   Descomprime el archivo.

### 3. Configurar Python App en cPanel

1.  Busca **"Setup Python App"** en cPanel.
2.  Haz clic en **"Create Application"**:
    -   **Python Version**: 3.10 o superior
    -   **Application Root**: `/home/tu_usuario/proyectos/mcmatias`
    -   **Application URL**: Tu dominio (ej: `api.mcmatias.com`)
    -   **Application Startup File**: `passenger_wsgi.py`
    -   **Application Entry Point**: `application`
3.  Haz clic en **CREATE**.

### 4. Instalación de Dependencias

1.  Copia el comando de activación del entorno virtual que aparece en "Setup Python App".  
    Ejemplo: `source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate`

2.  Abre la **Terminal** de cPanel (o conéctate por SSH).

3.  Activa el entorno e instala:
    ```bash
    source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate
    cd /home/tu_usuario/proyectos/mcmatias
    pip install -r requirements.txt
    ```

### 5. Configurar `passenger_wsgi.py`

Edita `passenger_wsgi.py` en el File Manager con este contenido:

```python
import os
import sys

# Ruta al proyecto backend
sys.path.insert(0, os.path.dirname(__file__))

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 6. Base de Datos y Variables de Entorno

1.  **Crear BD MySQL en cPanel**:
    -   Ve a **MySQL Databases**
    -   Crea la base de datos: `usuario_mcmatias`
    -   Crea un usuario y asígnale permisos totales a la BD

2.  **Configurar `.env`** en el servidor:  
    Edita/crea `/home/tu_usuario/proyectos/mcmatias/.env`:
    ```env
    DEBUG=False
    SECRET_KEY=clave_super_segura_generada_aleatoriamente
    DB_NAME=usuario_mcmatias
    DB_USER=usuario_dbuser
    DB_PASSWORD=contraseña_segura
    DB_HOST=localhost
    DB_PORT=3306
    ALLOWED_HOSTS=api.mcmatias.com,www.api.mcmatias.com
    ```

### 7. Migraciones y Datos Iniciales

Desde la terminal con el entorno activado:

```bash
cd /home/tu_usuario/proyectos/mcmatias

# Aplicar migraciones (crea tablas + Roles + Sucursal automáticamente)
python manage.py migrate
```

**Salida esperada**:
```
Applying api.0006_initial_data...
✅ Roles iniciales creados
✅ Sucursal principal creada
 OK
```

### 8. Crear Superusuario

```bash
python manage.py createsuperuser
```

Django te preguntará:
```
Correo electronico: admin@tuempresa.com
Nombre apellido: Administrador del Sistema
Password: ********
Password (again): ********
Superuser created successfully.
```

El sistema **automáticamente asignará** el rol Super Administrador (numero_rol=1) y la Sucursal Central.

### 9. Archivos Estáticos

```bash
python manage.py collectstatic --noinput
```

### 10. Configurar Media (Imágenes)

Para servir las imágenes públicamente, crea un enlace simbólico:

```bash
ln -s /home/tu_usuario/proyectos/mcmatias/media /home/tu_usuario/public_html/media
```

### 11. Configuración de Seguridad en `settings.py`

Asegúrate de tener estas configuraciones en producción:

```python
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# CORS (si usas frontend separado)
CORS_ALLOWED_ORIGINS = [
    'https://mcmatias.com',
    'https://www.mcmatias.com',
]

# Security Headers
SECURE_SSL_REDIRECT = True  # Si usas HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 12. Reiniciar la Aplicación

Vuelve a **Setup Python App** en cPanel y haz clic en **RESTART**.

### 13. Verificación Final

Prueba estos endpoints:
-   `https://api.mcmatias.com/api/` - Debe devolver lista de endpoints
-   `https://api.mcmatias.com/api/schema/swagger-ui/` - Documentación Swagger
-   `https://api.mcmatias.com/admin/` - Panel de administración

---

## 🔄 PARTE 2: Subir Actualizaciones

Cuando hagas cambios en tu proyecto local y necesites subirlos a producción:

### Opción A: Actualizar Solo Código (Sin cambios de BD)

Usa esto cuando solo modificaste archivos `.py`, `.html`, `.js`, etc., pero **NO cambiaste modelos**.

1.  **Comprimir archivos cambiados**:
    -   Si modificaste pocos archivos, sube solo esos archivos y sobrescríbelos.
    -   Si es más fácil, comprime todo el proyecto (excepto `venv`, `.git`, `media`, `staticfiles`).

2.  **Subir a cPanel**:
    -   Usa el Administrador de Archivos.
    -   Sobrescribe los archivos en `/home/tu_usuario/proyectos/mcmatias`.

3.  **Reiniciar app**:
    ```bash
    # En la terminal de cPanel
    source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate
    cd /home/tu_usuario/proyectos/mcmatias
    
    # Solo si agregaste nuevas dependencias
    pip install -r requirements.txt
    
    # Si cambiaste archivos estáticos (CSS/JS)
    python manage.py collectstatic --noinput
    ```

4.  **Reiniciar desde cPanel**:  
    Ve a "Setup Python App" → **RESTART**.

### Opción B: Actualizar con Cambios de Base de Datos

Usa esto cuando modificaste modelos (agregaste campos, tablas, etc.).

1.  **En local, crear migraciones**:
    ```bash
    python manage.py makemigrations
    ```
    Esto genera archivos en `api/migrations/00XX_*.py`.

2.  **Subir archivos al servidor**:
    -   Comprime tu proyecto actualizado.
    -   Sube y sobrescribe en `/home/tu_usuario/proyectos/mcmatias`.

3.  **Aplicar migraciones en el servidor**:
    ```bash
    source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate
    cd /home/tu_usuario/proyectos/mcmatias
    
    # Aplicar migraciones
    python manage.py migrate
    
    # Si es necesario
    python manage.py collectstatic --noinput
    ```

4.  **Reiniciar app** desde "Setup Python App" → **RESTART**.

### Opción C: Actualización Completa (Recomendado para cambios grandes)

1.  **Hacer backup de la BD** (importante):
    ```bash
    # Desde cPanel → phpMyAdmin
    # Exportar la base de datos como SQL
    ```

2.  **Subir proyecto completo** (sobrescribir todo).

3.  **Ejecutar secuencia completa**:
    ```bash
    source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate
    cd /home/tu_usuario/proyectos/mcmatias
    
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py collectstatic --noinput
    ```

4.  **Reiniciar** desde cPanel.

### Comandos de Actualización Rápida (Cheatsheet)

```bash
# Activar entorno
source /home/tu_usuario/virtualenv/proyectos/mcmatias/3.10/bin/activate

# Ir al proyecto
cd /home/tu_usuario/proyectos/mcmatias

# Dependencias (solo si requirements.txt cambió)
pip install -r requirements.txt

# Migraciones (solo si models.py cambió)
python manage.py migrate

# Estáticos (solo si CSS/JS cambió)
python manage.py collectstatic --noinput

# Reiniciar (SIEMPRE después de cambios en .py)
# Ve a cPanel → Setup Python App → RESTART
```

---

## 🛠️ Solución de Problemas en Producción

### Error 500 después de actualizar

**Causa**: Error en el código o configuración.

**Solución**:
1.  Revisa los logs:  
    `/home/tu_usuario/logs/passenger_log.txt`
2.  Verifica `.env` (especialmente `DEBUG=False` y `ALLOWED_HOSTS`).
3.  Asegúrate de haber ejecutado `migrate` si cambiaste modelos.

### Los archivos estáticos no cargan (CSS/JS del admin)

**Solución**:
```bash
python manage.py collectstatic --clear --noinput
```
Luego reinicia la app.

### Las imágenes no se ven (404 en /media/)

**Solución**:  
Verifica el symlink:
```bash
ls -la /home/tu_usuario/public_html/media
# Debe mostrar --> ../proyectos/mcmatias/media
```

Si no existe, créalo:
```bash
ln -s /home/tu_usuario/proyectos/mcmatias/media /home/tu_usuario/public_html/media
```

### Cambios en .py no se reflejan

**Causa**: No reiniciaste la aplicación.

**Solución**:  
Siempre que modifiques archivos `.py`, ve a "Setup Python App" → **RESTART**.

---

## 📝 Checklist de Deployment Inicial

- [ ] Crear BD MySQL en cPanel
- [ ] Subir archivos del proyecto
- [ ] Configurar Python App
- [ ] Instalar dependencias (`pip install -r requirements.txt`)
- [ ] Configurar `passenger_wsgi.py`
- [ ] Configurar `.env` con datos reales
- [ ] Ejecutar `python manage.py migrate` (crea tablas + Roles + Sucursal)
- [ ] Crear superusuario (`python manage.py createsuperuser`)
- [ ] Ejecutar `python manage.py collectstatic`
- [ ] Crear symlink de media
- [ ] Reiniciar aplicación
- [ ] Verificar Swagger y endpoints

---

## 📝 Checklist de Actualización

- [ ] Hacer backup de BD (si es cambio importante)
- [ ] Subir archivos actualizados
- [ ] Activar entorno virtual
- [ ] `pip install -r requirements.txt` (si cambió)
- [ ] `python manage.py migrate` (si cambió models.py)
- [ ] `python manage.py collectstatic` (si cambió CSS/JS)
- [ ] Reiniciar aplicación desde cPanel
- [ ] Verificar que todo funcione

---

¡Tu API Django está en producción! 🎉

