**Plan: Finalización de la Migración a Gunicorn**

Confirmado que ya tienes Gunicorn instalado y Uvicorn fuera del sistema. Procederé con los cambios técnicos finales:

1.  **Configuración de Gunicorn**:
    - Crear el archivo [gunicorn.conf.py](file:///d:/myProjects/mcmatias/backend/gunicorn.conf.py) con:
        - Puerto: `8000`
        - Aplicación: `config.wsgi:application`
        - Workers: Cálculo automático (2 * núcleos + 1)
        - Logs: Activación de logs de acceso y errores en la carpeta `logs/`.

2.  **Scripts de Ejecución (Linux/WSL)**:
    - Crear `run_local.sh`: Script simple para desarrollo con `--reload`.
    - Crear `run_prod.sh`: Script optimizado para el VPS (sin reload, modo daemon opcional).

3.  **Limpieza de Archivos de Windows**:
    - Eliminar definitivamente [run_server.bat](file:///d:/myProjects/mcmatias/backend/run_server.bat).

4.  **Estructura de Directorios**:
    - Asegurar la existencia de una carpeta `logs/` para que Gunicorn pueda escribir sus registros.

**¿Procedo a realizar estos cambios ahora mismo?**