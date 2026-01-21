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
├── inventario.html         # Control de inventario (Stock por sucursal)
├── servicios_tecnicos.html # Órdenes de servicio
├── categorias_productos.html # Gestión de categorías de productos
├── categorias_servicios.html # Gestión de categorías de servicios
├── sucursales.html         # Gestión de sucursales
├── roles.html              # Gestión de roles (Solo Super Admin)
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
│   ├── roles_vistas.js         # Control de acceso RBAC client-side
│   ├── utils.js                # Helpers (formateo, toasts, loaders)
│   ├── boleta_ventas.js        # Lógica de impresión de boletas de venta
│   ├── boleta_servicio.js      # Lógica de impresión de órdenes de servicio
│   └── pages/                  # Lógica específica por página
│       ├── dashboard.js        # KPIs reales + últimas ventas/servicios
│       ├── productos.js        # CRUD con paginación, búsqueda y PATCH
│       ├── clientes.js         # CRUD con paginación, búsqueda y PATCH
│       ├── inventario.js       # CRUD con paginación, búsqueda y PATCH
│       ├── categorias_productos.js  # CRUD con paginación, búsqueda y PATCH
│       ├── categorias_servicios.js  # CRUD con paginación, búsqueda y PATCH
│       ├── ventas.js           # Sistema completo de ventas con carrito + impresión
│       ├── servicios_tecnicos.js # CRUD completo con imágenes + impresión
│       ├── usuarios.js         # Gestión de usuarios con soft delete
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

### ✅ Completamente Funcionales con CRUD + Paginación + Numerador

| Módulo | Paginación | Búsqueda | PATCH | Numerador | Características Especiales |
|--------|------------|----------|-------|-----------|---------------------------|
| **Productos** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Upload de imágenes, Soft delete con validación de stock, Reactivación |
| **Clientes** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Búsqueda en 4 campos, Soft delete con reactivación |
| **Inventario** | ✅ 10/página | 🔍 Dropdown | ✅ | ✅ | RBAC sucursal, Dropdown productos y sucursales con búsqueda |
| **Categorías Productos** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Soft delete con reactivación |
| **Categorías Servicios** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Soft delete con reactivación |
| **Ventas** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Sistema completo con carrito, búsqueda de clientes/productos, anulación, impresión |
| **Servicios Técnicos** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | Sistema completo con búsqueda de clientes/categorías, upload de 3 fotos, anulación, impresión |
| **Roles** | ✅ 10/página | ❌ | ✅ | ❌ | Simple CRUD, **Solo Super Admin** |
| **Usuarios** | ✅ 10/página | 🔍 Server-Side | ✅ | ✅ | FK a Roles/Sucursales, Soft delete con reactivación, Bloqueo de login |
| **Sucursales** | ✅ 10/página | ❌ | ✅ | ❌ | Activar/Desactivar, campo Dirección |
| **Dashboard** | N/A | N/A | N/A | N/A | Client-side Data Processing, KPIs reales, últimas ventas y servicios |

### 🔢 Sistema de Numerador en Tablas

Todas las tablas principales cuentan con una columna **#** (numerador) en la primera posición que muestra el índice del registro basado en la paginación:
- Cálculo: `# = (Página Actual - 1) * 10 + Índice + 1`
- Facilita la referencia visual de registros
- Se actualiza automáticamente al cambiar de página
- **Módulos con numerador**: Usuarios, Clientes, Productos, Inventario, Categorías (Productos y Servicios), Ventas, Servicios Técnicos

## ✨ Funcionalidades Principales

### 🔐 Autenticación
- **Login** con JWT
- Tokens en `localStorage`:
  - `access_token` - Válido 60 minutos
  - `refresh_token` - Válido 1 día
- Protección automática de rutas
- Logout con limpieza de tokens
- **Auto-refresh** de access token cuando expira
- **Bloqueo de usuarios inactivos**: Usuarios marcados como inactivos no pueden iniciar sesión

### �️ RBAC (Control de Acceso por Roles)
- **roles_vistas.js**: Módulo de control de acceso client-side
- **Restricción del módulo Roles**: Solo visible y accesible para Super Admin (numero_rol=1)
- Botones y acciones dinámicas según permisos del rol
- Funciones globales: `canPerformAction(action)`, `canAccessModule(moduleName)`
- Redirección automática a `unauthorized.html` si no tiene permisos

