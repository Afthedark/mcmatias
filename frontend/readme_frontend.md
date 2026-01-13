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
├── categorias.html         # Gestión de categorías (Dual Table)
├── sucursales.html         # Gestión de sucursales
├── roles.html              # Gestión de roles
├── usuarios.html           # Gestión de usuarios
├── unauthorized.html       # Página 403
│
├── css/
│   └── styles.css          # Estilos personalizados AdminLTE-like
│
├── js/
│   ├── api.js              # Configuración de Axios + Interceptores JWT
│   ├── auth.js             # Login, Tokens y protección de rutas
│   ├── components.js       # Header y Sidebar reutilizables
│   ├── profile.js          # Modal de edición de perfil
│   ├── utils.js            # Helpers (formateo, toasts, loaders)
│   └── pages/              # Lógica específica por página
│       ├── dashboard.js
│       ├── productos.js    # CRUD con paginación y PATCH
│       ├── clientes.js     # CRUD con paginación, búsqueda y PATCH
│       ├── inventario.js   # CRUD con paginación y PATCH
│       └── categorias.js   # Dual table con búsqueda independiente
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

## 📄 Módulos Implementados

### ✅ Completamente Funcionales con CRUD + Paginación

| Módulo | Paginación | Búsqueda | PATCH | Características Especiales |
|--------|------------|----------|-------|---------------------------|
| **Productos** | ✅ 10/página | 🔍 Server-Side | ✅ | Upload de imágenes, Dropdown categorías con búsqueda |
| **Clientes** | ✅ 10/página | ✅ | ✅ | Búsqueda en 4 campos |
| **Inventario** | ✅ 10/página | 🔍 Dropdown | ✅ | RBAC sucursal, Dropdown productos y sucursales con búsqueda |
| **Categorías** | ✅ 10/página | ✅ | ✅ | **Dual Table** (Productos/Servicios) |
| **Ventas** | ✅ 10/página | ❌ | ✅ | Sistema completo con carrito, búsqueda de clientes/productos, anulación |
| **Roles** | ❌ | ❌ | ✅ | Simple CRUD |
| **Usuarios** | ❌ | ❌ | ✅ | FK a Roles/Sucursales |
| **Sucursales** | ❌ | ❌ | ✅ | Activar/Desactivar |
| **Dashboard** | N/A | N/A | N/A | Client-side Data Processing, KPIs reales |

### 📝 Plantillas Base (Requieren implementación)
- **servicios_tecnicos.html** - Órdenes de servicio

## ✨ Funcionalidades Principales

### 🔐 Autenticación
- **Login** con JWT
- Tokens en `localStorage`:
  - `access_token` - Válido 60 minutos
  - `refresh_token` - Válido 1 día
- Protección automática de rutas
- Logout con limpieza de tokens
- **Auto-refresh** de access token cuando expira

### 👤 Perfil de Usuario
- Modal de edición accesible desde "Configuración" en el menú
- Actualización de nombre y email
- Cambio de contraseña (opcional con confirmación)
- Validación en tiempo real
- Actualización automática del header
- Uso de **PATCH** para actualizaciones parciales

### 🎨 Diseño
- **Desktop**: Sidebar fijo con opción de colapsar
- **Mobile**: Sidebar deslizable con overlay
- Estilo AdminLTE-like moderno
- 100% responsive
- Bootstrap 5.3
- Bootstrap Icons integrados

## 🔧 Módulos JavaScript

### Core
- **api.js**: Axios configurado con interceptores JWT
  - `apiGet()`, `apiPost()`, `apiPatch()`, `apiDelete()`
  - `apiPostFormData()`, `apiPatchFormData()` para uploads
- **auth.js**: Gestión de autenticación y tokens
  - `checkAuth()`, `login()`, `logout()`
- **utils.js**: Funciones auxiliares
  - `formatCurrency()`, `formatDate()`, `showToast()`, `confirmDelete()`

