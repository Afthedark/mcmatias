# Frontend MultiCentro Matias

Frontend moderno y responsivo para el sistema de gestión multicentro MultiCentro Matias, construido con tecnologías web estándar y arquitectura escalable.

## 🎯 **Descripción del Proyecto**

Frontend MultiCentro Matias es una aplicación web **Multi-Page (MPA)** moderna y responsiva que proporciona una interfaz intuitiva y profesional para gestionar todas las operaciones de un negocio multicentro. Incluye gestión de ventas, inventario, clientes, servicios técnicos y más, con un diseño inspirado en AdminLTE y completamente integrado con el backend Node.js existente.

### **Backend API**
Para información detallada del backend y API endpoints, consulta: **[README.md](../README.md)**

## 🚀 **Tecnologías Utilizadas**

### **Frontend Stack**
- **HTML5**: Semántico y accesible
- **Bootstrap 5**: Framework CSS principal
- **Vanilla JavaScript (ES6+)**: Sin frameworks pesados
- **Font Awesome 6**: Iconos vectoriales

### **Librerías Externas**
- **Axios**: Cliente HTTP para API
- **Chart.js**: Gráficos interactivos
- **SweetAlert2**: Alertas modernas
- **DataTables**: Tablas avanzadas con paginación
- **Bootstrap Icons**: Iconos adicionales

### **Arquitectura**
- **MPA (Multi-Page Application)**: Navegación tradicional
- **MVC Pattern**: Modelos, Vistas y Controladores
- **Component-Based**: Componentes reutilizables
- **Module System**: JavaScript ES6 modules

## 📁 **Estructura del Proyecto**

```
frontend/
├── 📄 index.html                    # Landing page pública
├── 📄 login.html                    # Página de autenticación
├── 📄 dashboard.html                # Dashboard principal
├── 📁 pages/                        # Páginas de módulos
│   ├── 📄 clientes.html            # CRUD Clientes
│   ├── 📄 productos.html           # CRUD Productos
│   ├── 📄 sucursales.html          # CRUD Sucursales
│   ├── 📄 inventario.html          # Control Inventario
│   ├── 📄 ventas.html              # Gestión Ventas
│   ├── 📄 servicios.html           # Servicios Técnicos
│   └── 📄 perfil.html              # Perfil de usuario
├── 📁 assets/                       # Recursos estáticos
│   ├── 📁 css/
│   │   ├── 📄 adminlte.css         # Estilos AdminLTE
│   │   ├── 📄 components.css       # Componentes UI
│   │   └── 📄 responsive.css       # Media queries
│   ├── 📁 js/
│   │   ├── 📁 core/                # Módulos centrales
│   │   │   ├── 📄 api.js          # Cliente HTTP
│   │   │   ├── 📄 auth.js         # Gestión JWT
│   │   │   ├── 📄 storage.js      # LocalStorage/SessionStorage
│   │   │   ├── 📄 ui.js           # Utilidades UI
│   │   │   └── 📄 router.js       # Navegación MPA
│   │   ├── 📁 components/          # Componentes JS
│   │   │   ├── 📄 navbar.js
│   │   │   ├── 📄 sidebar.js
│   │   │   ├── 📄 modal.js
│   │   │   └── 📄 table.js
│   │   └── 📁 pages/              # Lógica por página
│   │       ├── 📄 dashboard.js
│   │       ├── 📄 clientes.js
│   │       ├── 📄 productos.js
│   │       └── 📄 ...
│   ├── 📁 img/                     # Imágenes del sistema
│   └── 📁 libs/                    # Librerías externas
└── 📁 public/                      # Archivos estáticos
    └── 📁 uploads/                 # Link a uploads backend
```

## 🎨 **Características de Diseño**

### **Diseño AdminLTE-Inspired**
- **Sidebar izquierda**: Navegación principal collapsible
- **Topbar**: Usuario, notificaciones, breadcrumb
- **Content area**: Espacio principal dinámico
- **Footer**: Información del sistema

### **Paleta de Colores**
- **Primary**: `#0d6efd` (Bootstrap Blue)
- **Secondary**: `#6c757d` (Gray)
- **Success**: `#198754` (Green)
- **Danger**: `#dc3545` (Red)
- **Warning**: `#ffc107` (Yellow)
- **Info**: `#0dcaf0` (Cyan)
- **Dark**: `#343a40` (Sidebar)

