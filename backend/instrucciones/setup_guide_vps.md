# Guía de Despliegue en VPS (Linux) - MCMatias Backend

Este documento detalla los pasos para configurar, ejecutar y mantener el proyecto backend en un servidor privado virtual (VPS) utilizando **Gunicorn**, **Nginx** y **Systemd**.

---

## 1. Requisitos del Servidor (VPS)

- **Sistema Operativo**: Ubuntu 22.04 LTS o superior (recomendado).
- **Python**: Versión 3.10 o superior.
- **MySQL**: Versión 8.0+ o MariaDB 10.4+.
- **Nginx**: Para actuar como proxy inverso.

---

## 2. Configuración del Proyecto

### 2.1 Preparar el Entorno
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias de sistema
sudo apt install python3-pip python3-venv nginx mysql-server libmysqlclient-dev -y
```

### 2.2 Clonar e Instalar
```bash
cd /home/tu_usuario/
git clone <URL_DEL_REPOSITORIO>
cd mcmatias/backend

# Crear y activar entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.3 Variables de Entorno (.env)
Crea el archivo `.env` en la carpeta `backend`:
```env
DEBUG=False
SECRET_KEY=tu_clave_secreta_producion_muy_larga
DB_NAME=mcmatias_prod_db
DB_USER=usuario_prod
DB_PASSWORD=contraseña_segura
DB_HOST=localhost
DB_PORT=3306
ALLOWED_HOSTS=api.tudominio.com,tu_ip_vps
```

---

## 3. Base de Datos y Estáticos

```bash
# 1. Crear BD en MySQL
# mysql -u root -p
# CREATE DATABASE mcmatias_prod_db;

# 2. Aplicar migraciones
python manage.py migrate

# 3. Crear Superusuario
python manage.py createsuperuser

# 4. Recolectar archivos estáticos (CSS/JS del admin)
python manage.py collectstatic --noinput
```

---

## 4. Configuración de Gunicorn

El proyecto ya incluye un archivo de configuración profesional: `gunicorn.conf.py`.

### Ejecución de Prueba
```bash
# Usar el script de producción creado
bash run_prod.sh
```
*Gunicorn debería iniciar y escuchar en el puerto 8000.*

---

## 5. Automatización con Systemd (Servicio)

Para que el backend inicie solo y se reinicie si falla, crea un archivo de servicio:

`sudo nano /etc/systemd/system/mcmatias.service`

**Contenido de la plantilla:**
```ini
[Unit]
Description=Gunicorn instance to serve MCMatias Backend
After=network.target

[Service]
User=tu_usuario
Group=www-data
WorkingDirectory=/home/tu_usuario/mcmatias/backend
Environment="PATH=/home/tu_usuario/mcmatias/backend/venv/bin"
ExecStart=/home/tu_usuario/mcmatias/backend/venv/bin/gunicorn --config gunicorn.conf.py

[Install]
WantedBy=multi-user.target
```

**Comandos de gestión:**
```bash
sudo systemctl start mcmatias
sudo systemctl enable mcmatias  # Iniciar al arrancar el VPS
sudo systemctl status mcmatias  # Verificar estado
```

---

## 6. Configuración de Nginx (Proxy Inverso)

Nginx recibirá las peticiones de internet y las pasará a Gunicorn. También servirá las imágenes y el CSS.

`sudo nano /etc/nginx/sites-available/mcmatias`

**Contenido de la plantilla:**
```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    # Archivos Estáticos
    location /static/ {
        alias /home/tu_usuario/mcmatias/backend/staticfiles/;
    }

    # Archivos Media (Imágenes)
    location /media/ {
        alias /home/tu_usuario/mcmatias/backend/media/;
    }

    # Pasar todo lo demás a Gunicorn
    location / {
        include proxy_params;
        proxy_pass http://localhost:8000;
    }
}
```

**Activar sitio:**
```bash
sudo ln -s /etc/nginx/sites-available/mcmatias /etc/nginx/sites-enabled
sudo nginx -t  # Verificar sintaxis
sudo systemctl restart nginx
```

---

## 7. Logs y Mantenimiento

- **Logs de Gunicorn**: Revisar en `backend/logs/access.log` y `backend/logs/error.log`.
- **Logs de Systemd**: `sudo journalctl -u mcmatias`.
- **Actualizar Código**:
  ```bash
  git pull
  source venv/bin/activate
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py collectstatic --noinput
  sudo systemctl restart mcmatias
  ```

---

¡Tu backend está listo para producción en el VPS! 🚀
