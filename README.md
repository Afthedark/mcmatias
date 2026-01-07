# Backend API - MultiCentro Matias

Sistema de gestión completo para tienda multicentro, incluyendo control de inventario, ventas, servicios técnicos y más. Construido con Node.js, Express y Sequelize ORM.

## 🚀 Tecnologías

- **Node.js** & **Express**: Servidor y ruteo.
- **MySQL**: Base de datos relacional.
- **Sequelize**: ORM para gestión de modelos y base de datos.
- **JWT (JSON Web Token)**: Autenticación segura.
- **BcryptJS**: Encriptación de contraseñas.
- **Multer**: Manejo de carga de archivos (imágenes y videos).
- **CORS & Morgan**: Middlewares de seguridad y logging.

## 📂 Estructura del Proyecto (MVC)

```text
/
├── src/                    # Backend (API)
│   ├── config/             # Configuración de base de datos
│   ├── controllers/        # Lógica de negocio (Controladores)
│   ├── db_test/            # Scripts de prueba y seed de DB
│   ├── middleware/         # Middlewares (Autenticación JWT, Upload)
│   ├── models/             # Modelos de Sequelize (Base de Datos)
│   ├── routes/             # Definición de Endpoints (Rutas)
│   ├── utils/              # Utilidades y helpers
│   └── app.js              # Punto de entrada principal
├── frontend/               # Frontend (MPA) - Ver README completo en frontend/README_frontend.md
│   ├── index.html          # Landing page del negocio
│   ├── login.html          # Página de autenticación
│   ├── dashboard.html      # Dashboard principal
│   ├── assets/             # Recursos estáticos
│   │   ├── css/            # Estilos AdminLTE, componentes y responsive
│   │   ├── js/             # Módulos JavaScript (core, components, pages)
│   │   └── img/            # Imágenes del sistema
│   └── pages/              # Páginas de módulos específicos
└── public/
    └── uploads/            # Archivos subidos (imágenes/videos)
        ├── images/
        └── videos/
```

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio** e instalar dependencias:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz con el siguiente contenido:
   ```env
   PORT=3000
   DB_NAME=tienda_multicentro_matias
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   JWT_SECRET=tu_clave_secreta
   ```

3. **Crear la base de datos** en MySQL:
   ```sql
   CREATE DATABASE tienda_multicentro_matias;
   ```

4. **Sincronizar modelos y poblar datos iniciales (Solo al inicio)**:
   ```bash
   npm run seed
   ```
   
   > ⚠️ **Importante**: Este comando solo debe ejecutarse la primera vez que configures el sistema. Crea los roles, categorías, sucursal principal y usuario administrador por defecto.
   >
   > **Credenciales del administrador:**
   > - Email: `admin@multicentromatias.com`
   > - Contraseña: `admin123`

5. **Iniciar el servidor**:
   ```bash
   npm run dev  # Iniciar backend (API)
   ```

## 🚀 Desarrollo Local (Arquitectura Separada)

Para desarrollo local, usamos una arquitectura separada con Live Server para el frontend:

### Configuración Requerida

1. **Backend**: Iniciar servidor Node.js
   ```bash
   npm run dev  # Backend en http://localhost:3000
   ```

2. **Frontend**: Iniciar Live Server desde VS Code
   - Abre `frontend/login.html` en VS Code
   - Haz clic derecho → "Open with Live Server"
   - O usa la extensión Live Server

### URLs de Acceso Local
- **Frontend**: `http://127.0.0.1:5500/frontend/login.html` (Live Server)
- **Backend API**: `http://localhost:3000/api/` (Node.js)
- **Archivos subidos**: `http://localhost:3000/uploads/`

### Ventajas de esta arquitectura:
- ✅ Hot reload automático en el frontend
- ✅ Depuración independiente (dos consolas)
- ✅ Desarrollo tradicional y familiar
- ✅ CORS configurado para desarrollo local
- ✅ Más flexible para diferentes entornos
- ✅ Sin necesidad de reiniciar servidor para cambios en frontend
- ✅ Optimizado para desarrollo frontend

## 🔧 Configuración de Entorno

### Desarrollo (.env)
```env
PORT=3000
DB_NAME=tienda_multicentro_matias
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
JWT_SECRET=clave_secreta_desarrollo
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Producción (.env)
```env
PORT=3000
DB_NAME=tienda_multicentro_matias
DB_USER=tu_usuario_cpanel
DB_PASSWORD=tu_contraseña_mysql
DB_HOST=localhost
JWT_SECRET=clave_muy_segura_para_produccion
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
```

## 🌐 Integración Frontend-Backend

### Desarrollo Local
- Backend sirve frontend estático desde `../frontend/`
- Todo en el mismo dominio: `localhost:3000`
- Sin configuración CORS adicional

### Producción (cPanel)
- Frontend: `https://tu-dominio.com/` (servido por Apache/Nginx)
- Backend API: `https://api.tu-dominio.com/api/` (subdominio)
- CORS configurado para dominio específico

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar un nuevo usuario.
- `POST /api/auth/login` - Iniciar sesión y obtener token JWT.

### Gestión Básica (Requieren Token JWT)
- `GET/POST/PUT/DELETE /api/sucursales` - CRUD de Sucursales.
- `GET/POST/PUT/DELETE /api/clientes` - CRUD de Clientes.

### Productos (Con carga de imagen)
- `GET /api/productos` - Listar todos los productos.
- `GET /api/productos/:id` - Obtener producto por ID.
- `POST /api/productos` - Crear producto (incluir `foto_producto` como FormData).
- `PUT /api/productos/:id` - Actualizar producto.
- `DELETE /api/productos/:id` - Eliminar producto.

