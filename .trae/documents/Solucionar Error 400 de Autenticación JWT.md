## Causas Probables
- Payload de login no coincide con USERNAME_FIELD (debe usar `correo_electronico`).
- Usuario marcado inactivo (el serializer devuelve 400 con `detail`).
- Cambio a `django-environ` afectó carga de `.env` y el sistema se conecta a otra BD.
- Header/Content-Type incorrecto o body vacío con Uvicorn.

## Plan de Verificación
1. Probar login directo con curl/Postman:
   - Body JSON exacto:
     {
       "correo_electronico": "admin@gmail.com",
       "password": "admin123"
     }
   - Headers: Content-Type: application/json
   - Observar respuesta y `detail`.
2. Revisar el mensaje de error:
   - Si `detail` dice “desactivada”, activar usuario.
   - Si falta `correo_electronico`, corregir payload.
3. Confirmar conexión a la BD correcta:
   - Verificar variables: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT.
   - Asegurar que `.env` está siendo cargado por el método actual (hoy usa `python-dotenv`).
4. Alinear configuración de entorno:
   - Elegir UNA estrategia: `python-dotenv` (actual) o `django-environ`.
   - Si usamos `django-environ`, ajustar `settings.py` para leer `env` y quitar `load_dotenv()`.
5. Validar en frontend:
   - Confirmar que `auth.js` envía `correo_electronico` y `password` (ya lo hace).
   - Confirmar `API_BASE_URL` apunta a `http://127.0.0.1:8000/api`.

## Cambios Propuestos (si confirmas)
- Estabilizar carga de variables de entorno (mantener `python-dotenv` o migrar correctamente a `django-environ`).
- Añadir logging no sensible en el endpoint de token para ver causas (solo en dev).
- Documentar payload de login en el index/login.

## Resultado Esperado
- Login exitoso con tokens válidos.
- Eliminación del 400 causado por payload/validación.
- Configuración de entorno consistente entre runserver y Uvicorn.