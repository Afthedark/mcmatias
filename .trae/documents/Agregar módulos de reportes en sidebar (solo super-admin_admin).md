## Objetivo
Agregar en el menú principal (sidebar) los módulos:
- “Gráficos y Reportes de Servicios Técnico” → `reportes_servicios.html`
- “Gráficos y Reportes de Ventas” → `reportes_ventas.html`
Y que solo sean visibles/accesibles para roles **Super Admin (1)** y **Administrador (2)**.

## Dónde se controla hoy
- El sidebar se arma desde `SIDEBAR_CONFIG` y se filtra por rol: [components.js](file:///d:/myProjects/mcmatias/frontend/js/components.js#L6-L23) y [renderSidebar](file:///d:/myProjects/mcmatias/frontend/js/components.js#L154-L197).
- El acceso por URL se bloquea con `protectCurrentPage()` según `PERMISOS_ROL`: [roles_vistas.js](file:///d:/myProjects/mcmatias/frontend/js/roles_vistas.js#L6-L43) y [protectCurrentPage](file:///d:/myProjects/mcmatias/frontend/js/roles_vistas.js#L147-L162).

## Plan de acción
### 1) Agregar los dos ítems al sidebar
**Archivo**: [components.js](file:///d:/myProjects/mcmatias/frontend/js/components.js#L6-L23)
- Insertar una nueva sección (por ejemplo “Reportes”) en `SIDEBAR_CONFIG`.
- Agregar dos items:
  - `href: 'reportes_servicios.html'`, `text: 'Gráficos y Reportes de Servicios Técnico'`, icono sugerido `bi-tools`.
  - `href: 'reportes_ventas.html'`, `text: 'Gráficos y Reportes de Ventas'`, icono sugerido `bi-bar-chart-line`.

### 2) Restringir acceso SOLO a roles 1 y 2
**Archivo**: [roles_vistas.js](file:///d:/myProjects/mcmatias/frontend/js/roles_vistas.js#L6-L43)
- Verificar que rol 1 tiene `paginas: ['*']` (ya cubre todo).
- Mantener `reportes_ventas.html` y `reportes_servicios.html` en la lista de páginas permitidas del rol 2.
- Quitar esas dos páginas de cualquier otro rol que hoy las tenga (en este proyecto aparece en rol 5). Esto asegura:
  - No aparecen en el menú (por `filterSidebarByRole`).
  - No se puede entrar por URL directa (por `protectCurrentPage`).

### 3) Verificación
- Validar que el sidebar muestre los 2 módulos con rol 1 y 2.
- Validar que con otros roles no se vean y al entrar por URL redirija a `unauthorized.html`.

## Resultado esperado
- Los dos módulos aparecen en el sidebar únicamente para **Super Admin** y **Administrador**.
- El acceso queda bloqueado también si intentan entrar pegando la URL.