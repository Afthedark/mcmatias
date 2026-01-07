/**
 * Utilidades de Interfaz de Usuario
 * Maneja notificaciones, modales, loading states y utilidades UI
 */
class UIManager {
  constructor() {
    this.loadingOverlay = null;
    this.toastContainer = null;
    this.modalStack = [];
    this.init();
  }

  /**
   * Inicializar componentes UI
   */
  init() {
    this.createLoadingOverlay();
    this.createToastContainer();
    this.setupGlobalEventListeners();
  }

  /**
   * Crear overlay de carga
   */
  createLoadingOverlay() {
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'loading-overlay';
    this.loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
    `;
    this.loadingOverlay.style.display = 'none';
    document.body.appendChild(this.loadingOverlay);
  }

  /**
   * Crear contenedor de toasts
   */
  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    this.toastContainer.style.zIndex = '1055';
    document.body.appendChild(this.toastContainer);
  }

  /**
   * Setup de event listeners globales
   */
  setupGlobalEventListeners() {
    // Escuchar eventos de autenticación
    document.addEventListener('auth:login', (e) => {
      this.updateUserInfo(e.detail);
    });

    document.addEventListener('auth:logout', () => {
      this.clearUserInfo();
    });

    // Manejar errores no capturados
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.showError('Ha ocurrido un error inesperado');
    });

    // Manejar promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.showError('Ha ocurrido un error inesperado');
      e.preventDefault();
    });
  }

  /**
   * Mostrar loading overlay
   */
  showLoading(message = 'Cargando...') {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'flex';
      if (message) {
        this.loadingOverlay.innerHTML = `
          <div class="loading-spinner"></div>
          <div class="loading-message">${message}</div>
        `;
      }
    }
  }

  /**
   * Ocultar loading overlay
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
  }

  /**
   * Mostrar toast de éxito
   */
  showSuccess(message, title = 'Éxito', duration = 3000) {
    this.showToast('success', message, title, duration);
  }

  /**
   * Mostrar toast de error
   */
  showError(message, title = 'Error', duration = 5000) {
    this.showToast('danger', message, title, duration);
  }

  /**
   * Mostrar toast de advertencia
   */
  showWarning(message, title = 'Advertencia', duration = 4000) {
    this.showToast('warning', message, title, duration);
  }

  /**
   * Mostrar toast de información
   */
  showInfo(message, title = 'Información', duration = 3000) {
    this.showToast('info', message, title, duration);
  }

  /**
   * Mostrar toast genérico
   */
  showToast(type, message, title, duration = 3000) {
    const toastId = `toast_${Date.now()}`;
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <strong>${title}:</strong> ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;

    this.toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
      autohide: duration > 0,
      delay: duration
    });

    toast.show();

    // Eliminar del DOM después de ocultar
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  /**
   * Mostrar confirmación con SweetAlert2
   */
  async confirm(options = {}) {
    const defaults = {
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    };

    const config = { ...defaults, ...options };
    
    try {
      const result = await Swal.fire(config);
      return result.isConfirmed;
    } catch (error) {
      console.error('Error en confirmación:', error);
      return false;
    }
  }

  /**
   * Mostrar alerta con SweetAlert2
   */
  async alert(options = {}) {
    const defaults = {
      title: 'Información',
      text: '',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    };

    const config = { ...defaults, ...options };
    
    try {
      await Swal.fire(config);
    } catch (error) {
      console.error('Error en alerta:', error);
    }
  }

  /**
   * Mostrar modal con contenido dinámico
   */
  showModal(options = {}) {
    const defaults = {
      title: 'Modal',
      content: '',
      size: 'modal-lg',
      backdrop: true,
      keyboard: true,
      showCloseButton: true
    };

    const config = { ...defaults, ...options };
    
    const modalId = `modal_${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="${config.backdrop}" data-bs-keyboard="${config.keyboard}">
        <div class="modal-dialog ${config.size}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${config.title}</h5>
              ${config.showCloseButton ? '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' : ''}
            </div>
            <div class="modal-body">
              ${config.content}
            </div>
            ${config.footer ? `<div class="modal-footer">${config.footer}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    
    this.modalStack.push({ modal, element: modalElement });
    
    // Eliminar del DOM después de ocultar
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
      this.modalStack = this.modalStack.filter(item => item.element !== modalElement);
    });

    modal.show();
    return modal;
  }

  /**
   * Cerrar todos los modales
   */
  closeAllModals() {
    this.modalStack.forEach(({ modal }) => {
      modal.hide();
    });
  }

  /**
   * Crear modal de confirmación personalizado
   */
  async confirmModal(options = {}) {
    const defaults = {
      title: 'Confirmar Acción',
      content: '<p>¿Estás seguro de realizar esta acción?</p>',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmClass: 'btn-primary',
      cancelClass: 'btn-secondary'
    };

    const config = { ...defaults, ...options };
    
    return new Promise((resolve) => {
      const footer = `
        <button type="button" class="btn ${config.cancelClass}" data-bs-dismiss="modal">${config.cancelText}</button>
        <button type="button" class="btn ${config.confirmClass}" id="confirmBtn">${config.confirmText}</button>
      `;

      const modal = this.showModal({
        title: config.title,
        content: config.content,
        footer
      });

      const confirmBtn = document.getElementById('confirmBtn');
      confirmBtn.addEventListener('click', () => {
        modal.hide();
        resolve(true);
      });

      // Escuchar cancelación
      modal.element.addEventListener('hidden.bs.modal', () => {
        resolve(false);
      });
    });
  }

  /**
   * Actualizar información del usuario en la UI
   */
  updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    userNameElements.forEach(element => {
      element.textContent = user.nombre_apellido || 'Usuario';
    });

    userAvatarElements.forEach(element => {
      const initials = this.getInitials(user.nombre_apellido);
      element.textContent = initials;
    });
  }

  /**
   * Limpiar información del usuario
   */
  clearUserInfo() {
    const userNameElements = document.querySelectorAll('.user-name');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    userNameElements.forEach(element => {
      element.textContent = '';
    });

    userAvatarElements.forEach(element => {
      element.textContent = '';
    });
  }

  /**
   * Obtener iniciales del nombre
   */
  getInitials(name) {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount, currency = 'USD', locale = 'es-ES') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Formatear fecha
   */
  formatDate(date, options = {}) {
    const defaults = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };

    const config = { ...defaults, ...options };
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-ES', config);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return date;
    }
  }

  /**
   * Formatear fecha corta
   */
  formatShortDate(date) {
    return this.formatDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Formatear hora
   */
  formatTime(date) {
    return this.formatDate(date, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Validar formulario
   */
  validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    const errors = [];

    inputs.forEach(input => {
      if (!input.value.trim()) {
        errors.push(`El campo "${this.getFieldLabel(input)}" es requerido`);
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }

      // Validaciones específicas
      if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          errors.push(`El campo "${this.getFieldLabel(input)}" no es un email válido`);
          input.classList.add('is-invalid');
        }
      }

      if (input.type === 'tel' && input.value) {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        if (!phoneRegex.test(input.value)) {
          errors.push(`El campo "${this.getFieldLabel(input)}" no es un teléfono válido`);
          input.classList.add('is-invalid');
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Obtener label del campo
   */
  getFieldLabel(input) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    
    const placeholder = input.getAttribute('placeholder');
    if (placeholder) {
      return placeholder;
    }
    
    return input.name || input.id || 'Campo';
  }

  /**
   * Mostrar errores de formulario
   */
  showFormErrors(errors, formElement) {
    // Limpiar errores anteriores
    formElement.querySelectorAll('.is-invalid').forEach(input => {
      input.classList.remove('is-invalid');
    });
    formElement.querySelectorAll('.invalid-feedback').forEach(feedback => {
      feedback.remove();
    });

    // Mostrar nuevos errores
    errors.forEach(error => {
      UI.showError(error);
    });
  }

  /**
   * Resetear formulario
   */
  resetForm(formElement) {
    formElement.reset();
    formElement.querySelectorAll('.is-invalid, .is-valid').forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
    });
    formElement.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(feedback => {
      feedback.remove();
    });
  }

  /**
   * Crear badge de estado
   */
  createStatusBadge(status, type = 'primary') {
    const types = {
      'active': 'success',
      'inactive': 'danger',
      'pending': 'warning',
      'completed': 'success',
      'cancelled': 'danger',
      'reparación': 'warning',
      'para retirar': 'info',
      'entregado': 'success'
    };

    const badgeType = types[status.toLowerCase()] || type;
    
    return `<span class="badge bg-${badgeType}">${status}</span>`;
  }

  /**
   * Crear botones de acción para tablas
   */
  createActionButtons(options = {}) {
    const defaults = {
      showView: true,
      showEdit: true,
      showDelete: true,
      viewCallback: null,
      editCallback: null,
      deleteCallback: null
    };

    const config = { ...defaults, ...options };
    let buttons = '';

    if (config.showView && config.viewCallback) {
      buttons += `<button class="btn btn-sm btn-info btn-action view-btn" title="Ver">
        <i class="fas fa-eye"></i>
      </button>`;
    }

    if (config.showEdit && config.editCallback) {
      buttons += `<button class="btn btn-sm btn-warning btn-action edit-btn" title="Editar">
        <i class="fas fa-edit"></i>
      </button>`;
    }

    if (config.showDelete && config.deleteCallback) {
      buttons += `<button class="btn btn-sm btn-danger btn-action delete-btn" title="Eliminar">
        <i class="fas fa-trash"></i>
      </button>`;
    }

    return buttons;
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const sidebar = document.querySelector('.main-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
      sidebar.classList.toggle('show');
      if (overlay) {
        overlay.classList.toggle('show');
      }
      
      // Guardar estado
      const isCollapsed = !sidebar.classList.contains('show');
      Storage.saveSidebarState(isCollapsed);
    }
  }

  /**
   * Mostrar empty state
   */
  showEmptyState(container, options = {}) {
    const defaults = {
      icon: 'fas fa-inbox',
      title: 'No hay datos',
      description: 'No se encontraron registros para mostrar',
      actionText: null,
      actionCallback: null
    };

    const config = { ...defaults, ...options };
    
    const emptyStateHtml = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="${config.icon}"></i>
        </div>
        <div class="empty-title">${config.title}</div>
        <div class="empty-description">${config.description}</div>
        ${config.actionText && config.actionCallback ? 
          `<button class="btn btn-primary" onclick="${config.actionCallback}">${config.actionText}</button>` : ''
        }
      </div>
    `;

    container.innerHTML = emptyStateHtml;
  }

  /**
   * Scroll to top
   */
  scrollToTop(smooth = true) {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess('Copiado al portapapeles');
      return true;
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      this.showError('Error al copiar al portapapeles');
      return false;
    }
  }

  /**
   * Download data as JSON
   */
  downloadJSON(data, filename = 'data.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Instancia global del gestor UI
const ui = new UIManager();

// Métodos estáticos para compatibilidad
const UI = {
  // Loading states
  showLoading: (message) => ui.showLoading(message),
  hideLoading: () => ui.hideLoading(),
  
  // Toast notifications
  showSuccess: (message, title, duration) => ui.showSuccess(message, title, duration),
  showError: (message, title, duration) => ui.showError(message, title, duration),
  showWarning: (message, title, duration) => ui.showWarning(message, title, duration),
  showInfo: (message, title, duration) => ui.showInfo(message, title, duration),
  
  // Modals
  showModal: (options) => ui.showModal(options),
  confirmModal: (options) => ui.confirmModal(options),
  closeAllModals: () => ui.closeAllModals(),
  
  // Alerts
  confirm: (options) => ui.confirm(options),
  alert: (options) => ui.alert(options),
  
  // Form utilities
  validateForm: (form) => ui.validateForm(form),
  showFormErrors: (errors, form) => ui.showFormErrors(errors, form),
  resetForm: (form) => ui.resetForm(form),
  
  // UI components
  createStatusBadge: (status, type) => ui.createStatusBadge(status, type),
  createActionButtons: (options) => ui.createActionButtons(options),
  showEmptyState: (container, options) => ui.showEmptyState(container, options),
  
  // Utilities
  formatCurrency: (amount, currency, locale) => ui.formatCurrency(amount, currency, locale),
  formatDate: (date, options) => ui.formatDate(date, options),
  formatShortDate: (date) => ui.formatShortDate(date),
  formatTime: (date) => ui.formatTime(date),
  getInitials: (name) => ui.getInitials(name),
  copyToClipboard: (text) => ui.copyToClipboard(text),
  downloadJSON: (data, filename) => ui.downloadJSON(data, filename),
  
  // Navigation
  toggleSidebar: () => ui.toggleSidebar(),
  scrollToTop: (smooth) => ui.scrollToTop(smooth),
  
  // User interface
  updateUserInfo: (user) => ui.updateUserInfo(user),
  clearUserInfo: () => ui.clearUserInfo()
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager, ui, UI };
}