# Frontend MCMatias - Guía de Uso

## 📋 Estructura del Proyecto

```
frontend/
├── index.html              # Página de Login
├── dashboard.html          # Vista principal
├── productos.html          # Gestión de productos
├── clientes.html           # Gestión de clientes
├── ventas.html             # Gestión de ventas
├── inventario.html         # Control de inventario
├── servicios_tecnicos.html # Órdenes de servicio
├── categorias.html         # Gestión de categorías
├── sucursales.html         # Gestión de sucursales
├── roles.html              # Gestión de roles
├── usuarios.html           # Gestión de usuarios
├── unauthorized.html       # Página 403
│
├── css/
│   └── styles.css          # Estilos personalizados AdminLTE-like
│
├── js/
│   ├── api.js              # Configuración de Axios e Interceptores JWT
│   ├── auth.js             # Lógica de Login, Tokens y protección de rutas
│   ├── components.js       # Inyección de Header y Sidebar reutilizables
│   ├── profile.js          # Modal de edición de perfil de usuario
│   ├── utils.js            # Helpers (formateo, toasts, loaders)
│   └── pages/              # Lógica específica por página
│       ├── dashboard.js
│       ├── productos.js
│       └── clientes.js
│
└── assets/                 # Logos, imágenes (opcional)
```

**Nota**: Bootstrap 5 y Bootstrap Icons se cargan vía CDN.

## 🚀 Iniciando el Proyecto

### Requisitos
- Servidor web local (Live Server en VS Code recomendado)
- Backend Django corriendo en `http://127.0.0.1:8000`

### Abrir en el Navegador
1. Usa Live Server o abre directamente `index.html`
2. Credenciales: usa las creadas en el backend

## 📄 Páginas Implementadas

### ✅ Completas con CRUD
- **index.html** - Login con JWT
- **dashboard.html** - Dashboard
- **roles.html** - Gestión de roles
- **usuarios.html** - Gestión de usuarios (+ Foreign Keys)
- **sucursales.html** - Gestión de sucursales
- **categorias.html** - Categorías + Buscador + Filtros
- **productos.html** - (En progreso)
- **clientes.html** - (En progreso)

### 📝 Plantillas Base (Requieren JS)
- **ventas.html** - Gestión de ventas
- **inventario.html** - Control de inventario
- **servicios_tecnicos.html** - Órdenes de servicio

## ✨ Funcionalidades Principales

### 🔐 Autenticación
- Login con JWT
- Tokens en `localStorage`:
  - `access_token` - Válido 60 minutos
  - `refresh_token` - Válido 1 día
- Protección automática de rutas
- Logout con limpieza de tokens

### 👤 Perfil de Usuario
- Modal de edición accesible desde "Configuración" en el menú
- Actualización de nombre y email
- Cambio de contraseña (opcional)
- Validación en tiempo real
- Actualización automática del header

### 🎨 Diseño
- **Desktop**: Sidebar fijo con opción de colapsar
- **Mobile**: Sidebar deslizable con overlay
- Estilo AdminLTE-like moderno
- 100% responsive

## 🔧 Módulos JavaScript

### Core
- **api.js**: Axios configurado con interceptores JWT
- **auth.js**: Gestión de autenticación y tokens
- **utils.js**: Funciones auxiliares (formateo, toasts)

### Componentes
### Componentes
- **components.js**: Header y Sidebar dinámicos
- **profile.js**: Modal de edición de perfil

### Páginas Implementadas (Logica)
- **dashboard.js**
- **roles.js**: CRUD Roles con Modales
- **usuarios.js**: CRUD Usuarios con Selectores Dinámicos (Roles/Sucursales)
- **sucursales.js**: CRUD Sucursales (Activar/Desactivar)
- **categorias.js**: CRUD Categorías con **Búsqueda en Servidor** y Filtros por Tipo

## ✨ Características Recientes
- **Buscador Inteligente**: Implementado en Categorías con _debounce_ de 300ms.
- **Filtros Híbridos**: Filtrado visual + Búsqueda server-side.
- **Formularios Dinámicos**: Carga de selects (foreign keys) al abrir modales.
- **UI Responsiva Mejorada**: Encabezados adaptativos (Flexbox) para móviles.
- **pages/dashboard.js**: Dashboard con KPIs
- **pages/productos.js**: CRUD de productos
- **pages/clientes.js**: CRUD de clientes

## 🔧 Personalización

### Cambiar URL del Backend
Edita `js/api.js` línea 7:
```javascript
const API_BASE_URL = 'http://TU_URL:PUERTO/api';
```

### Modificar Menú Lateral
Edita `js/components.js` en `SIDEBAR_CONFIG`:
```javascript
const SIDEBAR_CONFIG = [
    { type: 'item', href: 'pagina.html', icon: 'bi-icon', text: 'Texto' },
    // ...
];
```

## ⚠️ Notas Importantes
- Dashboard muestra datos ficticios (según requerimientos)
- RBAC (control de roles) se implementará en fase futura
- Todas las páginas requieren autenticación excepto login
- El modal de perfil está incluido automáticamente en todas las páginas protegidas

