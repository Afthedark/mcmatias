import multiprocessing
import os

# Dirección y puerto
bind = "127.0.0.1:8000"

# Workers (procesos)
workers = multiprocessing.cpu_count() * 2 + 1

# Threads por worker
threads = 2

# Tipo de worker
worker_class = "sync"

# Timeout
timeout = 120

# Logs
accesslog = "/webapps/mcmatias/backend/logs/access.log"
errorlog = "/webapps/mcmatias/backend/logs/error.log"
loglevel = "info"

# Recarga automática en desarrollo (DESACTIVAR en producción)
reload = False

# Seguridad
preload_app = True
max_requests = 1000
max_requests_jitter = 100