### Componentes
- **components.js**: Header y Sidebar dinámicos
  - Renderizado de menú basado en `SIDEBAR_CONFIG`
  - Perfil de usuario con avatar inicial
- **profile.js**: Modal de edición de perfil
  - Inyección automática del modal
  - Validación de contraseñas

### Páginas Implementadas (Lógica CRUD Completa)

#### productos.js
```javascript
// Funciones principales
loadProductos(page)      // Carga paginada
saveProducto()           // POST/PATCH con FormData (imagen)
deleteProducto(id)       // DELETE con confirmación
renderPagination()       // Controles Anterior/Siguiente
```

#### clientes.js
```javascript
// Funciones principales  
loadClientes(page)       // Carga paginada con búsqueda
saveCliente()            // POST/PATCH (sin archivos)
deleteCliente(id)        // DELETE con navegación inteligente
// Event Listeners
searchInput              // Debounce 300ms para búsqueda
```

#### inventario.js
```javascript
// Funciones principales
loadInventario(page)     // Carga paginada
loadProductos()          // Para selector
loadSucursales()         // Para selector
saveInventario()         // POST/PATCH (FK bloqueadas al editar)
```

#### categorias.js (Arquitectura Dual Table)
```javascript
// Estado independiente
productosState = { data, currentPage, searchQuery }
serviciosState = { data, currentPage, searchQuery }

// Funciones separadas
loadProductos(page)
loadServicios(page)
renderTableProductos()
renderTableServicios()
```

#### ventas.js (Sistema Completo de Ventas)
```javascript
// Funciones principales
loadVentas(page)             // Carga paginada de ventas
verDetalleVenta(id)          // Modal con detalle completo + info de anulación
abrirModalAnular(id)         // Modal de confirmación de anulación
confirmarAnulacion()         // Anular venta + restaurar inventario

// Sistema de Carrito
agregarProducto()            // Añadir al carrito con validación
actualizarCantidad()         // Modificar cantidad en carrito
quitarProducto()             // Eliminar del carrito
confirmarVenta()             // Crear venta + detalles (con validación de stock)

// Búsqueda Server-Side
searchClientes()             // Debounce 300ms en nombre, CI, celular, email
searchProductos()            // Debounce 300ms en nombre y código de barras
```

#### dashboard.js (Client-side Data Processing)
```javascript
// Fetch Optimizado
loadDashboardData()          // Promise.all para cargas paralelas
processAndRenderKPIs()       // Cálculos client-side (suma, filtrado, promedio)

// Cálculos de KPIs
// - Ventas del mes (filtrado por fecha en cliente)
// - Total ingresos (reduce de ventas válidas)
// - Productos/Clientes/Servicios (count de API)
```

## ✨ Características Recientes

### Módulo de Ventas Completo
- **Vista de Lista**: Tabla paginada con columnas Tipo Pago y Estado
- **Nueva Venta - Flujo Wizard**:
  1. Selección de Cliente (búsqueda server-side + opción crear nuevo)
  2. Carrito de Productos (búsqueda por nombre o código de barras)
  3. Método de Pago (Efectivo/QR)
  4. Resumen lateral con total dinámico
- **Auto-generación de Boleta**: `numero_boleta` se genera automáticamente en backend (VTA-YYYY-XXXXX)
- **Gestión de Stock Automática**:
  - Validación de disponibilidad antes de confirmar venta
  - Descuento automático de inventario al crear detalle
  - Validación por sucursal (usa stock de la sucursal del usuario)
- **Sistema de Anulación**:
  - Botón "Anular" visible solo en ventas activas
  - Modal con campo obligatorio de motivo
  - Restauración automática de inventario al anular
  - Ventas anuladas se muestran tachadas y grises
  - Info de anulación visible en modal de detalle