### �👤 Perfil de Usuario
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
  - Bloqueo de usuarios inactivos en login
- **utils.js**: Funciones auxiliares
  - `formatCurrency()`, `formatDate()`, `showToast()`, `confirmDelete()`
- **roles_vistas.js**: Control de acceso RBAC
  - `canPerformAction(action)`, `canAccessModule(moduleName)`
  - Configuración de permisos por rol

### Componentes
- **components.js**: Header y Sidebar dinámicos
  - Renderizado de menú basado en `SIDEBAR_CONFIG`
  - Perfil de usuario con avatar inicial
  - Menú adaptado según rol del usuario
- **profile.js**: Modal de edición de perfil
  - Inyección automática del modal
  - Validación de contraseñas

### Páginas Implementadas (Lógica CRUD Completa)

#### usuarios.js
```javascript
// Funciones principales
loadUsuarios(page)           // Carga paginada con numerador
saveUsuario()                // POST/PATCH
desactivarUsuario(id)        // Soft delete
reactivarUsuario(id)         // Reactivar usuario inactivo
renderTable()                // Renderiza con numerador (#)
```

#### productos.js
```javascript
// Funciones principales
loadProductos(page)          // Carga paginada con numerador
saveProducto()               // POST/PATCH con FormData (imagen)
deleteProducto(id)           // Soft delete con validación de stock
reactivarProducto(id)        // Reactivar producto inactivo
renderTable()                // Renderiza con numerador (#)
```

#### clientes.js
```javascript
// Funciones principales  
loadClientes(page)           // Carga paginada con búsqueda y numerador
saveCliente()                // POST/PATCH (sin archivos)
deleteCliente(id)            // Soft delete
reactivarCliente(id)         // Reactivar cliente inactivo
renderTable()                // Renderiza con numerador (#)
// Event Listeners
searchInput                  // Debounce 300ms para búsqueda
```

#### inventario.js
```javascript
// Funciones principales
loadInventario(page)         // Carga paginada con numerador
loadProductos()              // Para selector con búsqueda
loadSucursales()             // Para selector con RBAC
saveInventario()             // POST/PATCH
renderTable()                // Renderiza con numerador (#)
```

#### categorias_productos.js / categorias_servicios.js
```javascript
// Funciones principales
loadCategorias(page)         // Carga paginada con búsqueda y numerador
saveCategoria()              // POST/PATCH
desactivarCategoria(id)      // Soft delete
renderTable()                // Renderiza con numerador (#)
```

#### ventas.js (Sistema Completo de Ventas)
```javascript
// Funciones principales
loadVentas(page)             // Carga paginada de ventas con numerador
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

// Impresión
imprimirBoleta(id)           // Genera boleta en formato seleccionado
```

