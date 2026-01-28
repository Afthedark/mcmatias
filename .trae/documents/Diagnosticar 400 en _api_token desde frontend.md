## Objetivo
Identificar la causa del 400 en /api/token desde el frontend y confirmar que el backend está usando la BD correcta tras la migración a python-dotenv.

## Verificaciones Inmediatas (sin cambios de código)
- Reiniciar el backend tras actualizar .env, ejecutando Uvicorn desde `backend` para asegurar que se lea `BASE_DIR/.env`.
- En el navegador, abrir DevTools → Network → petición `POST /api/token/` y revisar:
  - Payload enviado: debe contener `correo_electronico` y `password`.
  - Body de respuesta (JSON): leer `detail`.
- Probar login por fuera del frontend:
  - `curl -X POST http://127.0.0.1:8000/api/token/ -H "Content-Type: application/json" -d "{\"correo_electronico\":\"admin@gmail.com\",\"password\":\"admin123\"}"`
  - Comparar el `detail` con el del frontend.

## Interpretación del `detail`
- "Esta cuenta ha sido desactivada..." → El backend encontró el usuario pero `activo=False` en la BD que está usando. Validar:
  - Que el correo usado en login coincide exactamente con `usuarios.correo_electronico`.
  - Que la BD apuntada por `.env` (DB_NAME/DB_HOST/PORT/USER/PASSWORD) es la misma que donde verificaste usuarios activos.
- "No active account found with the given credentials" (401) → Correo o contraseña incorrectos. Usar exactamente el correo de la tabla y la contraseña registrada.

## Confirmaciones de Entorno
- Confirmar contenido de `backend/.env`:
  - SECRET_KEY, DEBUG=True temporalmente
  - DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
  - ALLOWED_HOSTS=127.0.0.1,localhost
- Confirmar que el servidor se inicia desde `D:\myProjects\mcmatias\backend`.

## Opcional (si autorizas cambios de código)
- Cambiar la validación de cuenta inactiva para responder 401 (AuthenticationFailed) en lugar de 400, alineando el flujo estándar de login.

## Resultado Esperado
- Ver el `detail` concreto y tomar acción: corregir credenciales o corregir conexión a la BD.
- Login exitoso desde frontend y curl, con tokens válidos.