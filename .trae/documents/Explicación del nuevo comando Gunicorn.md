**Plan: Creación de setup\_guide\_vps.md**

Crearé una guía completa y profesional adaptada específicamente para el despliegue en un VPS (Linux/Ubuntu), integrando todas las mejoras que hemos realizado (Gunicorn, python-dotenv, etc.).

**Contenido de la nueva guía `setup_guide_vps.md`:**

1.  **Preparación del VPS**: Requisitos de sistema (Linux), instalación de Python y MySQL.
2.  **Configuración del Entorno**:
    *   Clonación y creación de `venv` (estilo Linux).
    *   Instalación de dependencias (incluyendo Gunicorn).
    *   Configuración del `.env` para producción (`DEBUG=False`).
3.  **Base de Datos en Producción**: Pasos para crear la BD y aplicar migraciones.
4.  **Servidor de Aplicación (Gunicorn)**:
    *   Uso de `gunicorn.conf.py`.
    *   Ejecución mediante `run_prod.sh`.
5.  **Despliegue Profesional (Extras Críticos)**:
    *   **Systemd**: Plantilla y comandos para que el backend inicie solo con el servidor.
    *   **Nginx**: Plantilla de configuración para servir archivos estáticos/media y actuar como proxy.
6.  **Mantenimiento**: Gestión de logs en la carpeta `logs/` y comandos de actualización.

**¿Deseas que proceda a crear este archivo en `backend/instrucciones/setup_guide_vps.md`?**