### Inventario
- `GET /api/inventario` - Ver todo el inventario.
- `GET /api/inventario/sucursal/:id_sucursal` - Inventario por sucursal.
- `GET /api/inventario/producto/:id_producto` - Stock de un producto en todas las sucursales.
- `POST /api/inventario` - Agregar inventario.
- `PUT /api/inventario/:id` - Actualizar cantidades.
- `DELETE /api/inventario/:id` - Eliminar registro.

### Ventas (Con transacciones automáticas)
- `GET /api/ventas` - Listar todas las ventas.
- `GET /api/ventas/:id` - Ver detalle de una venta.
- `POST /api/ventas` - Crear venta (descuenta inventario automáticamente).
- `DELETE /api/ventas/:id` - Cancelar venta (restaura inventario).

**Ejemplo de cuerpo para crear venta:**
```json
{
  "numero_boleta": "BOL-001",
  "id_cliente": 1,
  "id_usuario": 2,
  "detalles": [
    {
      "id_producto": 5,
      "cantidad": 2,
      "precio_venta": 50.00,
      "id_sucursal": 1
    }
  ]
}
```

### Servicios Técnicos (Con carga de hasta 3 fotos)
- `GET /api/servicios` - Listar servicios técnicos.
- `GET /api/servicios/:id` - Ver servicio por ID.
- `POST /api/servicios` - Crear servicio (incluir `foto_1`, `foto_2`, `foto_3` como FormData).
- `PUT /api/servicios/:id` - Actualizar servicio.
- `DELETE /api/servicios/:id` - Eliminar servicio.

## 📤 Carga de Archivos

El sistema soporta carga de imágenes y videos:
- **Imágenes**: JPEG, PNG, GIF, WEBP
- **Videos**: MP4, MPEG, MOV, WEBM
- **Límite**: 10 MB por archivo
- **Ubicación**: `public/uploads/images` o `public/uploads/videos`

**Acceso a archivos:**
Los archivos subidos son accesibles vía:
```
http://tudominio.com/uploads/images/nombre-archivo.jpg
```

## 🎨 Frontend

El proyecto incluye un frontend moderno y completo con arquitectura MPA (Multi-Page Application). Para documentación detallada del frontend, ver: **[frontend/README_frontend.md](frontend/README_frontend.md)**

### Características Principales:
- **Diseño AdminLTE-inspired** con Bootstrap 5
- **JavaScript ES6+ modular** sin frameworks pesados
- **Sistema completo de autenticación** con JWT
- **Componentes reutilizables** y tabla de datos avanzadas
- **Responsive design** para todos los dispositivos
- **Integración completa** con backend API

### Módulos del Frontend:
- ✅ **Landing Page** profesional
- ✅ **Sistema de Login** con validación completa
- ✅ **Dashboard** con KPIs y gráficos
- 🔄 **Gestión de Clientes** (en desarrollo)
- 🔄 **Gestión de Productos** (en desarrollo)
- 🔄 **Control de Inventario** (en desarrollo)
- 🔄 **Sistema de Ventas** (en desarrollo)
- 🔄 **Servicios Técnicos** (en desarrollo)

## ☁️ Despliegue (cPanel)

Para instrucciones detalladas sobre cómo subir y actualizar este backend en un hosting con cPanel, consulta la guía interna:
`./deploy/workflows/deploy-cpanel.md`

## 📝 Estado de Implementación

### Backend (API) - ✅ COMPLETO
1. ✅ **Autenticación**: Login/Register con JWT
2. ✅ **Roles y Usuarios**: Control de acceso por roles (cajero, técnico, administrador)
3. ✅ **Sucursales**: Gestión de múltiples sucursales
4. ✅ **Clientes**: Base de datos de clientes
5. ✅ **Categorías**: Unificadas para productos y servicios
6. ✅ **Productos**: Con carga de imágenes
7. ✅ **Inventario**: Control de stock por sucursal
8. ✅ **Ventas**: Sistema transaccional con descuento automático de inventario
9. ✅ **Servicios Técnicos**: Con carga de 3 fotos y gestión de estados

### Frontend (Ver documentación completa en frontend/README_frontend.md)
1. ✅ **Arquitectura Base**: Estructura modular completa
2. ✅ **Sistema de Autenticación**: JWT con refresh automático
3. ✅ **Dashboard Principal**: KPIs y gráficos con Chart.js
4. ✅ **Core JavaScript Modules**: API, Auth, Storage, UI, Router
5. ✅ **Diseño Responsivo**: Mobile-first con breakpoints completos
6. ✅ **Componentes UI**: Modals, tables, forms, alerts
7. 🔄 **Módulos de Negocio**: Clientes, Productos, Ventas, etc.
8. ⏳ **Perfiles y Configuración**: Usuarios avanzados y settings

## 🔒 Notas de Seguridad

- Las contraseñas se guardan siempre hasheadas con bcrypt.
- Los endpoints (excepto login/register) requieren autenticación JWT.
- Validación de stock antes de confirmar ventas.
- Transacciones atómicas para garantizar consistencia de datos.
- No olvides cambiar el `JWT_SECRET` en producción.

## 📌 Scripts Disponibles

```bash
npm start          # Inicia el servidor en producción
npm run dev        # Inicia el servidor en modo desarrollo (con nodemon)
npm run seed       # Ejecuta el seed de la base de datos (solo una vez al inicio)
```