### **Componentes UI**
- **Cards**: Contenedores con sombras y bordes redondeados
- **KPI Cards**: Métricas con iconos y colores temáticos
- **Modals**: Emergentes con backdrop y validaciones
- **Tables**: DataTables con paginación y búsqueda
- **Forms**: Validación en tiempo real y feedback visual
- **Alerts**: Notificaciones toast no intrusivas

## 📱 **Diseño Responsivo**

### **Breakpoints**
- **Extra Small**: `< 576px` (Móviles)
- **Small**: `576px - 768px` (Tablets verticales)
- **Medium**: `768px - 992px` (Tablets horizontales)
- **Large**: `992px - 1200px` (Desktop)
- **Extra Large**: `≥ 1200px` (Desktop grande)

### **Características Móviles**
- **Sidebar Collapsible**: Menú hamburguesa con overlay
- **Touch-Friendly**: Botones y áreas táctiles optimizadas
- **Scrollable Tables**: Tablas responsive con scroll horizontal
- **Adaptive Layout**: Reorganización inteligente de contenido

## 🔐 **Sistema de Autenticación**

### **JWT Implementation**
- **Token Storage**: LocalStorage seguro con prefijo
- **Auto-refresh**: Renovación automática antes de expiración
- **Route Protection**: Verificación en cada página protegida
- **Role-Based Access**: Permisos según rol de usuario

### **Flujo de Autenticación**
1. **Login**: Validación de credenciales con backend
2. **Token Generation**: JWT con expiración de 8 horas
3. **Storage**: Guardado seguro con recordatorio opcional
4. **Auto-logout**: Redirección automática al expirar

### **Roles y Permisos**
- **Administrador**: Acceso completo a todos los módulos
- **Cajero**: Ventas y gestión de clientes
- **Técnico**: Servicios técnicos y seguimiento

## 🛠️ **Módulos JavaScript Core**

### **API Client (`core/api.js`)**
```javascript
// Cliente HTTP con interceptores
class ApiClient {
  // GET, POST, PUT, DELETE genéricos
  // Upload de archivos con progress
  // Manejo global de errores
  // Auto-inyección de token JWT
}
```

### **Auth Manager (`core/auth.js`)**
```javascript
// Gestión de autenticación
class AuthManager {
  // Login, logout, register
  // Validación de tokens
  // Verificación de roles
  // Refresh automático
}
```

### **Storage Manager (`core/storage.js`)**
```javascript
// Gestión de almacenamiento local
class StorageManager {
  // LocalStorage y SessionStorage
  // Métodos tipados y seguros
  // Prefijos automáticos
  // Data persistence
}
```

### **UI Manager (`core/ui.js`)**
```javascript
// Utilidades de interfaz
class UIManager {
  // Toast notifications (SweetAlert2)
  // Modales dinámicos
  // Loading states
  // Form validation
  // Formatting utilities
}
```

### **Router Manager (`core/router.js`)**
```javascript
// Gestión de navegación MPA
class RouterManager {
  // Navegación entre páginas
  // Protección de rutas
  // Breadcrumbs automáticos
  // Historial de navegación
}
```

## 📊 **Dashboard Principal**

### **KPIs en Tiempo Real**
- **Ventas del Día**: Total y cantidad de transacciones
- **Clientes Activos**: Número de clientes registrados
- **Stock Bajo**: Alertas de productos con bajo inventario
- **Servicios Pendientes**: Conteo de servicios en proceso

### **Gráficos Interactivos**
- **Ventas Últimos 7 Días**: Línea temporal con Chart.js
- **Productos Más Vendidos**: Gráfico de donut interactivo
- **Actualización Automática**: Refresh cada 5 minutos

### **Tablas de Actividad**
- **Ventas Recientes**: Últimas 5 transacciones
- **Servicios Técnicos**: Últimos servicios con estados
- **Enlaces Directos**: Acceso rápido a módulos completos

## 🔗 **Integración con Backend API**

### **Endpoints Disponibles**
El frontend está diseñado para integrarse completamente con el backend API:

