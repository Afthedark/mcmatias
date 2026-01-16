# Frontend MCMatias - Guía de Uso

## 📋 Estructura del Proyecto

```
frontend/
├── index.html              # Página de Login
├── dashboard.html          # Vista principal
├── productos.html          # Gestión de productos
├── clientes.html           # Gestión de clientes
├── ventas.html             # Gestión de ventas
├── boleta_ventas.html      # Plantilla de boletas de venta
├── boleta_servicio.html    # Plantilla de órdenes de servicio
├── inventario.html         # Control de inventario
├── servicios_tecnicos.html # Órdenes de servicio
├── categorias.html         # Gestión de categorías (Dual Table)
├── sucursales.html         # Gestión de sucursales
├── roles.html              # Gestión de roles
├── usuarios.html           # Gestión de usuarios
├── unauthorized.html       # Página 403
│
├── css/
│   ├── styles.css                # Estilos personalizados AdminLTE-like
│   ├── boleta_ventas_print.css   # Estilos de impresión de boletas de venta
│   └── boleta_servicio_print.css # Estilos de impresión de órdenes de servicio
│
├── js/
│   ├── api.js                  # Configuración de Axios + Interceptores JWT
│   ├── auth.js                 # Login, Tokens y protección de rutas
│   ├── components.js           # Header y Sidebar reutilizables
│   ├── profile.js              # Modal de edición de perfil
│   ├── utils.js                # Helpers (formateo, toasts, loaders)
│   ├── boleta_ventas.js        # Lógica de impresión de boletas de venta
│   ├── boleta_servicio.js      # Lógica de impresión de órdenes de servicio
│   └── pages/                  # Lógica específica por página
│       ├── dashboard.js        # KPIs reales + últimas ventas/servicios
│       ├── productos.js        # CRUD con paginación y PATCH
│       ├── clientes.js         # CRUD con paginación, búsqueda y PATCH
│       ├── inventario.js       # CRUD con paginación y PATCH
│       ├── categorias.js       # Dual table con búsqueda independiente
│       ├── ventas.js           # Sistema completo de ventas con carrito + impresión
│       ├── servicios_tecnicos.js # CRUD completo con imágenes + impresión
│       ├── usuarios.js         # Gestión de usuarios
│       ├── roles.js            # Gestión de roles
│       └── sucursales.js       # Gestión de sucursales
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
| **Servicios Técnicos** | ✅ 10/página | 🔍 Server-Side | ✅ | Sistema completo con búsqueda de clientes/categorías, upload de 3 fotos, anulación |
| **Roles** | ❌ | ❌ | ✅ | Simple CRUD |
| **Usuarios** | ❌ | ❌ | ✅ | FK a Roles/Sucursales |
| **Sucursales** | ❌ | ❌ | ✅ | Activar/Desactivar |
| **Dashboard** | N/A | N/A | N/A | Client-side Data Processing, KPIs reales, últimas ventas y servicios |

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

#### servicios_tecnicos.js (Sistema Completo de Servicios Técnicos)
```javascript
// Funciones principales
loadServicios(page)          // Carga paginada de servicios
mostrarNuevoServicio()       // Cambia a vista de nuevo servicio
mostrarEditarServicio(id)    // Cambia a vista de edición
verDetalle(id)               // Modal con detalle completo
abrirModalAnular(id)         // Modal de confirmación de anulación
confirmarAnulacion()         // Anular servicio técnico

// Búsqueda Server-Side
searchClientes(term)         // Debounce 300ms en clientes
searchCategorias(term)       // Debounce 300ms en categorías tipo servicio

// Gestión de Imágenes
handleImagePreview(event, num)  // Preview de hasta 3 fotos
guardarServicio()            // POST/PATCH con FormData (imágenes)

// Modales auxiliares
abrirModalNuevoCliente()     // Crear cliente desde el formulario
guardarNuevoCliente()        // Guardar y auto-seleccionar cliente
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

