## Objetivo
Finalizar la configuración del entorno, asegurar que las credenciales son válidas y verificar el login exitoso.

## Pasos de Ejecución
1. **Configurar .env**: Crear/Sobrescribir `backend/.env` con la configuración correcta (BD, DEBUG, ALLOWED_HOSTS) para asegurar que Django/Uvicorn se conecten a la base de datos correcta.
2. **Sincronizar Credenciales**: Ejecutar un script de Django para asegurar que el usuario `admin@gmail.com` existe, está activo y su contraseña es exactamente `admin`.
3. **Prueba de Conexión (Backend)**: Realizar una petición directa (curl/script) al endpoint `/api/token/` con `admin@gmail.com` / `admin` para confirmar la emisión de tokens (Status 200).
4. **Verificación Frontend**: Una vez confirmado el backend, reintentar el login desde el navegador para validar la integración completa.

## Credenciales de Prueba
- **Usuario**: `admin@gmail.com`
- **Password**: `admin`

## Resultado Esperado
- El endpoint `/api/token/` responde con 200 OK y devuelve `access` y `refresh` tokens.
- Desaparición del error 400 Bad Request.