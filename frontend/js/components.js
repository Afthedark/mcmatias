/**
 * Reusable Components Module
 * Header and Sidebar injection for all protected pages
 */

// Configuration Object for Sidebar Navigation
// Easy to maintain and scale without touching the HTML generation logic
const SIDEBAR_CONFIG = [
    { type: 'item', href: 'dashboard.html', icon: 'bi-grid-1x2', text: 'Dashboard' },
    { type: 'section', text: 'Logística' },
    { type: 'item', href: 'productos.html', icon: 'bi-box-seam', text: 'Productos' },
    { type: 'item', href: 'categorias_productos.html', icon: 'bi-tags', text: 'Categorías Productos' },
    { type: 'item', href: 'inventario.html', icon: 'bi-boxes', text: 'Inventario' },
    { type: 'section', text: 'Ventas & Clientes' },
    { type: 'item', href: 'ventas.html', icon: 'bi-cart-check', text: 'Ventas' },
    { type: 'item', href: 'servicios_tecnicos.html', icon: 'bi-tools', text: 'Servicios Técnicos' },
    { type: 'item', href: 'categorias_servicios.html', icon: 'bi-bookmark-star', text: 'Categorías<br>Servicios Técnicos' },
    { type: 'item', href: 'clientes.html', icon: 'bi-people', text: 'Clientes' },
    { type: 'section', text: 'Configuración' },
    { type: 'item', href: 'sucursales.html', icon: 'bi-shop', text: 'Sucursales' },
    { type: 'item', href: 'usuarios.html', icon: 'bi-person-badge', text: 'Usuarios' },
    { type: 'item', href: 'roles.html', icon: 'bi-shield-check', text: 'Roles' }
];

/**
 * Render Main Header
 * @param {string} containerSelector - CSS selector for header container
 */
async function renderHeader(containerSelector = '#header-container') {
    // Get user data from API or fallback to localStorage
    let userName = 'Usuario';
    let userEmail = getCurrentUserEmail() || '';
    let userRole = 'Cargando...';
    let userSucursal = '';

    // Try to fetch real user data from API
    try {
        const userData = await apiGet('/perfil/');

        // Extract data
        userName = userData.nombre_apellido || userData.correo_electronico?.split('@')[0] || 'Usuario';
        userEmail = userData.correo_electronico || userEmail;
        userRole = userData.nombre_rol || 'Usuario';
        userSucursal = userData.nombre_sucursal || '';

        // Update localStorage with fresh data
        if (userEmail) localStorage.setItem('user_email', userEmail);
        if (userName) localStorage.setItem('user_name', userName);
        if (userRole) localStorage.setItem('user_role', userRole);
        if (userData.numero_rol) localStorage.setItem('user_numero_rol', userData.numero_rol);
        if (userSucursal) localStorage.setItem('user_sucursal', userSucursal);

    } catch (error) {
        // If API fails, try to use localStorage
        const storedName = localStorage.getItem('user_name');
        const storedRole = localStorage.getItem('user_role');

        if (storedName) userName = storedName;
        else if (userEmail) userName = userEmail.split('@')[0];

        if (storedRole) userRole = storedRole;
        else userRole = 'Usuario';
    }

    const userInitial = userName.charAt(0).toUpperCase();
    const pageTitle = document.title.split(' - ')[0];

    // ... header generation ...
    const headerHTML = `
        <header class="main-header">
            <div class="header-left">
                <!-- Mobile Toggle -->
                <button class="sidebar-toggle sidebar-toggle-mobile" onclick="toggleSidebar()" aria-label="Abrir Menú">
                    <i class="bi bi-list"></i>
                </button>
                <!-- Desktop Collapse -->
                <button class="sidebar-toggle sidebar-toggle-desktop" onclick="toggleSidebarCollapse()" aria-label="Colapsar Menú">
                    <i class="bi bi-list"></i>
                </button>
                
                <div class="breadcrumb-container d-none d-md-block">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="dashboard.html">Inicio</a></li>
                            <li class="breadcrumb-item active" aria-current="page">${pageTitle}</li>
                        </ol>
                    </nav>
                </div>
            </div>
            
            <div class="header-right">
                <div class="user-menu-dropdown">
                    <button class="user-menu-btn" onclick="toggleUserDropdown(event)" aria-expanded="false" aria-haspopup="true">
                        <div class="user-avatar">${userInitial}</div>
                        <div class="user-details d-none d-sm-block">
                            <span class="user-name">${userName}</span>
                            <span class="user-role">${userRole}</span>
                        </div>
                        <i class="bi bi-chevron-down ms-2 text-muted" style="font-size: 0.8rem;"></i>
                    </button>
                    
                    <div id="userDropdown" class="user-dropdown-menu">
                        <div class="px-3 py-2 border-bottom d-sm-none">
                            <div class="fw-bold">${userName}</div>
                            <div class="small text-muted">${userRole}</div>
                        </div>
                        <a href="#" class="dropdown-item-custom">
                            <i class="bi bi-person"></i> Mi Perfil
                        </a>
                        <a href="javascript:void(0)" class="dropdown-item-custom" onclick="openProfileModal()">
                            <i class="bi bi-gear"></i> Configuración
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="javascript:void(0)" class="dropdown-item-custom logout-link" onclick="logout()">
                            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </a>
                    </div>
                </div>
            </div>
        </header>
    `;

    const container = document.querySelector(containerSelector);
    if (container) {
        container.innerHTML = headerHTML;
        setupHeaderEventListeners();
    }
}