```javascript
const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  
  // Clientes (Backend: ✅ Completo, Frontend: 🔄 En desarrollo)
  CLIENTES: {
    LIST: '/clientes',
    GET: (id) => `/clientes/${id}`,
    CREATE: '/clientes',
    UPDATE: (id) => `/clientes/${id}`,
    DELETE: (id) => `/clientes/${id}`
  },
  
  // Productos (Backend: ✅ Completo, Frontend: 🔄 En desarrollo)
  PRODUCTOS: {
    LIST: '/productos',
    GET: (id) => `/productos/${id}`,
    CREATE: '/productos',  // Con carga de imágenes
    UPDATE: (id) => `/productos/${id}`,
    DELETE: (id) => `/productos/${id}`
  },
  
  // Inventario (Backend: ✅ Completo, Frontend: 🔄 En desarrollo)
  INVENTARIO: {
    LIST: '/inventario',
    BY_SUCURSAL: (id) => `/inventario/sucursal/${id}`,
    BY_PRODUCTO: (id) => `/inventario/producto/${id}`,
    CREATE: '/inventario',
    UPDATE: (id) => `/inventario/${id}`,
    DELETE: (id) => `/inventario/${id}`
  },
  
  // Ventas (Backend: ✅ Completo, Frontend: 🔄 En desarrollo)
  VENTAS: {
    LIST: '/ventas',
    GET: (id) => `/ventas/${id}`,
    CREATE: '/ventas',  // Transaccional con descuento de inventario
    DELETE: (id) => `/ventas/${id}`
  },
  
  // Servicios Técnicos (Backend: ✅ Completo, Frontend: 🔄 En desarrollo)
  SERVICIOS: {
    LIST: '/servicios',
    GET: (id) => `/servicios/${id}`,
    CREATE: '/servicios',  // Con carga de 3 fotos
    UPDATE: (id) => `/servicios/${id}`,
    DELETE: (id) => `/servicios/${id}`
  },
  
  // Sucursales, Categorías, Usuarios, Roles...
  // Ver backend documentation para todos los endpoints
};
```

### **Autenticación JWT**
- **Token Storage**: LocalStorage seguro con prefijo
- **Auto-refresh**: Renovación automática antes de expiración
- **Role-Based Access**: Permisos según rol de usuario
- **Auto-logout**: Redirección automática al expirar token

### **Manejo de Archivos**
- **Imágenes**: JPEG, PNG, GIF, WEBP (máx. 10MB)
- **Videos**: MP4, MPEG, MOV, WEBM (máx. 10MB)
- **Progress Tracking**: Barra de progreso durante upload
- **Preview**: Visualización previa antes de enviar

### **Manejo de Errores**
- **401 Unauthorized**: Logout automático
- **403 Forbidden**: Mensaje de permisos insuficientes
- **404 Not Found**: Página de error amigable
- **422 Validation**: Errores de formulario específicos
- **500 Server Error**: Mensaje genérico con opción de reintentar

### **Upload de Archivos**
- **Imágenes**: JPEG, PNG, GIF, WEBP (máx. 10MB)
- **Videos**: MP4, MPEG, MOV, WEBM (máx. 10MB)
- **Progress Tracking**: Barra de progreso durante upload
- **Preview**: Visualización previa antes de enviar

## 🎯 **Características Avanzadas**

### **Componentes Reutilizables**
```javascript
// Modal dinámico
UI.showModal({
  title: 'Confirmar',
  content: '¿Estás seguro?',
  footer: '<button>Guardar</button>'
});

// Confirmación mejorada
await UI.confirm({
  title: 'Eliminar Cliente',
  text: 'Esta acción no se puede deshacer',
  icon: 'warning'
});

// Toast notifications
UI.showSuccess('Operación completada');
UI.showError('Error en la operación');
```

### **Estado Global y Persistencia**
- **Settings Storage**: Configuración de usuario
- **Form Auto-save**: Guardado temporal de formularios
- **Cart Management**: Carrito de compras persistente
- **Session Recovery**: Recuperación de sesión

### **Optimización de Rendimiento**
- **Lazy Loading**: Carga bajo demanda de imágenes
- **Debouncing**: Optimización de búsquedas en tiempo real
- **Caching**: Cache inteligente de respuestas API
- **Minimización**: Bundles optimizados para producción

## 🖥️ **Modo Desarrollo Integrado**

Para desarrollo local, el frontend se sirve desde el backend Node.js:

### **Configuración de Desarrollo**

1. **Iniciar el Backend con Frontend Integrado**
```bash
# Desde la raíz del proyecto
npm run dev
```

