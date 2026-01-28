## Objetivo
Preparar el backend para despliegue en EasyPanel, asegurando la configuración correcta de CORS (para Netlify) y documentación clara de las variables de entorno requeridas.

## Configuración Actual Detectada
- `CORS_ALLOW_ALL_ORIGINS = True` está activado en `settings.py`. Esto es permisivo pero funcional para el despliegue inicial (el frontend de Netlify podrá conectarse sin problemas).
- `ALLOWED_HOSTS` ya se lee desde variable de entorno (gracias a la migración anterior).
- `DATABASES` está configurado para leer variables individuales (`DB_NAME`, etc.), lo cual es compatible con EasyPanel si se definen manualmente.

## Pasos de Ejecución

1. **Crear Guía de Despliegue (`instrucciones/easypanel_deploy.md`)**:
   - Documentar las variables de entorno exactas que se deben configurar en EasyPanel:
     - `SECRET_KEY`: Generar una nueva.
     - `DEBUG`: `False`.
     - `ALLOWED_HOSTS`: `*` (o el dominio que asigne EasyPanel).
     - `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.
   - Instrucciones para configurar el servicio de Base de Datos en EasyPanel (MySQL).
   - Comando de inicio recomendado (Build Pack: Nixpacks): `uvicorn config.asgi:application --host 0.0.0.0 --port 80`.

2. **Crear `Procfile` (Opcional pero recomendado)**:
   - Crear un archivo `Procfile` en la raíz del backend para asegurar que EasyPanel/Nixpacks detecte el comando de inicio correcto automáticamente.
   - Contenido: `web: uvicorn config.asgi:application --host 0.0.0.0 --port 80`

## Resultado Esperado
- Documentación lista para copiar y pegar en EasyPanel.
- Configuración de arranque explícita para evitar errores de despliegue.
- Backend listo para recibir peticiones desde Netlify (CORS abierto).