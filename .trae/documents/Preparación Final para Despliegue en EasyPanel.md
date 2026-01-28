## Objetivo
Adaptar la inicialización del backend en EasyPanel siguiendo la lógica de `setup_guide.md`, asegurando que se creen las tablas, roles, sucursales y el superusuario inicial automáticamente en el despliegue.

## Análisis de `setup_guide.md`
El archivo indica usar `python manage.py setup_initial_data --create-superuser` para una inicialización completa (Tablas + Roles + Sucursal + Superusuario `admin@mcmatias.com`).

## Pasos de Ejecución (Local - Preparación)
1. **Instalar Whitenoise**: Necesario para servir los estilos del admin en producción.
2. **Configurar `settings.py`**: Habilitar Whitenoise y `STATIC_ROOT`.

## Pasos de Ejecución (EasyPanel - Inicialización)
1. **Comando de Inicio (Start Command)**:
   - Proporcionar el comando combinado que:
     1. Aplica migraciones (crea tablas).
     2. Ejecuta `setup_initial_data` (crea roles, sucursal y admin por defecto).
     3. Recolecta estáticos.
     4. Inicia el servidor.

   ```bash
   python manage.py migrate && python manage.py setup_initial_data --create-superuser && python manage.py collectstatic --noinput && python -m uvicorn config.asgi:application --host 0.0.0.0 --port $PORT
   ```

## Resultado Esperado
- El despliegue en EasyPanel ejecutará automáticamente todo el proceso de setup descrito en la guía.
- El usuario podrá loguearse inmediatamente con las credenciales por defecto (`admin@mcmatias.com` / `admin123`) sin ejecutar comandos manuales en la consola.