#### servicios_tecnicos.js (Sistema Completo de Servicios Técnicos)
```javascript
// Funciones principales
loadServicios(page)          // Carga paginada de servicios con numerador
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

// Impresión
imprimirBoletaServicio(id)   // Genera orden en formato seleccionado
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

### Sistema de Numerador Universal
- ✅ **Columna # en todas las tablas principales**
  - Usuarios, Clientes, Productos, Inventario
  - Categorías (Productos y Servicios)
  - Ventas, Servicios Técnicos
- ✅ **Cálculo dinámico basado en paginación**
- ✅ **Consistencia visual en todo el sistema**

### Módulo de Usuarios con Soft Delete
- ✅ **Gestión de Usuarios**: CRUD completo con soft delete
- ✅ **Desactivación/Reactivación**: Botones dinámicos según estado
- ✅ **Búsqueda Server-Side**: Por nombre o correo electrónico
- ✅ **Bloqueo de Login**: Usuarios inactivos no pueden iniciar sesión
- ✅ **Indicador visual**: Filas tachadas y grises para usuarios inactivos
- ✅ **Numerador**: Columna # para fácil referencia

### Restricción RBAC del Módulo Roles
- ✅ **Solo Super Admin**: El módulo de Roles solo es accesible para numero_rol=1
- ✅ **Control Client-Side**: Menú oculto para usuarios sin permisos
- ✅ **Redirección automática**: A unauthorized.html si intentan acceso directo

### Módulo de Servicios Técnicos Completo
- **Vista de Lista**: Tabla paginada con numerador, columnas Estado, Cliente, Dispositivo, Categoría
- **Nuevo Servicio - Flujo por Vistas**:
  1. Búsqueda de Cliente (búsqueda server-side + opción crear nuevo)
  2. Búsqueda de Categoría tipo servicio (búsqueda server-side)
  3. Detalles del dispositivo (marca, modelo, problema)
  4. Upload de hasta 3 fotos con preview
  5. Costo
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
  - Incluye información del dispositivo, cliente, problema y costo
  - Marca visual "SERVICIO ANULADO" en servicios cancelados

### Módulo de Ventas Completo
- **Vista de Lista**: Tabla paginada con numerador, columnas Tipo Pago y Estado
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
- **Búsqueda de Ventas**: Por número de boleta, cliente o cédula

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
- **Usuarios**: Busca en nombre y correo electrónico
- **Ventas**: Busca por número de boleta, cliente o cédula
- **Servicios**: Busca por número de servicio, cliente, marca o modelo de dispositivo
- **Dropdowns Inteligentes**: Productos e Inventario usan búsqueda server-side en selectores
- **Debounce de 300ms** para evitar sobrecarga
- **Reset a página 1** al buscar

### Actualización con PATCH
- Todos los módulos usan **PATCH** en lugar de PUT
- Solo envía campos modificados
- Para FormData (imágenes): `apiPatchFormData()`

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
4. **Configuración**: Categorías (separadas en Productos/Servicios), Sucursales, Usuarios, Roles (Solo Super Admin)

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
function renderTable() { 
    // Incluye lógica de numerador
    const startNumber = (currentPage - 1) * 10 + 1;
    // ...
}
function renderPagination() { ... }
async function saveItem() { ... }
async function deleteItem(id) { ... }  // Soft delete donde aplique
```

## ⚠️ Notas Importantes

- **RBAC (control de roles)**: Implementado tanto en backend como frontend
- **Módulo Roles restringido**: Solo Super Admin (numero_rol=1) puede acceder
- Todas las páginas requieren autenticación excepto login
- El modal de perfil está incluido automáticamente en todas las páginas protegidas
- Las imágenes se suben a `backend/media/uploads/`
- Paginación se oculta automáticamente si hay menos de 10 items
- **Ventas anuladas**: No se pueden editar ni volver a anular
- **Usuarios inactivos**: No pueden iniciar sesión en el sistema
- **Numerador (#)**: Presente en todas las tablas principales para fácil referencia

## 🎯 Próximas Implementaciones

- [ ] Gráficos visuales en Dashboard (Chart.js)
- [ ] Reportes y exportación (PDF/Excel)
- [ ] Filtros avanzados por fecha en ventas y servicios
- [ ] Sistema de notificaciones push
- [ ] Gestión de garantías de productos

## ✅ Implementado Recientemente

- [x] **Sistema de Numerador Universal**: Columna # en todas las tablas principales (Usuarios, Clientes, Productos, Inventario, Categorías, Ventas, Servicios)
- [x] **Soft Delete para Usuarios**: Desactivación con reactivación y bloqueo de login
- [x] **Restricción RBAC del Módulo Roles**: Solo accesible para Super Admin
- [x] **Búsqueda Server-Side Expandida**: Usuarios y Ventas ahora con búsqueda
- [x] **Sistema de Soft Delete (Borrado Lógico)**: Productos, Clientes, Categorías y Usuarios con campo `activo`
- [x] **Reactivación de Registros**: Botones para reactivar productos, clientes, categorías y usuarios inactivos
- [x] **Validación de Stock al Eliminar Productos**: Muestra detalle de stock por sucursal
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
- [x] **Búsqueda Server-Side Universal**: Productos, Clientes, Categorías, Inventario, Usuarios, Ventas, Servicios
- [x] **Serializers Enriquecidos**: Backend envía nombres legibles en todos los módulos