/**
 * Setup event listeners for header components
 */
function setupHeaderEventListeners() {
    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            if (!e.target.closest('.user-menu-dropdown')) {
                dropdown.classList.remove('show');
            }
        }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });
}

/**
 * Render Sidebar Navigation
 * @param {string} containerSelector - CSS selector for sidebar container
 * @param {string} activePage - Current page name to highlight
 */
function renderSidebar(containerSelector = '#sidebar-container', activePage = '') {
    // Filter sidebar config based on role (using roles_vistas.js)
    // We assume roles_vistas.js is loaded and getUserRoleNumber() works 
    // (it reads from localStorage which renderHeader populated)

    let configToRender = SIDEBAR_CONFIG;
    if (typeof filterSidebarByRole === 'function') {
        configToRender = filterSidebarByRole(SIDEBAR_CONFIG);
    }

    const navItemsHTML = configToRender.map(config => {
        if (config.type === 'section') {
            return `<li class="nav-section-title">${config.text}</li>`;
        }
        return createNavItem(config.href, config.icon, config.text, activePage);
    }).join('');

    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shop-window"></i>
                <h3>MCMatias</h3>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav flex-column">
                    ${navItemsHTML}
                </ul>
            </nav>
        </aside>
        <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    `;

    const container = document.querySelector(containerSelector);
    if (container) {
        container.innerHTML = sidebarHTML;
    }
}

/**
 * Create navigation item
 * @param {string} href - Page URL
 * @param {string} icon - Bootstrap icon class
 * @param {string} text - Link text
 * @param {string} activePage - Current active page
 */
function createNavItem(href, icon, text, activePage) {
    const isActive = activePage === href ? 'active' : '';
    return `
        <li class="nav-item">
            <a href="${href}" class="nav-link ${isActive}" title="${text}">
                <i class="bi ${icon}"></i>
                <span>${text}</span>
            </a>
        </li>
    `;
}

/**
 * Toggle user dropdown menu
 */
function toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    const btn = event.currentTarget;
    if (dropdown) {
        const isShowing = dropdown.classList.toggle('show');
        btn.setAttribute('aria-expanded', isShowing);
    }
}

/**
 * Toggle sidebar visibility (for mobile)
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) sidebar.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show');
}

/**
 * Toggle sidebar width (for desktop)
 */
function toggleSidebarCollapse() {
    document.body.classList.toggle('sidebar-collapsed');
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

/**
 * Initialize page components
 * @param {string} pageName - Current page filename
 */
async function initializePage(pageName) {
    // Check authentication
    checkAuth();

    // Apply sidebar collapse preference immediately
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }

    // Render components (await header to load user data first)
    await renderHeader();
    renderSidebar('#sidebar-container', pageName);
}
