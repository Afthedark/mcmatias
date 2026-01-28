## Objetivo
Revertir cualquier uso de django-environ y consolidar la carga de variables con python-dotenv dentro del venv, asegurando que Uvicorn encuentre el .env y que el login en /api/token funcione.

## Cambios de Código (precisos)
- En config/settings.py:
  - Mantener `from dotenv import load_dotenv`.
  - Cambiar la carga a ruta explícita: `load_dotenv(BASE_DIR / '.env')` para que no dependa del directorio actual de ejecución.
  - Seguir usando `os.getenv(...)` para SECRET_KEY, DEBUG, DB_*, etc.

## Archivo .env (ubicación: backend/.env)
- Crear/actualizar `d:\myProjects\mcmatias\backend\.env` con:
  - SECRET_KEY=tu_clave_segura
  - DEBUG=True
  - DB_NAME=mcmatias_db
  - DB_USER=root
  - DB_PASSWORD=tu_password
  - DB_HOST=127.0.0.1
  - DB_PORT=3306
  - (Opcional) ALLOWED_HOSTS=127.0.0.1,localhost

## Pasos en PowerShell (dentro de venv y backend)
1) Activar venv
- PS D:\myProjects\mcmatias\backend> .\venv\Scripts\Activate.ps1

2) Desinstalar django-environ (si quedó instalado)
- pip uninstall -y django-environ environs

3) Instalar/asegurar python-dotenv
- pip install python-dotenv==1.2.1

4) Verificar dependencias
- pip show python-dotenv
- pip freeze | Select-String "python-dotenv"

## Validación
1) Iniciar servidor desde backend (para respetar BASE_DIR)
- uvicorn config.asgi:application --reload

2) Probar login (payload correcto)
- POST http://127.0.0.1:8000/api/token/
- Body JSON:
  {
    "correo_electronico": "admin@gmail.com",
    "password": "admin123"
  }

3) Si sigue fallando (400), comprobar:
- Que .env se cargó: valores de DB apuntan a la BD con usuarios activos.
- Que `DEBUG=True` temporalmente para ver trazas.
- Probar también `python manage.py runserver` para descartar diferencias de cwd con Uvicorn.

## Resultado Esperado
- Uvicorn y Django leen correctamente el .env desde backend.
- Autenticación en /api/token retorna 200 con tokens válidos.

## Notas
- Ya estás usando python-dotenv en requirements; este cambio solo hace la carga robusta.
- El frontend ya envía `correo_electronico` y `password`, por lo que no requiere cambios.
