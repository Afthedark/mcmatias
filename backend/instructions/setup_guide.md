# Guía de Instalación y Ejecución del Proyecto Backend

Este documento detalla los pasos para configurar y ejecutar el proyecto backend (Django) en una nueva computadora o después de clonar el repositorio.

## Requisitos Previos

- Python instalado (se recomienda versión 3.10 o superior).
- MySQL instalado y corriendo (MySQL Server 8.0+ es recomendado por Django 5+).
- Terminal o consola de comandos (PowerShell, CMD, Bash).

## Pasos para la Configuración

### 1. Clonar el repositorio

Si aún no tienes el código, clona el repositorio en tu máquina local:

```bash
git clone <URL_DEL_REPOSITORIO>
cd mcmatias/backend
```

Asegúrate de estar ubicado en la carpeta `backend` donde se encuentra el archivo `manage.py`.

### 2. Crear el Entorno Virtual

Es fundamental usar un entorno virtual para aislar las dependencias del proyecto. Ejecuta el siguiente comando para crear una carpeta llamada `venv`:

```bash
python -m venv venv
```

### 3. Activar el Entorno Virtual

Debes activar el entorno virtual antes de instalar librerías o correr el servidor.

**En Windows (PowerShell):**
```powershell
.\venv\Scripts\activate
```

**En Windows (CMD):**
```cmd
.\venv\Scripts\activate.bat
```

**En Mac/Linux:**
```bash
source venv/bin/activate
```

*Deberías ver `(venv)` al inicio de tu línea de comandos.*

*Importante para salir del entorno virtual, escribe `deactivate`.*

### 4. Instalar Dependencias

Con el entorno activado, instala todas las librerías necesarias listadas en `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 5. Configurar Variables de Entorno

Crea un archivo llamado `.env` en la carpeta `backend` (al mismo nivel que `manage.py`) y define las credenciales de tu base de datos:

```env
DEBUG=True
SECRET_KEY=tu-clave-secreta-segura
DB_NAME=mcmatias_db
DB_USER=root
# DB_PASSWORD=  <-- Pon tu contraseña si tienes
DB_HOST=127.0.0.1
DB_PORT=3306
```

### 6. Configurar la Base de Datos

1.  Asegúrate de tener un servidor MySQL corriendo.
2.  Crea la base de datos si no existe:
    ```sql
    CREATE DATABASE mcmatias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
3.  Ejecuta las migraciones de Django para crear las tablas:
    ```bash
    python manage.py migrate
    ```

### 7. Ejecutar el Servidor

Finalmente, inicia el servidor de desarrollo:

```bash
python manage.py runserver
```

El proyecto estará disponible en [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

### 8. Actualizar Dependencias

Si instalas nuevas librerías en el proyecto (ej. `pip install libreria-nueva`), es importante actualizar el archivo `requirements.txt` para que otros desarrolladores tengan las mismas versiones.

Ejecuta el siguiente comando (siempre con el entorno virtual activado):

```bash
pip freeze > requirements.txt
```

Esto sobrescribirá `requirements.txt` con la lista exacta de paquetes instalados actualmente en tu entorno virtual `venv`.

---

## Solución de Problemas Comunes

- **Error: `MySQL 8.0.11 or later is required`**: Django 5.x y 6.x requieren versiones recientes de MySQL. Si tienes MySQL 5.7, deberás actualizar tu servidor MySQL o usar una versión anterior de Django (ej. 4.2), aunque se recomienda actualizar la base de datos.
- **Error: `[Errno 2] No such file or directory` al ejecutar manage.py**: Asegúrate de estar dentro de la carpeta `backend`.
