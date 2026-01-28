## Objetivo
Migrar a `django-environ` en el entorno virtual `(venv)` para compatibilidad con EasyPanel, dejando la actualización de `requirements.txt` para ejecución manual posterior por el usuario.

## Pasos de Ejecución (en venv: D:\myProjects\mcmatias\backend)

1. **Cambio de Librerías (venv)**:
   - Ejecutar `pip uninstall -y python-dotenv`.
   - Ejecutar `pip install django-environ`.
   - *Nota: El usuario ejecutará `pip freeze > requirements.txt` manualmente más adelante.*

2. **Actualizar `settings.py`**:
   - Reemplazar la lógica de `python-dotenv` por `django-environ`:
     ```python
     import environ
     env = environ.Env()
     # Leer .env local si existe
     environ.Env.read_env(BASE_DIR / '.env')
     ```
   - Actualizar lectura de variables usando la sintaxis de `env()`:
     - `DEBUG` con casting booleano: `env.bool('DEBUG', default=False)`.
     - `ALLOWED_HOSTS` con casting de lista: `env.list('ALLOWED_HOSTS', default=[])`.
     - `DATABASES` usando `env('DB_NAME')`, etc.

3. **Verificación**:
   - Iniciar servidor con `uvicorn config.asgi:application --reload`.
   - Confirmar inicio correcto y conexión a BD.

## Resultado Esperado
- Código actualizado para usar `django-environ`.
- Servidor funcionando localmente con la nueva configuración.
- Entorno listo para que el usuario congele dependencias cuando desee.