/**
 * Cliente HTTP - API Client
 * Maneja todas las comunicaciones con el backend
 */
class ApiClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }

  /**
   * Configurar interceptores para manejo global de requests/responses
   */
  setupInterceptors() {
    // Interceptor de requests - Agregar token JWT
    this.axios.interceptors.request.use(
      (config) => {
        const token = Storage.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log en desarrollo
        if (window.location.hostname === 'localhost') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de responses - Manejo global de errores
    this.axios.interceptors.response.use(
      (response) => {
        // Log en desarrollo
        if (window.location.hostname === 'localhost') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        
        // Verificar que UI está disponible para evitar errores de carga
        if (typeof UI !== 'undefined') {
          // UI está disponible, continuar normalmente
        } else {
          console.warn('UI not available yet, continuing without UI updates');
        }
        
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error);
        
        // Manejar diferentes tipos de errores
        if (error.response) {
          // Error del servidor (4xx, 5xx)
          switch (error.response.status) {
            case 401:
              // No autorizado - limpiar sesión y redirigir
              this.handleUnauthorized();
              break;
            case 403:
              // Prohibido - mostrar mensaje
              if (typeof UI !== 'undefined') UI.showError('No tienes permisos para realizar esta acción');
              break;
            case 404:
              // No encontrado
              if (typeof UI !== 'undefined') UI.showError('El recurso solicitado no fue encontrado');
              break;
            case 422:
              // Error de validación
              if (typeof UI !== 'undefined') this.handleValidationError(error.response.data);
              break;
            case 500:
              // Error del servidor
              if (typeof UI !== 'undefined') UI.showError('Error interno del servidor. Inténtalo nuevamente');
              break;
            default:
              if (typeof UI !== 'undefined') UI.showError(error.response.data.message || 'Ocurrió un error inesperado');
              else console.error('API Error:', error.response?.data?.message || error.message);
          }
        } else if (error.request) {
          // Error de red - no hay respuesta
          if (typeof UI !== 'undefined') UI.showError('Error de conexión. Verifica tu conexión a internet');
          else console.error('Network Error:', error.message);
        } else {
          // Error en la configuración del request
          if (typeof UI !== 'undefined') UI.showError('Error en la solicitud. Inténtalo nuevamente');
          else console.error('Request Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Manejar error 401 - No autorizado
   */
  handleUnauthorized() {
    Storage.clear();
    UI.showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente');
    
    // Redirigir a login después de un pequeño delay
    setTimeout(() => {
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
      }
    }, 2000);
  }

  /**
   * Manejar errores de validación (422)
   */
  handleValidationError(data) {
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessage = data.errors.map(err => err.msg).join('<br>');
      UI.showError(errorMessage);
    } else {
      UI.showError(data.message || 'Error de validación');
    }
  }

  /**
   * Método GET genérico
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método POST genérico
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.axios.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método PUT genérico
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.axios.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método DELETE genérico
   */
  async delete(endpoint) {
    try {
      const response = await this.axios.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload de archivos
   */
  async uploadFile(endpoint, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload múltiples archivos
   */
  async uploadMultipleFiles(endpoint, files, fileNames = [], onProgress = null) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      const fieldName = fileNames[index] || `file_${index}`;
      formData.append(fieldName, file);
    });

    try {
      const response = await this.axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Descargar archivo
   */
  async downloadFile(endpoint, filename = null) {
    try {
      const response = await this.axios.get(endpoint, {
        responseType: 'blob'
      });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar request
   */
  createCancelToken() {
    return axios.CancelToken.source();
  }

  /**
   * Verificar si el error fue cancelado
   */
  isCancel(error) {
    return axios.isCancel(error);
  }
}

// Endpoints de la API
const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  
  // Clientes
  CLIENTES: {
    LIST: '/clientes',
    GET: (id) => `/clientes/${id}`,
    CREATE: '/clientes',
    UPDATE: (id) => `/clientes/${id}`,
    DELETE: (id) => `/clientes/${id}`
  },
  
  // Productos
  PRODUCTOS: {
    LIST: '/productos',
    GET: (id) => `/productos/${id}`,
    CREATE: '/productos',
    UPDATE: (id) => `/productos/${id}`,
    DELETE: (id) => `/productos/${id}`
  },
  
  // Categorías
  CATEGORIAS: {
    LIST: '/categorias',
    GET: (id) => `/categorias/${id}`,
    CREATE: '/categorias',
    UPDATE: (id) => `/categorias/${id}`,
    DELETE: (id) => `/categorias/${id}`
  },
  
  // Sucursales
  SUCURSALES: {
    LIST: '/sucursales',
    GET: (id) => `/sucursales/${id}`,
    CREATE: '/sucursales',
    UPDATE: (id) => `/sucursales/${id}`,
    DELETE: (id) => `/sucursales/${id}`
  },
  
  // Inventario
  INVENTARIO: {
    LIST: '/inventario',
    BY_SUCURSAL: (id) => `/inventario/sucursal/${id}`,
    BY_PRODUCTO: (id) => `/inventario/producto/${id}`,
    CREATE: '/inventario',
    UPDATE: (id) => `/inventario/${id}`,
    DELETE: (id) => `/inventario/${id}`
  },
  
  // Ventas
  VENTAS: {
    LIST: '/ventas',
    GET: (id) => `/ventas/${id}`,
    CREATE: '/ventas',
    DELETE: (id) => `/ventas/${id}`
  },
  
  // Servicios Técnicos
  SERVICIOS: {
    LIST: '/servicios',
    GET: (id) => `/servicios/${id}`,
    CREATE: '/servicios',
    UPDATE: (id) => `/servicios/${id}`,
    DELETE: (id) => `/servicios/${id}`
  },
  
  // Usuarios (Admin)
  USUARIOS: {
    LIST: '/usuarios',
    GET: (id) => `/usuarios/${id}`,
    CREATE: '/usuarios',
    UPDATE: (id) => `/usuarios/${id}`,
    DELETE: (id) => `/usuarios/${id}`
  },
  
  // Roles (Admin)
  ROLES: {
    LIST: '/roles',
    GET: (id) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id) => `/roles/${id}`,
    DELETE: (id) => `/roles/${id}`
  }
};

// Instancia global de la API
const api = new ApiClient();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient, API_ENDPOINTS, api };
}