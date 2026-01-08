/**
 * Reusable Components Module
 * Header and Sidebar injection for all protected pages
 */

/**
 * Render Main Header
 * @param {string} containerSelector - CSS selector for header container
 */
function renderHeader(containerSelector = '#header-container') {
    const userEmail = getCurrentUserEmail() || 'usuario@ejemplo.com';
    const userName = userEmail.split('@')[0]; // Extract name from email

    const headerHTML = `
        <div class="main-header">
            <button class="sidebar-toggle" onclick="toggleSidebar()">
                <i class="bi bi-list"></i>
            </button>
            
            <div class="user-menu">
                <div class="user-info">
                    <div class="user-name">${userName}</div>
                    <div class="user-role">Administrador</div>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="bi bi-box-arrow-right"></i> Salir
                </button>
            </div>
        </div>
    `;

    const container = document.querySelector(containerSelector);
    if (container) {
        container.innerHTML = headerHTML;
    }
}

/**
 * Render Sidebar Navigation
 * @param {string} containerSelector - CSS selector for sidebar container
 * @param {string} activePage - Current page name to highlight
 */
function renderSidebar(containerSelector = '#sidebar-container', activePage = '') {
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shop-window" style="font-size: 2rem; color: #007bff;"></i>
                <h3>MCMatias</h3>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav flex-column">
                    ${createNavItem('dashboard.html', 'bi-speedometer2', 'Dashboard', activePage)}
                    
                    <li class="nav-section-title">GESTIÓN</li>
                    ${createNavItem('productos.html', 'bi-box-seam', 'Productos', activePage)}
                    ${createNavItem('clientes.html', 'bi-people', 'Clientes', activePage)}
                    ${createNavItem('inventario.html', 'bi-boxes', 'Inventario', activePage)}
                    
                    <li class="nav-section-title">OPERACIONES</li>
                    ${createNavItem('ventas.html', 'bi-cart-check', 'Ventas', activePage)}
                    ${createNavItem('servicios_tecnicos.html', 'bi-tools', 'Servicios Técnicos', activePage)}
                    
                    <li class="nav-section-title">CONFIGURACIÓN</li>
                    ${createNavItem('categorias.html', 'bi-tags', 'Categorías', activePage)}
                    ${createNavItem('sucursales.html', 'bi-shop', 'Sucursales', activePage)}
                    ${createNavItem('roles.html', 'bi-shield-check', 'Roles', activePage)}
                    ${createNavItem('usuarios.html', 'bi-person-badge', 'Usuarios', activePage)}
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
 * @returns {string} - HTML string
 */
function createNavItem(href, icon, text, activePage) {
    const isActive = activePage === href ? 'active' : '';
    return `
        <li class="nav-item">
            <a href="${href}" class="nav-link ${isActive}">
                <i class="bi ${icon}"></i>
                <span>${text}</span>
            </a>
        </li>
    `;
}

/**
 * Toggle sidebar visibility (for mobile)
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('show');
    }
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

/**
 * Initialize page components
 * Call this on every protected page
 * @param {string} pageName - Current page filename (e.g., 'dashboard.html')
 */
function initializePage(pageName) {
    // Check authentication
    checkAuth();

    // Render components
    renderHeader();
    renderSidebar('#sidebar-container', pageName);
}
