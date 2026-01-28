import multiprocessing
import os

# Dirección y puerto (0.0.0.0 permite acceso externo)
bind = "0.0.0.0:8000"

# Workers y Threads
workers = multiprocessing.cpu_count() * 2 + 1
threads = 2
worker_class = "sync"

# Aplicación WSGI principal
wsgi_app = "config.wsgi:application"

# Timeout
timeout = 120

# Logs (Rutas relativas para mayor compatibilidad)
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"

# Configuración de producción
reload = False
preload_app = True
max_requests = 1000
max_requests_jitter = 100