### Dashboard con Client-Side Processing
- **Fetch Paralelo**: Usa `Promise.all` para cargar datos simultáneamente
- **KPIs Calculados**:
  - **Ventas del Mes**: Filtrado local por fecha (cantidad + monto)
  - **Total Productos/Clientes/Servicios**: Usa `.count` de paginación
- **Procesamiento Local**:
  - Filtra ventas anuladas
  - Calcula totales con `reduce`
  - Agrupa por fecha para futuras gráficas
- **Últimas Ventas**: Top 5 con indicador de estado

### Paginación Universal
- Todas las tablas muestran **10 filas por página**
- Contador: **"Página X de Y"**
- Botones Anterior/Siguiente deshabilitados en extremos
- Navegación inteligente al eliminar (retrocede si página queda vacía)

### Búsqueda Server-Side
- **Clientes**: Busca en nombre, CI, celular, email
- **Categorías**: Busca en nombre y tipo
- **Productos**: Busca en nombre, código de barras, descripción
- **Dropdowns Inteligentes**: Productos e Inventario usan búsqueda server-side en selectores
- **Debounce de 300ms** para evitar sobrecarga
- **Reset a página 1** al buscar

### Actualización con PATCH
- Todos los módulos usan **PATCH** en lugar de PUT
- Solo envía campos modificados
- Para FormData (imágenes): `apiPatchFormData()`

### Categorías Dual Table
- **Tabla Productos** y **Tabla Servicios** independientes
- Búsqueda y paginación separadas
- Filtro backend: `?tipo=producto` o `?tipo=servicio`
- Modal inteligente que detecta el tipo automáticamente

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
    { type: 'section', text: 'Sección' },
    // ...
];
```

**Orden actual del menú**:
1. Dashboard
2. **Logística**: Productos, Inventario
3. **Ventas & Clientes**: Ventas, Servicios Técnicos, Clientes
4. **Configuración**: Categorías, Sucursales, Usuarios, Roles

## 📊 Consistencia entre Módulos

Todos los módulos CRUD implementados siguen el mismo patrón:

```javascript
// Variables globales
let items = [];
let currentPage = 1;
let totalPages = 1;
let searchQuery = ''; // Si aplica

// Funciones estándar
async function loadItems(page = 1) { ... }
function renderTable() { ... }
function renderPagination() { ... }
async function saveItem() { ... }
async function deleteItem(id) { ... }
```

## ⚠️ Notas Importantes

- **RBAC (control de roles)**: Implementado tanto en backend como frontend
- Todas las páginas requieren autenticación excepto login
- El modal de perfil está incluido automáticamente en todas las páginas protegidas
- Las imágenes se suben a `backend/media/uploads/`
- Paginación se oculta automáticamente si hay menos de 10 items
- **Ventas anuladas**: No se pueden editar ni volver a anular

## 🎯 Próximas Implementaciones

- [ ] Módulo de Servicios Técnicos con upload de fotos
- [ ] Gráficos visuales en Dashboard (Chart.js)
- [ ] Reportes y exportación (PDF/Excel)
- [ ] Filtros avanzados por fecha en ventas

## ✅ Implementado Recientemente

- [x] **Módulo de Ventas Completo**: Carrito, búsqueda, validación de stock, anulación
- [x] **Dashboard con Datos Reales**: Client-side processing, KPIs calculados
- [x] **Sistema de Anulación**: Con restauración automática de inventario
- [x] **RBAC en Ventas**: Cada sucursal ve solo sus ventas (Super Admin ve todas)
- [x] **RBAC en Inventario**: Sucursal auto-asignada y bloqueada para roles no-admin
- [x] **Búsqueda Server-Side en Productos**: Dropdown de categorías con búsqueda
- [x] **Búsqueda Server-Side en Inventario**: Dropdown de productos con búsqueda
- [x] **Serializers Enriquecidos**: Backend envía nombres legibles (nombre_categoria, nombre_producto, nombre_sucursal)
