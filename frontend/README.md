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
- **dashboard.html** - Dashboard con KPIs ficticios
- **productos.html** - Gestión de productos (con imágenes)
- **clientes.html** - Gestión de clientes

### 📝 Plantillas Base (Requieren JS)
- **ventas.html** - Gestión de ventas
- **inventario.html** - Control de inventario
- **servicios_tecnicos.html** - Órdenes de servicio
- **categorias.html** - Gestión de categorías
- **sucursales.html** - Gestión de sucursales
- **roles.html** - Gestión de roles
- **usuarios.html** - Gestión de usuarios

## 🔧 Personalización

### Cambiar URL del Backend
Edita `js/api.js` línea 6:
```javascript
const API_BASE_URL = 'http://TU_URL:PUERTO/api';
```

## 🎨 Diseño Responsive
- Desktop: Sidebar fijo
- Mobile: Sidebar colapsable con botón hamburguesa

## 🔐 Autenticación
Los tokens se guardan en `localStorage`:
- `access_token` - Válido 60 minutos
- `refresh_token` - Válido 1 día

## ⚠️ Notas Importantes
- Dashboard muestra datos ficticios (configurado según requerimientos)
- RBAC (control de roles) se implementará en fase futura
- Todas las páginas requieren autenticación excepto login
