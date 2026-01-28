## Objetivo
Configurar y documentar la ejecución del backend con Uvicorn (ya instalado).

## 1. Verificación de entorno
- **Acción**: Comprobar que `uvicorn` está en `requirements.txt` y que el servidor arranca correctamente.

## 2. Estandarización del arranque
- **Acción**: Crear un archivo de script para facilitar el inicio del servidor en desarrollo con Uvicorn.
  - Crear `run_server.bat` (Windows) en la raíz del backend con el comando:
    `uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000`

## 3. Documentación
- **Acción**: Actualizar [instrucciones/setup_guide.md](file:///d:/myProjects/mcmatias/backend/instrucciones/setup_guide.md) para incluir la sección "Ejecución con Uvicorn (Recomendado)" sustituyendo o complementando a `manage.py runserver`.

## Pasos de ejecución
1. Verificar arranque con Uvicorn mediante comando en terminal.
2. Crear `backend/run_server.bat`.
3. Actualizar `backend/instrucciones/setup_guide.md` con las instrucciones de Uvicorn.
