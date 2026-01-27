## Objetivo
Preparar el backend para producción (VPS) asegurando el manejo correcto de subida de archivos (imágenes/videos) y corrigiendo la configuración de Git.

## 1. Configuración de límites de subida (10 MB)
- **Archivo**: [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py)
- **Acción**: Agregar las siguientes configuraciones para permitir uploads de hasta 10 MB:
  ```python
  DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
  FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
  ```
  *Nota*: Esto evita errores `413 Request Entity Too Large` a nivel de Django (si Nginx está delante, también requerirá `client_max_body_size 10M`, pero eso es config de servidor).

## 2. Ajuste de .gitignore para Media
- **Archivo**: [backend/.gitignore](file:///d:/myProjects/mcmatias/backend/.gitignore)
- **Acción**: Modificar la sección de `media/` para que:
  1. Ignore todo el contenido (`media/*`).
  2. Mantenga la estructura de carpetas usando `.gitkeep` (`!media/.gitkeep`).
  3. Esto asegura que la carpeta exista en el VPS al clonar, pero sin “basura” local, y con permisos listos para escritura.

## 3. Verificación de permisos y estructura
- **Acción**:
  - Asegurar que existe `backend/media/.gitkeep` (crearlo si no existe).
  - Verificar que `backend/media` tenga permisos de escritura (en local es automático, en VPS se gestiona al desplegar, pero la estructura ayuda).

## Pasos de ejecución
1. Modificar [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py) con los límites de 10 MB.
2. Actualizar [backend/.gitignore](file:///d:/myProjects/mcmatias/backend/.gitignore) con las reglas de exclusión/inclusión.
3. Crear el archivo `backend/media/.gitkeep` para persistencia en Git.
4. Verificar la configuración ejecutando `manage.py check`.
