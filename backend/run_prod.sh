#!/bin/bash

# Script para ejecutar Gunicorn en Producción (VPS)
echo "Iniciando Gunicorn en Producción (MCMatias Backend)..."

# Activar entorno virtual (ajustar a la ruta de tu VPS)
# Ejemplo: source /home/usuario/proyectos/mcmatias/venv/bin/activate
# Por ahora intentamos detectar una carpeta venv local
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Ejecutar Gunicorn usando la configuración de gunicorn.conf.py
gunicorn --config gunicorn.conf.py