2. **URLs de Acceso Local**
```
Frontend completo:    http://localhost:3000/
Login:               http://localhost:3000/login.html
Dashboard:           http://localhost:3000/dashboard.html
API Endpoints:       http://localhost:3000/api/
Archivos uploads:    http://localhost:3000/uploads/
```

### **Ventajas del Modo Integrado**
- ✅ **Sin problemas de CORS**: Mismo dominio para frontend y backend
- ✅ **Desarrollo más rápido**: Un solo servidor para todo
- ✅ **Archivos estáticos**: CSS, JS e imágenes cargan correctamente
- ✅ **Hot reload**: Cambios en frontend se actualizan automáticamente

## 🚀 **Guía de Instalación y Producción**

### **Opción A: Desarrollo Local (Recomendado)**
Usa el modo integrado explicado arriba.

### **Opción B: Producción en cPanel**

#### **Requisitos Previos**
- Hosting con cPanel
- Backend Node.js desplegado en subdominio (ej: api.tudominio.com)
- Servidor web (Apache/Nginx) para frontend

#### **Configuración para Producción**

1. **Subir Archivos del Frontend**
- Subir todo el contenido de `frontend/` a la raíz del hosting
- O a una carpeta específica si tienes multiples proyectos

2. **Configurar URL del Backend**
```javascript
// En assets/js/core/api.js (línea 6)
const api = new ApiClient('https://api.tu-dominio.com/api');
```

3. **Configurar CORS en Backend**
```javascript
// En backend src/app.js
app.use(cors({
  origin: 'https://tu-dominio.com',
  credentials: true
}));
```

4. **Acceder a la Aplicación en Producción**
```
https://tu-dominio.com/              # Landing page
https://tu-dominio.com/login.html    # Login
https://tu-dominio.com/dashboard.html # Dashboard
```

### **Configuración de Producción**

1. **Actualizar URL del Backend**
```javascript
const api = new ApiClient('https://tu-dominio.com/api');
```

2. **Configurar CORS en Backend**
```javascript
// Asegurar que el backend permita tu dominio
app.use(cors({ origin: 'https://tu-dominio.com' }));
```

3. **HTTPS Configurado**
- Certificado SSL/TLS válido
- Actualizar todas las URLs a HTTPS
- Configurar headers de seguridad

## 🧪 **Testing y Calidad**

### **Validación de Formularios**
- **HTML5 Validation**: Atributos required, pattern, type
- **JavaScript Validation**: Validación en tiempo real
- **Server Validation**: Coordinación con backend
- **Error Messages**: Feedback claro y específico

### **Manejo de Estados**
- **Loading States**: Indicadores visuales durante peticiones
- **Empty States**: Mensajes cuando no hay datos
- **Error States**: Manejo elegante de errores
- **Success States**: Confirmación de acciones completadas

### **Accesibilidad (WCAG 2.1)**
- **ARIA Labels**: Para lectores de pantalla
- **Keyboard Navigation**: Navegación completa con teclado
- **Color Contrast**: Contraste mínimo AA (4.5:1)
- **Focus Management**: Indicadores visuales de foco

## 📋 **Estado de Implementación**

### **✅ Completado - Base del Sistema**
- ✅ **Arquitectura Base**: Estructura completa y modular
- ✅ **Sistema de Autenticación**: JWT completo con refresh automático
- ✅ **Dashboard Principal**: KPIs en tiempo real y gráficos interactivos
- ✅ **Core JavaScript Modules**: API, Auth, Storage, UI, Router
- ✅ **Diseño AdminLTE**: Responsivo con mobile-first approach
- ✅ **Landing Page Profesional**: Presentación del negocio
- ✅ **Login Completo**: Validación y manejo de errores
- ✅ **Sistema de Navegación**: MPA con breadcrumbs
- ✅ **Componentes UI**: Modals, alerts, tables, forms
- ✅ **Manejo de Estados**: Loading, empty, error, success states

### **🔄 Módulos de Negocio (Backend ✅, Frontend 🔄)**
- 🔄 **Gestión de Clientes**: CRUD completo en backend, UI en desarrollo
- 🔄 **Gestión de Productos**: Backend con carga de imágenes, UI en desarrollo
- 🔄 **Control de Inventario**: Backend multi-sucursal, UI en desarrollo
- 🔄 **Sistema de Ventas**: Backend transaccional, UI en desarrollo
- 🔄 **Servicios Técnicos**: Backend con 3 fotos, UI en desarrollo

