/**
 * Gestor de Navegación
 * Maneja ruteo simple para MPA y navegación entre páginas
 */
class RouterManager {
  constructor() {
    this.routes = new Map();
    this.currentPage = this.getCurrentPage();
    this.currentPageController = null;
    this.navigationHistory = [];
    this.init();
  }

  /**
   * Inicializar router
   */
  init() {
    this.setupEventListeners();
    this.updateNavigationState();
    this.setupGlobalNavigation();
  }

  /**
   * Setup de event listeners
   */
  setupEventListeners() {
    // Escuchar cambios de ruta (para SPA-like behavior en el futuro)
    window.addEventListener('popstate', (e) => {
      this.handlePopState(e);
    });

    // Escuar clicks en links
    document.addEventListener('click', (e) => {
      this.handleLinkClick(e);
    });

    // Escuchar eventos de autenticación
    document.addEventListener('auth:login', () => {
      this.updateNavigationState();
    });

    document.addEventListener('auth:logout', () => {
      this.updateNavigationState();
    });
  }

  /**
   * Setup de navegación global
   */
  setupGlobalNavigation() {
    // Activar link actual
    this.activateCurrentNavLink();
    
    // Setup botón de logout
    this.setupLogoutButton();
    
    // Setup toggle de sidebar
    this.setupSidebarToggle();
    
    // Setup breadcrumbs
    this.updateBreadcrumbs();
  }

  /**
   * Obtener página actual
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';
    return pageName.replace('.html', '');
  }

  /**
   * Navegar a una página
   */
  navigate(page, data = {}) {
    const url = this.buildPageUrl(page, data);
    
    // Agregar al historial
    this.navigationHistory.push({
      page,
      data,
      url,
      timestamp: Date.now()
    });
    
    // Navegar
    window.location.href = url;
  }

