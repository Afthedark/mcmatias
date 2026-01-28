Ambos métodos funcionan perfectamente y comparten la misma configuración gracias al ajuste que hicimos en `settings.py`.

### 1. `python manage.py runserver` (Desarrollo Clásico)
- **SÍ funciona** y seguirá funcionando.
- Es el servidor de desarrollo integrado de Django.
- **Ventaja**: Es más simple para debuggear errores de código sincrónico y recarga muy rápido.
- **Uso**: Exclusivo para desarrollo local (`DEBUG=True`). No recomendado para producción.

### 2. `uvicorn config.asgi:application` (Moderno / Producción)
- **SÍ funciona** en ambos modos, controlado por tu archivo `.env`.
- **Modo Desarrollo (`DEBUG=True`)**:
  - Comando: `uvicorn config.asgi:application --reload`
  - El flag `--reload` hace que se reinicie al guardar cambios (igual que runserver).
- **Modo Producción (`DEBUG=False`)**:
  - Comando: `uvicorn config.asgi:application` (sin reload)
  - Es mucho más rápido y capaz de manejar múltiples conexiones concurrentes.

### ¿Cómo funciona la "magia"?
Al haber configurado `settings.py` para cargar explícitamente `backend/.env`, **ambos comandos** leen las mismas variables:
- Si en `.env` pones `DEBUG=True`, ambos te mostrarán pantallas de error detalladas.
- Si en `.env` pones `DEBUG=False`, ambos actuarán en modo seguro (aunque `runserver` te avisará que es inseguro usarlo así).

**Recomendación:**
- Usa `runserver` o `uvicorn --reload` indistintamente mientras programas.
- Usa `uvicorn` (sin reload) cuando vayas a desplegar o probar rendimiento real.