### **⏳ Próximos Módulos**
- ⏳ **Gestión de Sucursales**: Solo para administradores
- ⏳ **Perfiles de Usuario**: Configuración personal
- ⏳ **Panel de Administración**: Configuración del sistema
- ⏳ **Reportes Avanzados**: Exportación y filtros
- ⏳ **Notificaciones Push**: Actualizaciones en tiempo real

### **📊 Métricas de Desarrollo**
- **Backend API**: 100% completo (9 módulos funcionales)
- **Frontend Base**: 100% completo (arquitectura y componentes)
- **Módulos UI**: 20% completado (dashboard y login)
- **Tiempo estimado**: 2-3 semanas para completar UI restante

## 🛠️ **Troubleshooting**

### **Problemas Comunes y Soluciones**

#### **Desarrollo Local (Backend Integrado)**

**Q: El frontend no carga (error 404)**
```bash
# Solución: Asegúrate de ejecutar desde la raíz del proyecto
cd D:\myProjects\mcmatias
npm run dev  # No desde la carpeta frontend/
```

**Q: Error CORS en desarrollo**
- ✅ **Modo integrado**: No debería haber CORS
- Si aún tienes CORS, verifica que no estés sirviendo el frontend con Live Server

**Q: Los gráficos del dashboard no muestran datos**
- Verifica backend en: `http://localhost:3000/api/`
- Revisa consola para errores de red
- Confirma que la base de datos tenga datos (`npm run seed`)

#### **Producción (cPanel)**

**Q: Error 404 en archivos CSS/JS**
- Verifica rutas en servidor: `/assets/css/` vs `./assets/css/`
- Confirma archivos subidos correctamente
- Revisa .htaccess si usas rewrites

**Q: Login no funciona (error de red)**
```javascript
// Verifica URL del API en frontend/assets/js/core/api.js
const api = new ApiClient('https://api.tu-dominio.com/api');  // Producción
```

**Q: CORS bloquea peticiones**
- Configura CORS en backend: `origin: 'https://tu-dominio.com'`
- Verifica que el backend esté corriendo en subdominio

#### **Errores Específicos**

**Q: "Cannot find module 'axios'"**
- Verifica librerías externas cargadas en HTML
- Revisa conexión a internet para CDN

**Q: JWT token expira rápidamente**
- Verifica `JWT_EXPIRES` en .env del backend
- Configura refresh automático en auth.js

**Q: Imágenes no cargan**
- Verifica carpeta `public/uploads/` con permisos 755
- Confirma URL de uploads en backend

### **Herramientas de Debug**

#### **Chrome DevTools Esenciales**
- **Network Tab**: Verifica todas las peticiones API
- **Console**: Identifica errores JavaScript
- **Application**: Revisa LocalStorage y SessionStorage
- **Elements**: Inspecciona DOM y CSS

#### **Comandos Útiles**
```bash
# Backend
npm run dev     # Iniciar servidor
npm run seed    # Poblar base de datos

# Debug base de datos
mysql -u root -p tienda_multicentro_matias
```

#### **Verificación Rápida**
1. **Backend responde**: `curl http://localhost:3000/api/auth/login`
2. **Frontend carga**: Accede a `http://localhost:3000/`
3. **API conecta**: Revisa Network tab en DevTools
4. **Autenticación**: Intenta login con credenciales del seed

## 🚀 **Despliegue**

### **Opciones de Hosting**
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Traditional Hosting**: Apache, Nginx con configuración simple
- **CDN**: CloudFlare, AWS CloudFront
- **Serverless**: AWS S3 + CloudFront

### **Configuración de Producción**
```bash
# Minificación de CSS/JS (opcional)
# Compilación de assets si se usa un bundler
# Configuración de cache headers
# Implementación de HTTPS
# Configuración de backup
```

## 📞 **Soporte y Contribuciones**

### **Contacto**
- **Email**: info@multicentromatias.com
- **Issues**: Repositorio del proyecto
- **Documentation**: Este README y comentarios en código

### **Contribuciones**
- Fork del repositorio
- Feature branch para nuevas funcionalidades
- Pull requests con descripción clara
- Mantener estilo de código consistente

## 📄 **Licencia**

Este proyecto es parte de MultiCentro Matias y está sujeto a los términos de uso comerciales de la empresa.

---

**Frontend MultiCentro Matias** - Sistema moderno, escalable y profesional para la gestión multicentro.

*Última actualización: Enero 2026*