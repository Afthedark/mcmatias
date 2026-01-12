# Guía de Instalación y Ejecución del Proyecto Backend - MCMatias

Este documento detalla los pasos para configurar, ejecutar y mantener el proyecto backend (Django) en una nueva computadora o después de clonar el repositorio.

## 1. Requisitos Previos

- **Python**: Versión 3.10 o superior recomendada.
- **MySQL**: Versión 8.0+ o MariaDB 10.4+.
- **pip**: Gestor de paquetes de Python.
- **Terminal**: PowerShell, Bash, o CMD.

---

## 2. Pasos para la Configuración

### 2.1 Clonar el repositorio
Si aún no tienes el código localmente:
```bash
git clone <URL_DEL_REPOSITORIO>
cd mcmatias/backend
```
*Asegúrate de estar ubicado en la carpeta `backend` (donde reside `manage.py`).*

### 2.2 Crear el Entorno Virtual
Crea un aislamiento para las librerías del proyecto:
```bash
python -m venv venv
```

### 2.3 Activar el Entorno Virtual
Debes activarlo siempre antes de trabajar en el proyecto.

- **Windows (PowerShell):** `.\venv\Scripts\activate`
- **Windows (CMD):** `.\venv\Scripts\activate.bat`
- **Mac/Linux:** `source venv/bin/activate`

*Deberías ver `(venv)` al inicio de tu línea de comandos.*

### 2.4 Instalar Dependencias
Instala todas las librerías necesarias:
```bash
pip install -r requirements.txt
```

### 2.5 Configurar Variables de Entorno (.env)
Crea un archivo llamado `.env` en la carpeta `backend` y define tus credenciales:

```env
DEBUG=True
SECRET_KEY=tu_clave_secreta_segura
DB_NAME=mcmatias_db
DB_USER=root
DB_PASSWORD=xxxxxx  # Si tu MySQL tiene contraseña
DB_HOST=127.0.0.1
DB_PORT=3306
```

---

## 3. Base de Datos (MySQL/MariaDB)

Este proyecto usa **PyMySQL** como driver para maximizar la compatibilidad (especialmente con cPanel).

### 3.1 Crear la Base de Datos
1.  Asegúrate de tener un servidor MySQL/MariaDB corriendo.
2.  Crea la base de datos:
    ```sql
    CREATE DATABASE mcmatias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

### 3.2 Aplicar Migraciones (Crea Tablas + Datos Iniciales)
Ejecuta las migraciones que crearán automáticamente:
- ✅ Todas las tablas del sistema
- ✅ **5 Roles** (Super Administrador, Administrador, Técnico, Cajero, Técnico y Cajero)
- ✅ **Sucursal Central** (oficina matriz)

```bash
python manage.py migrate
```

**Salida esperada**:
```
Applying api.0006_initial_data...
✅ Roles iniciales creados
✅ Sucursal principal creada
 OK
