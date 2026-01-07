/**
 * Gestor de Autenticación
 * Maneja login, logout, tokens y sesión de usuario
 */
class AuthManager {
  constructor() {
    this.token = null;
    this.user = null;
    this.refreshTimer = null;
  }

  /**
   * Iniciar sesión
   */
  async login(email, password, rememberMe = false) {
    try {
      UI.showLoading();
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        correo_electronico: email,
        contraseña: password
      });
      
      // Guardar token y usuario
      this.setSession(response.data, rememberMe);
      
      // Iniciar timer de refresh
      this.startRefreshTimer();
      
      UI.showSuccess('¡Bienvenido! Iniciando sesión...');
      
      // Redirigir después de un pequeño delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      UI.showError('Credenciales inválidas. Por favor, verifica tu email y contraseña');
      throw error;
    } finally {
      UI.hideLoading();
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      UI.showLoading();
      
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      UI.showSuccess('¡Usuario creado exitosamente! Por favor, inicia sesión');
      
      // Redirigir a login
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      UI.hideLoading();
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      // Detener timer de refresh
      this.stopRefreshTimer();
      
      // Limpiar storage
      Storage.clear();
      
      // Mostrar mensaje
      UI.showInfo('Cerrando sesión...');
      
      // Redirigir a login
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Forzar logout incluso si hay error
      Storage.clear();
      window.location.href = '/login.html';
    }
  }

  /**
   * Establecer sesión (token y usuario)
   */
  setSession(data, rememberMe = false) {
    const { token, usuario } = data;
    
    // Guardar en storage
    Storage.set('token', token);
    Storage.set('user', usuario);
    
    // Si rememberMe, guardar en localStorage (ya es por defecto)
    // Si no, guardar en sessionStorage (implementación futura)
    
    // Actualizar variables de instancia
    this.token = token;
    this.user = usuario;
    
    // Disparar evento
    this.dispatchAuthEvent('login', usuario);
  }

  /**
   * Limpiar sesión
   */
  clearSession() {
    Storage.remove('token');
    Storage.remove('user');
    
    this.token = null;
    this.user = null;
    
    this.stopRefreshTimer();
    
    this.dispatchAuthEvent('logout');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    const token = Storage.get('token');
    const user = Storage.get('user');
    
    if (!token || !user) {
      return false;
    }
    
    // Verificar si el token no ha expirado
    try {
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      
      // Si el token expira en menos de 5 minutos, considerar como expirado
      return payload.exp > (currentTime + 300);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return Storage.get('user') || this.user;
  }

  /**
   * Obtener token actual
   */
  getToken() {
    return Storage.get('token') || this.token;
  }

  /**
   * Verificar rol del usuario
   */
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    return user && user.rol && user.rol.nombre_rol === requiredRole;
  }

  /**
   * Verificar si es administrador
   */
  isAdmin() {
    return this.hasRole('administrador');
  }

  /**
   * Verificar si es cajero
   */
  isCajero() {
    return this.hasRole('cajero');
  }

  /**
   * Verificar si es técnico
   */
  isTecnico() {
    return this.hasRole('técnico');
  }

  /**
   * Obtener sucursal del usuario
   */
  getUserBranch() {
    const user = this.getCurrentUser();
    return user && user.sucursal;
  }

  /**
   * Parsear JWT token
   */
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Iniciar timer de refresh de token
   */
  startRefreshTimer() {
    // Detener timer existente
    this.stopRefreshTimer();
    
    try {
      const token = this.getToken();
      const payload = this.parseJWT(token);
      const currentTime = Date.now() / 1000;
      const expiresIn = payload.exp - currentTime;
      
      // Refresh 5 minutos antes de que expire
      const refreshIn = (expiresIn - 300) * 1000;
      
      if (refreshIn > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, refreshIn);
      }
    } catch (error) {
      console.error('Error starting refresh timer:', error);
    }
  }

  /**
   * Detener timer de refresh
   */
  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refrescar token (implementación futura)
   */
  async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) return;
      
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        token
      });
      
      // Actualizar token
      Storage.set('token', response.data.token);
      this.token = response.data.token;
      
      // Reiniciar timer
      this.startRefreshTimer();
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Si falla el refresh, hacer logout
      this.logout();
    }
  }

  /**
   * Disparar eventos de autenticación
   */
  dispatchAuthEvent(event, data = null) {
    const customEvent = new CustomEvent(`auth:${event}`, {
      detail: data
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Verificar autenticación y redirigir si es necesario
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      UI.showWarning('Debes iniciar sesión para acceder a esta página');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
      return false;
    }
    return true;
  }

  /**
   * Verificar permisos de rol
   */
  requireRole(requiredRole) {
    if (!this.isAuthenticated()) {
      this.requireAuth();
      return false;
    }
    
    if (!this.hasRole(requiredRole)) {
      UI.showError('No tienes permisos para acceder a esta página');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
      return false;
    }
    
    return true;
  }

  /**
   * Actualizar datos del usuario en storage
   */
  updateUser(userData) {
    const currentUser = this.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    
    Storage.set('user', updatedUser);
    this.user = updatedUser;
    
    this.dispatchAuthEvent('userUpdated', updatedUser);
  }

  /**
   * Obtener headers para requests autenticados
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Instancia global del gestor de autenticación
const auth = new AuthManager();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, auth };
}