## Diagnóstico (estado actual del backend)
- **Estructura monorepo**: el backend vive en `backend/` (ahí están `manage.py` y `requirements.txt`).
- **ASGI listo para Uvicorn**: existe [asgi.py](file:///d:/myProjects/mcmatias/backend/config/asgi.py) con `application = get_asgi_application()`.
- **Variables de entorno**: ya usa `python-dotenv` con `load_dotenv()` en [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py#L1-L24) y lee `DB_*`, `SECRET_KEY`, `DEBUG`.

## Cosas que faltan / riesgos para producción
1. **ALLOWED_HOSTS está vacío** en [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py#L20-L23). Con `DEBUG=False` Django responderá 400 a cualquier dominio.
2. **No está `uvicorn` en requirements**: [backend/requirements.txt](file:///d:/myProjects/mcmatias/backend/requirements.txt) no lo incluye.
3. **Estáticos/media en producción**:
   - No hay `STATIC_ROOT` en settings (recomendado por tu propia guía de cPanel).
   - `MEDIA_URL` solo se sirve cuando `DEBUG=True` en [urls.py](file:///d:/myProjects/mcmatias/backend/config/urls.py#L24-L25). En producción, las imágenes no se verán si no configuras servidor/route.
4. **Seguridad/CORS**:
   - `CORS_ALLOW_ALL_ORIGINS = True` en [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py#L161-L163) (ok para dev, mala idea en prod si el frontend estará en Netlify).
5. **Permisos DRF**:
   - `DEFAULT_PERMISSION_CLASSES` está en `AllowAny` (muy abierto) en [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py#L129-L140). En producción normalmente debe ser `IsAuthenticated` y dejar públicos solo `token/refresh`.
6. **SECRET_KEY tiene fallback inseguro** (`django-insecure-default-key`). En prod deberías exigir que venga por env.

## Plan de acción (EasyPanel + cambios mínimos al repo)

### 1) Configuración en EasyPanel (GitHub)
- **Servicio App** (Nixpacks) apuntando a:
  - **Ruta de compilación**: `/backend`.
- **Build**:
  - Instala dependencias desde `backend/requirements.txt` (Nixpacks lo detecta bien si estás en `/backend`).
- **Start command (Uvicorn)**:
  - `uvicorn config.asgi:application --host 0.0.0.0 --port $PORT`
  - Si EasyPanel no expone `$PORT`, usa el que te indique (normalmente `$PORT` sí existe).

### 2) Variables de entorno en EasyPanel (debes cargarlas en “Entorno”)
- `DEBUG=False`
- `SECRET_KEY=...` (obligatorio)
- Base de datos MySQL (creada como servicio en EasyPanel):
  - `DB_NAME=...`
  - `DB_USER=...`
  - `DB_PASSWORD=...`
  - `DB_HOST=...` (host interno del servicio)
  - `DB_PORT=3306`
- Dominio:
  - `ALLOWED_HOSTS=api.tudominio.com` (y si usas www, agregarlo)
- Frontend Netlify:
  - `CORS_ALLOWED_ORIGINS=https://TU-SITIO.netlify.app` (o tu dominio final)

### 3) Cambios recomendados en código (para dejarlo “production-ready”)
**Archivos:** [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py), [urls.py](file:///d:/myProjects/mcmatias/backend/config/urls.py), [requirements.txt](file:///d:/myProjects/mcmatias/backend/requirements.txt)
- **Agregar `uvicorn`** a `backend/requirements.txt`.
- **ALLOWED_HOSTS por env**:
  - Cambiar `ALLOWED_HOSTS = []` a algo como `os.getenv('ALLOWED_HOSTS','').split(',')` y filtrar vacíos.
- **CORS solo para Netlify**:
  - En prod usar `CORS_ALLOWED_ORIGINS` y dejar `CORS_ALLOW_ALL_ORIGINS` solo si `DEBUG=True`.
- **Permisos DRF en prod**:
  - Poner default `IsAuthenticated` y marcar explícitamente los endpoints públicos.
- **STATIC_ROOT + collectstatic**:
  - Agregar `STATIC_ROOT = BASE_DIR / 'staticfiles'`.
- **Media en producción** (dos opciones):
  - **Opción A (preferida con EasyPanel)**: montar un volumen persistente para `backend/media/` y servir `/media` vía configuración del proxy/servicio de archivos estáticos si EasyPanel lo permite.
  - **Opción B (fallback)**: servir media (y si quieres static) desde Django (no ideal) o cambiar a una estrategia de estáticos (si luego aceptas Gunicorn+WhiteNoise).

### 4) Migraciones y estáticos en cada deploy
- En cada despliegue (por consola del servicio o “post-deploy/release command” si EasyPanel lo soporta):
  - `python manage.py migrate --noinput`
  - `python manage.py collectstatic --noinput` (si usarás admin o estáticos del backend)

### 5) Verificación final
- Probar:
  - `/api/` responde
  - `/api/token/` entrega tokens
  - `/admin/` carga con estilos (si configuras estáticos)
  - Subidas/lectura de imágenes (si configuras media)

## Conclusión
Tu backend **está cerca** de estar listo para EasyPanel con Uvicorn (ASGI OK, env OK), pero **le faltan** ajustes clave de producción: `ALLOWED_HOSTS`, añadir `uvicorn`, controlar CORS, permisos por defecto, y definir/servir `static/media` en producción.

Cuando confirmes este plan, hago los cambios mínimos en el repo para dejarlo listo (requirements + settings + urls).