```

### 3.3 Crear tu Superusuario
Crea tu usuario administrador de forma interactiva:

```bash
python manage.py createsuperuser
```

Django te preguntará:
```
Correo electronico: admin@tuempresa.com
Nombre apellido: Tu Nombre Completo
Password: ********
Password (again): ********
Superuser created successfully.
```

El sistema **automáticamente asignará**:
- 👑 Rol: Super Administrador (numero_rol=1)
- 🏢 Sucursal: Sucursal Central

---

## 4. Ejecución del Servidor

Inicia el servidor de desarrollo:
```bash
python manage.py runserver
```

### URLs Importantes:
- **API Root**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Login (Obtener Token)**: [http://127.0.0.1:8000/api/token/](http://127.0.0.1:8000/api/token/)
- **Documentación Swagger**: [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)
- **Panel Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 5. Autenticación JWT

El sistema utiliza **SimpleJWT**. Para usar la API en modo protegido:
1.  Haz un `POST` a `/api/token/` con tus credenciales.
2.  Copia el `access` token.
3.  Inclúyelo en tus peticiones futuras en el header de Autenticación:
    `Authorization: Bearer <TU_TOKEN>`

Los tokens expiran cada **60 minutos** (Access) y **1 día** (Refresh).

---

## 6. Sistema RBAC (Control de Acceso por Roles)

El sistema implementa control de acceso automático:

### Roles Creados Automáticamente
| numero_rol | Nombre | Acceso |
|------------|--------|--------|
| 1 | Super Administrador | 👑 Ve y gestiona TODO (todas las sucursales) |
| 2 | Administrador | 🔒 Solo su sucursal |
| 3 | Técnico | 🔒 Solo su sucursal |
| 4 | Cajero | 🔒 Solo su sucursal |
| 5 | Técnico y Cajero | 🔒 Solo su sucursal |

### Módulos Aislados por Sucursal
Los siguientes módulos filtran automáticamente por sucursal del usuario:
- Usuarios
- Inventario
- Ventas
- Servicios Técnicos

### Módulos Globales
Estos datos son compartidos entre todas las sucursales:
- Productos
- Clientes
- Categorías

---

## 7. Características Especiales

### Inicialización Automática de Datos
El sistema incluye una **data migration** (`0006_initial_data.py`) que crea automáticamente:
- ✅ Roles predefinidos con jerarquía numérica
- ✅ Sucursal principal

Esto garantiza que siempre puedas usar `python manage.py createsuperuser` sin errores.

### Comando de Setup Manual (Opcional)
Si necesitas recrear datos o crear un superusuario con credenciales por defecto:
```bash
python manage.py setup_initial_data --create-superuser
```

Esto crea:
- Roles y Sucursal (si no existen)
- Superusuario: `admin@mcmatias.com` / `admin123`

### Documentación Automática (Swagger)
El proyecto usa `drf-spectacular`. Cada vez que agregues una vista o modelo, la documentación en la URL de Swagger se actualizará automáticamente.

### Gestión de Imágenes (Media)
Las imágenes se guardan en `backend/media/uploads/images/`.
- En **desarrollo**, Django las sirve automáticamente si `DEBUG=True`.
- En **producción (cPanel)**, consulta la guía `deployment_cpanel.md` para configurar el enlace simbólico necesario.

### Actualizar Dependencias
Si instalas nuevas librerías (ej. `pip install xxxx`), actualiza el archivo de requerimientos:
```bash
pip freeze > requirements.txt
```

---

## 8. Solución de Problemas Comunes

### Error: "Column 'id_rol' cannot be null"
**Causa**: Intentaste crear un superusuario antes de ejecutar `migrate`.

**Solución**:
```bash
python manage.py migrate  # Esto crea Roles y Sucursales automáticamente
python manage.py createsuperuser  # Ahora funcionará
```

### Error: "No existe el rol Super Administrador (numero_rol=1)"
**Causa**: La data migration no se ejecutó correctamente.

**Solución**:
```bash
# Opción 1: Recrear manualmente
python manage.py setup_initial_data

# Opción 2: Verificar migración
python manage.py showmigrations api
# Debe aparecer [X] api.0006_initial_data
```

### Error: `MySQL 8.0.11 or later is required`
Django 5.x/6.x requiere versiones recientes. Si usas una versión antigua de MySQL, se recomienda actualizar o aplicar el parche de PyMySQL incluido en `config/__init__.py`.

### Error: `[Errno 2] No such file or directory`
Verifica que estés dentro de la carpeta `backend` antes de ejecutar comandos de Python.

---

## 9. Reseteo de Base de Datos

Si necesitas empezar de cero:

```bash
# 1. Borrar BD (desde MySQL)
mysql -u root -p
DROP DATABASE mcmatias_db;
CREATE DATABASE mcmatias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. Aplicar migraciones (recrea TODO automáticamente)
python manage.py migrate

# 3. Crear superusuario
python manage.py createsuperuser

# 4. Listo!
python manage.py runserver
```

---

## 10. Resumen del Flujo de Instalación

```bash
# Setup inicial (una sola vez)
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configurar .env con credenciales MySQL

# Base de datos
CREATE DATABASE mcmatias_db;  # En MySQL
python manage.py migrate      # Crea tablas + Roles + Sucursal automáticamente

# Usuario admin
python manage.py createsuperuser  # Interactivo

# Correr servidor
python manage.py runserver
```

¡Listo para desarrollar! 🚀