  /**
   * Construir URL de página
   */
  buildPageUrl(page, data = {}) {
    let url = `/${page}.html`;
    
    if (Object.keys(data).length > 0) {
      const params = new URLSearchParams(data);
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Manejar clicks en links
   */
  handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Ignorar links externos, anchors, y especiales
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    
    // Manejar links internos
    if (href.endsWith('.html') || href.startsWith('/')) {
      e.preventDefault();
      
      const pageName = href.replace('.html', '').replace(/^\//, '');
      const url = new URL(link.href);
      const params = Object.fromEntries(url.searchParams);
      
      this.navigate(pageName, params);
    }
  }

  /**
   * Manejar popstate (botón back del navegador)
   */
  handlePopState(e) {
    this.currentPage = this.getCurrentPage();
    this.updateNavigationState();
    this.activateCurrentNavLink();
    this.updateBreadcrumbs();
  }

  /**
   * Actualizar estado de navegación
   */
  updateNavigationState() {
    // Actualizar links activos
    this.activateCurrentNavLink();
    
    // Actualizar visibilidad de elementos según autenticación
    this.updateAuthenticatedElements();
    
    // Actualizar elementos según rol
    this.updateRoleBasedElements();
    
    // Actualizar breadcrumbs
    this.updateBreadcrumbs();
  }

  /**
   * Activar link de navegación actual
   */
  activateCurrentNavLink() {
    // Remover clase activa de todos los links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Agregar clase activa al link actual
    const currentLink = document.querySelector(`.nav-link[href*="${this.currentPage}"]`);
    if (currentLink) {
      currentLink.classList.add('active');
    }
    
    // Expandir menú padre si está en un submenu
    const parentDropdown = currentLink?.closest('.dropdown-menu');
    if (parentDropdown) {
      const parentToggle = parentDropdown.previousElementSibling;
      if (parentToggle && parentToggle.classList.contains('nav-link')) {
        parentToggle.classList.add('active');
        parentDropdown.classList.add('show');
      }
    }
  }

  /**
   * Actualizar elementos que requieren autenticación
   */
  updateAuthenticatedElements() {
    const isAuthenticated = auth.isAuthenticated();
    
    // Mostrar/ocultar elementos según autenticación
    document.querySelectorAll('[data-require-auth]').forEach(element => {
      element.style.display = isAuthenticated ? '' : 'none';
    });
    
    document.querySelectorAll('[data-require-guest]').forEach(element => {
      element.style.display = !isAuthenticated ? '' : 'none';
    });
  }

  /**
   * Actualizar elementos basados en rol
   */
  updateRoleBasedElements() {
    const user = auth.getCurrentUser();
    if (!user || !user.rol) return;
    
    const userRole = user.rol.nombre_rol;
    
    // Mostrar/ocultar según rol específico
    document.querySelectorAll('[data-require-role]').forEach(element => {
      const requiredRoles = element.getAttribute('data-require-role').split(',');
      const hasRequiredRole = requiredRoles.includes(userRole.toLowerCase());
      element.style.display = hasRequiredRole ? '' : 'none';
    });
  }

  /**
   * Actualizar breadcrumbs
   */
  updateBreadcrumbs() {
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;
    
    const breadcrumbs = this.generateBreadcrumbs();
    
    breadcrumbContainer.innerHTML = breadcrumbs.map((item, index) => {
      if (index === breadcrumbs.length - 1) {
        return `<li class="breadcrumb-item active" aria-current="page">${item.label}</li>`;
      } else {
        return `<li class="breadcrumb-item">
          <a href="${item.url}" class="text-decoration-none">${item.label}</a>
        </li>`;
      }
    }).join('');
  }

  /**
   * Generar breadcrumbs basados en página actual
   */
  generateBreadcrumbs() {
    const breadcrumbs = [
      { label: 'Inicio', url: '/dashboard.html' }
    ];
    
    // Agregar página actual basada en mapeo
    const pageMap = {
      'dashboard': { label: 'Dashboard', url: '/dashboard.html' },
      'clientes': { label: 'Clientes', url: '/pages/clientes.html' },
      'productos': { label: 'Productos', url: '/pages/productos.html' },
      'sucursales': { label: 'Sucursales', url: '/pages/sucursales.html' },
      'inventario': { label: 'Inventario', url: '/pages/inventario.html' },
      'ventas': { label: 'Ventas', url: '/pages/ventas.html' },
      'servicios': { label: 'Servicios Técnicos', url: '/pages/servicios.html' },
      'perfil': { label: 'Mi Perfil', url: '/pages/perfil.html' }
    };
    
    const currentPageInfo = pageMap[this.currentPage];
    if (currentPageInfo) {
      breadcrumbs.push(currentPageInfo);
    } else if (this.currentPage !== 'index' && this.currentPage !== 'login') {
      breadcrumbs.push({ label: this.currentPage, url: window.location.pathname });
    }
    
    return breadcrumbs;
  }

  /**
   * Setup botón de logout
   */
  setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const confirmed = await UI.confirm({
          title: 'Cerrar Sesión',
          text: '¿Estás seguro de que deseas cerrar tu sesión?',
          icon: 'question'
        });
        
        if (confirmed) {
          await auth.logout();
        }
      });
    }
  }

  /**
   * Setup toggle de sidebar
   */
  setupSidebarToggle() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        UI.toggleSidebar();
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', () => {
        UI.toggleSidebar();
      });
    }
    
    // Restaurar estado del sidebar
    const sidebarCollapsed = Storage.getSidebarState();
    const sidebar = document.querySelector('.main-sidebar');
    if (sidebar && sidebarCollapsed) {
      sidebar.classList.add('collapsed');
    }
  }

  /**
   * Verificar permisos de página
   */
  checkPagePermissions() {
    // Páginas públicas
    const publicPages = ['index', 'login', 'register', 'forgot-password'];
    
    // Páginas que requieren autenticación
    const protectedPages = ['dashboard', 'clientes', 'productos', 'sucursales', 'inventario', 'ventas', 'servicios', 'perfil'];
    
    // Páginas de administrador
    const adminPages = ['usuarios', 'roles', 'settings'];
    
    const page = this.currentPage;
    
    // Verificar si la página requiere autenticación
    if (protectedPages.includes(page) && !auth.isAuthenticated()) {
      UI.showWarning('Debes iniciar sesión para acceder a esta página');
      setTimeout(() => {
        this.navigate('login', { redirect: page });
      }, 1500);
      return false;
    }
    
    // Verificar si la página requiere rol de administrador
    if (adminPages.includes(page) && !auth.isAdmin()) {
      UI.showError('No tienes permisos para acceder a esta página');
      setTimeout(() => {
        this.navigate('dashboard');
      }, 1500);
      return false;
    }
    
    return true;
  }

  /**
   * Cargar página
   */
  async loadPage() {
    // Verificar permisos
    if (!this.checkPagePermissions()) {
      return;
    }
    
    // Cargar controlador de página si existe
    const controllerPath = `/assets/js/pages/${this.currentPage}.js`;
    
    try {
      // Importar dinámicamente el controlador de página
      const module = await import(controllerPath);
      
      if (module.default && typeof module.default.init === 'function') {
        // Limpiar controlador anterior
        if (this.currentPageController && typeof this.currentPageController.destroy === 'function') {
          this.currentPageController.destroy();
        }
        
        // Inicializar nuevo controlador
        this.currentPageController = new module.default();
        await this.currentPageController.init();
      }
    } catch (error) {
      console.warn(`No se encontró controlador para la página: ${this.currentPage}`);
    }
    
    // Actualizar UI
    this.updateNavigationState();
  }

  /**
   * Redirigir con delay
   */
  redirect(page, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        this.navigate(page);
      }, delay);
    } else {
      this.navigate(page);
    }
  }

  /**
   * Recargar página actual
   */
  reload() {
    window.location.reload();
  }

  /**
   * Reemplazar en historial
   */
  replace(page, data = {}) {
    const url = this.buildPageUrl(page, data);
    window.history.replaceState({}, '', url);
  }

  /**
   * Obtener parámetros de URL
   */
  getURLParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
  }

  /**
   * Establecer parámetros de URL
   */
  setURLParams(params, replace = false) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  }

  /**
   * Obtener historial de navegación
   */
  getNavigationHistory() {
    return [...this.navigationHistory];
  }

  /**
   * Limpiar historial de navegación
   */
  clearNavigationHistory() {
    this.navigationHistory = [];
  }

  /**
   * Ir atrás en el historial
   */
  goBack() {
    if (this.navigationHistory.length > 1) {
      this.navigationHistory.pop();
      const previousPage = this.navigationHistory.pop();
      if (previousPage) {
        this.navigate(previousPage.page, previousPage.data);
      }
    } else {
      window.history.back();
    }
  }

  /**
   * Ir adelante en el historial
   */
  goForward() {
    window.history.forward();
  }

  /**
   * Verificar si puede ir atrás
   */
  canGoBack() {
    return this.navigationHistory.length > 1 || window.history.length > 1;
  }

  /**
   * Crear link de navegación
   */
  createLink(page, text, options = {}) {
    const defaults = {
      class: '',
      target: '_self',
      params: {}
    };
    
    const config = { ...defaults, ...options };
    
    const url = this.buildPageUrl(page, config.params);
    
    return `<a href="${url}" class="${config.class}" target="${config.target}">${text}</a>`;
  }

  /**
   * Crear breadcrumb manual
   */
  createBreadcrumb(items) {
    return `<nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        ${items.map((item, index) => {
          if (index === items.length - 1) {
            return `<li class="breadcrumb-item active" aria-current="page">${item}</li>`;
          } else {
            return `<li class="breadcrumb-item">
              <a href="#" class="text-decoration-none">${item}</a>
            </li>`;
          }
        }).join('')}
      </ol>
    </nav>`;
  }
}

// Instancia global del router
const router = new RouterManager();

// Métodos estáticos para compatibilidad
const Router = {
  navigate: (page, data) => router.navigate(page, data),
  redirect: (page, delay) => router.redirect(page, delay),
  reload: () => router.reload(),
  replace: (page, data) => router.replace(page, data),
  goBack: () => router.goBack(),
  goForward: () => router.goForward(),
  canGoBack: () => router.canGoBack(),
  getCurrentPage: () => router.getCurrentPage(),
  getURLParams: () => router.getURLParams(),
  setURLParams: (params, replace) => router.setURLParams(params, replace),
  createLink: (page, text, options) => router.createLink(page, text, options),
  createBreadcrumb: (items) => router.createBreadcrumb(items),
  loadPage: () => router.loadPage(),
  checkPagePermissions: () => router.checkPagePermissions()
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RouterManager, router, Router };
}