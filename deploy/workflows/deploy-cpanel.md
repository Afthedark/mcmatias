---
description: Guía detallada para desplegar y actualizar la API sin perder datos en cPanel
---

# Despliegue y Mantenimiento en cPanel

Esta guía garantiza que tu aplicación funcione correctamente y que los datos de tus clientes estén seguros.

## 1. Configuración Inicial (Primera vez)

### 1.1 Crear la Aplicación Node.js
1. En cPanel, abre **"Setup Node.js App"** y crea la aplicación:
   - **Node.js version**: 18.x o superior
   - **Application mode**: `Production`
   - **Application root**: Carpeta donde subirás los archivos (ej: `api_backend`)
   - **Application URL**: Subdominio o carpeta pública (ej: `api`)
   - **Startup file**: `src/server.js`

### 1.2 Subir Archivos
1. Usa el **Administrador de Archivos** o **FTP/SFTP**.
2. Sube todos los archivos del proyecto a la carpeta `Application root`.
   - **NO subas** la carpeta `node_modules`.
   - **NO subas** la carpeta `.git` (opcional).
3. **IMPORTANTE**: Crea la estructura de carpetas para uploads:
   ```
   public/
   └── uploads/
       ├── images/
       └── videos/
   ```

### 1.3 Configurar Variables de Entorno
1. Crea el archivo `.env` en la raíz del servidor con los datos de producción:
   ```env
   PORT=3000
   DB_NAME=tienda_multicentro_matias
   DB_USER=tuusuario_cpanel
   DB_PASSWORD=tupassword_mysql
   DB_HOST=localhost
   JWT_SECRET=clave_secreta_produccion_muy_segura
   ```

### 1.4 Crear Base de Datos
1. En cPanel, ve a **"MySQL Databases"**.
2. Crea la base de datos: `tienda_multicentro_matias`.
3. Crea un usuario MySQL y asígnale todos los privilegios a esa base de datos.
4. Actualiza el `.env` con estos datos.

### 1.5 Instalar Dependencias
1. Vuelve a **"Setup Node.js App"**.
2. Haz clic en **"Run NPM Install"**.
3. Espera a que termine (puede tardar 1-2 minutos).

### 1.6 Inicializar la Base de Datos (Solo la primera vez)
1. Abre la **Terminal** de cPanel.
2. Navega a la carpeta de tu aplicación:
   ```bash
   cd api_backend
   ```
3. Activa el entorno virtual de Node (copia el comando que aparece en "Setup Node.js App"):
   ```bash
   source /home/tuusuario/nodevenv/api_backend/18/bin/activate && cd /home/tuusuario/api_backend
   ```
4. Ejecuta el seed:
   ```bash
   node src/seed.js
   ```

### 1.7 Iniciar la Aplicación
1. En **"Setup Node.js App"**, haz clic en **"Start App"** o **"Restart"**.
2. Verifica que el estado sea **"Running"**.

---

## 2. Cómo Actualizar el Código (Cambios de Lógica)

Cada vez que hagas cambios en tus controladores, rutas o servicios:

1. **Sube los archivos modificados** mediante FTP o el Administrador de Archivos.
2. Si agregaste **nuevas dependencias** (ejecutaste `npm install` localmente):
   - Ve a **"Setup Node.js App"**.
   - Haz clic en **"Run NPM Install"**.
3. **REINICIO OBLIGATORIO**:
   - Ve a **"Setup Node.js App"**.
   - Haz clic en **"Restart"**.
   - Sin esto, el servidor seguirá ejecutando el código antiguo.

---

## 3. Cómo Actualizar la Base de Datos (SIN perder datos)

> [!CAUTION]
> **NUNCA** uses `sync({ force: true })` en producción, ya que esto borra todas las tablas y datos.

### Opción A: Uso de `alter: true` (Automático)
Si agregaste campos nuevos o nuevas tablas, modifica temporalmente `src/server.js`:

```javascript
await sequelize.sync({ alter: true });
```

Luego reinicia la aplicación. Esto actualizará la estructura sin borrar datos.

**IMPORTANTE:** Después de la actualización, vuelve a cambiar a:
```javascript
await sequelize.sync();
```

### Opción B: Cambios Manuales en phpMyAdmin (Recomendado)
Si solo agregaste una columna (ej: `telefono` en Clientes):
1. Ve a **phpMyAdmin** en cPanel.
2. Selecciona la tabla correspondiente.
3. Haz clic en "Estructura" → "Agregar columna".
4. Define el campo para que coincida con tu modelo de Sequelize.

---

## 4. Manejo de Archivos Subidos (Imágenes/Videos)

1. La carpeta `public/uploads/` debe tener permisos de escritura (755 o 775).
2. Verifica que existan las subcarpetas `images/` y `videos/`.
3. Los archivos cargados desde el frontend se guardarán automáticamente aquí.
4. **Backup periódico**: Descarga regularmente la carpeta `uploads/` por FTP como respaldo.

---

## 5. Seguridad en Producción

- [ ] Cambia el `JWT_SECRET` en el `.env` de producción.
- [ ] Usa contraseñas seguras para MySQL.
- [ ] Activa HTTPS/SSL en tu dominio (cPanel lo ofrece gratis con Let's Encrypt).
- [ ] Configura CORS en `src/app.js` para permitir solo tu dominio frontend:
  ```javascript
  app.use(cors({
    origin: 'https://tufrontend.com'
  }));
  ```

---

## 6. Checklist de Actualización

Antes de cada actualización, verifica:

- [ ] ¿Subí los archivos modificados?
- [ ] ¿Ejecuté "Run NPM Install" si agregué dependencias?
- [ ] ¿Reinicié la aplicación desde "Setup Node.js App"?
- [ ] ¿Actualicé la estructura de la BD si hice cambios en los modelos?
- [ ] ¿Probé la API con una petición de prueba (Postman/Axios)?
- [ ] ¿Hice un backup de la base de datos antes de cambios importantes?

---

## 7. Solución de Problemas Comunes

### Error: "Cannot find module 'xyz'"
- **Causa**: Falta una dependencia.
- **Solución**: Ejecuta "Run NPM Install" en cPanel.

### Error: "EADDRINUSE" (Puerto ocupado)
- **Causa**: La app no se detuvo correctamente.
- **Solución**: Haz clic en "Stop" y luego "Start" en "Setup Node.js App".

### La API no responde después de actualizar
- **Causa**: No reiniciaste la aplicación.
- **Solución**: Siempre haz clic en "Restart" después de subir cambios.

### No puedo subir archivos (error 500)
- **Causa**: Permisos incorrectos en la carpeta `public/uploads/`.
- **Solución**: Cambia los permisos a 755 o 775 en el Administrador de Archivos.
