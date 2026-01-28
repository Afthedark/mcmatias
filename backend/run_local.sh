#!/bin/bash

# Script para ejecutar Gunicorn localmente (Linux/WSL)
echo "Iniciando Gunicorn Local (Desarrollo)..."

# Activar entorno virtual si existe (ajustar ruta si es necesario)
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Ejecutar Gunicorn con recarga automática para desarrollo
gunicorn --config gunicorn.conf.py --reload
