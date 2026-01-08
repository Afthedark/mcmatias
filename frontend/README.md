# Frontend MCMatias - Guía de Uso

## 📋 Estructura del Proyecto

Proyecto Multi-Page Application (MPA) con autenticación JWT y diseño AdminLTE-like.

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
