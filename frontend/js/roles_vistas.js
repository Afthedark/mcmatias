/**
 * Role-Based View Control Module
 * Centralizes permission logic based on numero_rol
 */

// Permisos por numero_rol
const PERMISOS_ROL = {
    1: { // Super Administrador
        paginas: ['*'], // Acceso total
        acciones: ['*', 'ver_filtro_sucursal']
    },
    2: { // Administrador (Sucursal)
        paginas: [
            'dashboard.html',
            'ventas.html',
            'servicios_tecnicos.html',
            'productos.html',
            'inventario.html',
            'categorias_productos.html',
            'categorias_servicios.html',
            'clientes.html',
            'usuarios.html',
            'perfil.html',
            'reportes_ventas.html',
            'reportes_servicios.html'
        ],
        acciones: ['editar_mi_sucursal', 'crear_servicios', 'asignar_tecnico', 'anular_ventas', 'editar_clientes']
    },
    3: { // Técnico
        paginas: ['dashboard.html', 'servicios_tecnicos.html', 'categorias_servicios.html', 'clientes.html', 'perfil.html'],
        acciones: ['editar_clientes', 'ver_mis_servicios']
    },
    4: { // Cajero
        paginas: ['dashboard.html', 'ventas.html', 'productos.html', 'inventario.html', 'categorias_productos.html', 'clientes.html'],
        acciones: ['crear_ventas', 'anular_ventas', 'editar_clientes']
    },
    5: { // Técnico y Cajero
        paginas: ['dashboard.html', 'ventas.html', 'servicios_tecnicos.html', 'productos.html',
            'inventario.html', 'categorias_productos.html', 'categorias_servicios.html', 'clientes.html'],
        acciones: ['crear_ventas', 'anular_ventas', 'anular_servicios', 'editar_clientes', 'crear_servicios', 'asignar_tecnico', 'ver_mis_servicios']
    }
};

/**
 * Obtiene el numero_rol del usuario actual
 * Intenta leer de localStorage, si no existe devuelve null
 */
function getUserRoleNumber() {
    const roleNum = localStorage.getItem('user_numero_rol');
    return roleNum ? parseInt(roleNum) : null;
}

/**
 * Verifica si el rol actual puede acceder a una página
 * @param {string} pageName - Nombre del archivo (ej. 'ventas.html')
 */
function canAccessPage(pageName) {
    // Si es index, unauthorized o 404, permitir siempre
    if (pageName === 'index.html' || pageName === 'unauthorized.html' || pageName === '/') return true;

    const roleNum = getUserRoleNumber();
    if (!roleNum) return false; // No hay rol definido

    const permisos = PERMISOS_ROL[roleNum];
    if (!permisos) return false; // Rol no definido en config

    if (permisos.paginas.includes('*')) return true;

    return permisos.paginas.includes(pageName);
}

/**
 * Verifica si el rol actual puede realizar una acción
 * @param {string} actionName - Identificador de la acción
 */
function canPerformAction(actionName) {
    const roleNum = getUserRoleNumber();
    if (!roleNum) return false;

    const permisos = PERMISOS_ROL[roleNum];
    if (!permisos) return false;

    if (permisos.acciones.includes('*')) return true;

    return permisos.acciones.includes(actionName);
}

/**
 * Filtra la configuración del sidebar según el rol
 * @param {Array} sidebarConfig - Configuración original
 */
function filterSidebarByRole(sidebarConfig) {
    const roleNum = getUserRoleNumber();
    if (!roleNum) return []; // Si no hay rol, no mostrar nada (o manejar loading)

    const permisos = PERMISOS_ROL[roleNum];
    if (!permisos) return [];

    if (permisos.paginas.includes('*')) return sidebarConfig;

    // Filtramos items
    const filtered = sidebarConfig.filter(item => {
        if (item.type === 'section') return true; // Dejamos secciones temporalmente, luego limpiaremos vacías
        if (item.type === 'item') {
            return permisos.paginas.includes(item.href);
        }
        return false;
    });

    // Limpiar secciones vacías
    return cleanEmptySections(filtered);
}

/**
 * Elimina secciones que no tienen items debajo
 */
function cleanEmptySections(items) {
    const cleaned = [];
    let currentSection = null;
    let sectionHasItems = false;

    items.forEach(item => {
        if (item.type === 'section') {
            // Si había una sección anterior pendiente y tenía items, la guardamos
            if (currentSection && sectionHasItems) {
                cleaned.push(currentSection);
            }
            // Nueva sección candidata
            currentSection = item;
            sectionHasItems = false;
        } else {
            // Es un item
            if (currentSection && !sectionHasItems) {
                // Primer item de la sección
                cleaned.push(currentSection);
                currentSection = null; // Ya la agregamos
            }
            cleaned.push(item);
            sectionHasItems = true;
        }
    });

    return cleaned;
}

/**
 * Protege la página actual verificando permisos
 * Redirige a unauthorized.html si falla
 */
function protectCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Evitar loop infinito en unauthorized
    if (pageName === 'unauthorized.html') return;

    if (!canAccessPage(pageName)) {
        console.warn(`Acceso denegado a ${pageName} para rol ${getUserRoleNumber()}`);
        window.location.href = 'unauthorized.html';
    }
}

