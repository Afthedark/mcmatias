import multiprocessing
import os

# Configuración básica
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"  # Estándar para Django WSGI
timeout = 120
keepalive = 5

# Aplicación WSGI
wsgi_app = "config.wsgi:application"

# Logging
# Asegúrate de que la carpeta 'logs' exista
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"

# Recarga automática (solo útil en desarrollo, pero se puede sobrescribir por CLI)
reload = False

# Nombre del proceso
proc_name = "mcmatias_backend"