// Tablas de Datos Recientes
renderLatestSales()          // Top 5 ventas con estado y tipo pago
renderLatestServices()       // Top 5 servicios técnicos con estado
```

## ✨ Características Recientes

### Módulo de Servicios Técnicos Completo
- **Vista de Lista**: Tabla paginada con columnas Estado, Cliente, Dispositivo, Categoría
- **Nuevo Servicio - Flujo por Vistas**:
  1. Búsqueda de Cliente (búsqueda server-side + opción crear nuevo)
  2. Búsqueda de Categoría tipo servicio (búsqueda server-side)
  3. Detalles del dispositivo (marca, modelo, problema)
  4. Upload de hasta 3 fotos con preview
  5. Costo estimado
  6. Resumen lateral dinámico
- **Auto-generación de Número**: `numero_servicio` se genera automáticamente en backend (ST-YYYY-XXXXX)
- **Estados del Servicio**: En Reparación → Para Retirar → Entregado
- **Sistema de Anulación**:
  - Botón "Anular" visible para roles 1, 2, 3, y 5 (NO para Cajero puro)
  - Modal de confirmación simple (sin motivo obligatorio)
  - Servicios anulados se muestran con badge rojo y tachados
- **RBAC**: Cada sucursal ve solo sus servicios (Super Admin ve todos)
- **Galería de Fotos**: Visualización de hasta 3 fotos en modal de detalle
- **Sistema de Impresión de Órdenes**:
  - Botón de impresión en cada servicio de la tabla
  - Modal de selección de formato (Ticket 80mm o Boleta A4)
  - Vista previa antes de imprimir
  - Incluye información del dispositivo, cliente, problema y costo estimado
  - Marca visual "SERVICIO ANULADO" en servicios cancelados

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
- **Sistema de Impresión de Boletas**:
  - Botón de impresión en cada venta de la tabla
  - Modal de selección de formato (Ticket 80mm o Boleta A4)
  - Vista previa antes de imprimir
  - Incluye productos, totales, cliente y método de pago
  - Marca visual "ANULADA" en ventas canceladas

### Dashboard con Client-Side Processing
- **Fetch Paralelo**: Usa `Promise.all` para cargar datos simultáneamente
- **KPIs Calculados**:
  - **Ventas del Mes**: Filtrado local por fecha (cantidad + monto)
  - **Total Productos/Clientes/Servicios**: Usa `.count` de paginación
- **Procesamiento Local**:
  - Filtra ventas anuladas
  - Calcula totales con `reduce`
  - Agrupa por fecha para futuras gráficas
- **Tablas de Datos Recientes**:
  - **Últimas Ventas**: Top 5 con indicador de estado y tipo de pago
  - **Últimos Servicios Técnicos**: Top 5 con estado y detalles del dispositivo

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

- [ ] Gráficos visuales en Dashboard (Chart.js)
- [ ] Reportes y exportación (PDF/Excel)
- [ ] Filtros avanzados por fecha en ventas y servicios
- [ ] Sistema de notificaciones push
- [ ] Gestión de garantías de productos

## ✅ Implementado Recientemente

- [x] **Sistema de Impresión de Boletas de Venta**: Formatos Ticket 80mm y Boleta A4 con CSS adaptativo
- [x] **Sistema de Impresión de Órdenes de Servicio**: Formatos Ticket 80mm y Boleta A4 con CSS adaptativo
- [x] **Dirección en Sucursales**: Campo dirección agregado y mostrado automáticamente en boletas
- [x] **RBAC Actualizado en Servicios**: Técnicos y Técnico+Cajero pueden anular servicios
- [x] **Módulo de Servicios Técnicos Completo**: CRUD, búsqueda, upload de 3 fotos, anulación, RBAC
- [x] **Dashboard Mejorado**: Tabla de últimos servicios técnicos + últimas ventas
- [x] **Módulo de Ventas Completo**: Carrito, búsqueda, validación de stock, anulación
- [x] **Dashboard con Datos Reales**: Client-side processing, KPIs calculados
- [x] **Sistema de Anulación**: Con restauración automática de inventario (ventas)
- [x] **RBAC Completo**: Implementado en Ventas, Servicios, Inventario, Usuarios
- [x] **Búsqueda Server-Side Universal**: Productos, Clientes, Categorías, Inventario
- [x] **Serializers Enriquecidos**: Backend envía nombres legibles en todos los módulos
