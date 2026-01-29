## Objetivo
Actualizar [readme_backend.md](file:///d:/myProjects/mcmatias/backend/readme_backend.md) para reflejar los últimos cambios de despliegue y configuración (python-dotenv, Gunicorn, scripts Linux, logs, guía VPS).

## Cambios Propuestos en el README

## 1) Tecnologías
- Añadir explícitamente:
  - `python-dotenv` (carga automática de `.env`).
  - `gunicorn` (servidor de aplicación recomendado en VPS) y `nginx` (proxy inverso para static/media).
- Mantener las versiones reales según [requirements.txt](file:///d:/myProjects/mcmatias/backend/requirements.txt).

## 2) Configuración de Entorno (.env)
- Incluir ejemplo de variables:
  - `DEBUG`, `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `ALLOWED_HOSTS`.
- Aclarar que `.env` se carga automáticamente desde `backend/.env` por:
  - [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py)
  - [manage.py](file:///d:/myProjects/mcmatias/backend/manage.py)
  - [wsgi.py](file:///d:/myProjects/mcmatias/backend/config/wsgi.py) / [asgi.py](file:///d:/myProjects/mcmatias/backend/config/asgi.py)

## 3) Instalación Local
- Mantener pasos actuales, pero agregar variante Linux/WSL además de Windows.
- Aclarar que para desarrollo se puede usar `python manage.py runserver`.

## 4) Producción (VPS)
- Agregar sección “Despliegue en VPS (Linux)” apuntando a:
  - [setup_guide_vps.md](file:///d:/myProjects/mcmatias/backend/instrucciones/setup_guide_vps.md)
- Documentar ejecución con Gunicorn usando:
  - [gunicorn.conf.py](file:///d:/myProjects/mcmatias/backend/gunicorn.conf.py)
  - [run_local.sh](file:///d:/myProjects/mcmatias/backend/run_local.sh) (dev Linux/WSL)
  - [run_prod.sh](file:///d:/myProjects/mcmatias/backend/run_prod.sh) (VPS)
- Documentar carpeta de logs:
  - `backend/logs/` (se mantiene con `.gitkeep`).

## 5) Static/Media en Producción
- Aclarar punto clave:
  - Django solo sirve `MEDIA_URL` automáticamente si `DEBUG=True` (ver [urls.py](file:///d:/myProjects/mcmatias/backend/config/urls.py)).
  - En producción se debe servir `/static/` y `/media/` con Nginx.

## 6) Ajustes menores
- Actualizar la sección final de producción para mencionar tanto cPanel como VPS:
  - Mantener referencia a `deployment_cpanel.md`.
  - Añadir referencia a `setup_guide_vps.md`.

## Resultado Esperado
El README quedará alineado con el estado real del repo (Gunicorn + logs + scripts + python-dotenv + guías), y evitará confusiones típicas (media en producción, variables de entorno, comandos por sistema operativo).
