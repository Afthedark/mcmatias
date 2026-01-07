/**
 * Gestor de Almacenamiento Local
 * Maneja localStorage y sessionStorage de forma segura
 */
class StorageManager {
  constructor() {
    this.prefix = 'mcmatias_';
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.isSessionStorageAvailable = this.checkSessionStorageAvailability();
  }

  /**
   * Verificar disponibilidad de localStorage
   */
  checkLocalStorageAvailability() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage no está disponible:', error);
      return false;
    }
  }

  /**
   * Verificar disponibilidad de sessionStorage
   */
  checkSessionStorageAvailability() {
    try {
      const testKey = '__test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('sessionStorage no está disponible:', error);
      return false;
    }
  }

  /**
   * Generar clave con prefijo
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Guardar dato en localStorage
   */
  setLocal(key, value) {
    if (!this.isLocalStorageAvailable) {
      console.warn('localStorage no está disponible');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  }

  /**
   * Obtener dato desde localStorage
   */
  getLocal(key, defaultValue = null) {
    if (!this.isLocalStorageAvailable) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error obteniendo desde localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Eliminar dato de localStorage
   */
  removeLocal(key) {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
      return false;
    }
  }

  /**
   * Guardar dato en sessionStorage
   */
  setSession(key, value) {
    if (!this.isSessionStorageAvailable) {
      console.warn('sessionStorage no está disponible');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.error('Error guardando en sessionStorage:', error);
      return false;
    }
  }

  /**
   * Obtener dato desde sessionStorage
   */
  getSession(key, defaultValue = null) {
    if (!this.isSessionStorageAvailable) {
      return defaultValue;
    }

    try {
      const item = sessionStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error obteniendo desde sessionStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Eliminar dato de sessionStorage
   */
  removeSession(key) {
    if (!this.isSessionStorageAvailable) {
      return false;
    }

    try {
      sessionStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Error eliminando de sessionStorage:', error);
      return false;
    }
  }

  /**
   * Guardar dato (localStorage por defecto)
   */
  set(key, value, useSession = false) {
    return useSession ? this.setSession(key, value) : this.setLocal(key, value);
  }

  /**
   * Obtener dato (localStorage por defecto)
   */
  get(key, defaultValue = null, useSession = false) {
    return useSession ? this.getSession(key, defaultValue) : this.getLocal(key, defaultValue);
  }

  /**
   * Eliminar dato (localStorage por defecto)
   */
  remove(key, useSession = false) {
    return useSession ? this.removeSession(key) : this.removeLocal(key);
  }

  /**
   * Limpiar todo el localStorage
   */
  clearLocal() {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }

  /**
   * Limpiar todo el sessionStorage
   */
  clearSession() {
    if (!this.isSessionStorageAvailable) {
      return false;
    }

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error limpiando sessionStorage:', error);
      return false;
    }
  }

  /**
   * Limpiar todo (localStorage y sessionStorage)
   */
  clear() {
    this.clearLocal();
    this.clearSession();
  }

  /**
   * Obtener todas las claves del localStorage
   */
  getLocalKeys() {
    if (!this.isLocalStorageAvailable) {
      return [];
    }

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error obteniendo claves de localStorage:', error);
      return [];
    }
  }

  /**
   * Obtener todas las claves del sessionStorage
   */
  getSessionKeys() {
    if (!this.isSessionStorageAvailable) {
      return [];
    }

    try {
      const keys = Object.keys(sessionStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error obteniendo claves de sessionStorage:', error);
      return [];
    }
  }

  /**
   * Obtener tamaño usado en localStorage (en bytes)
   */
  getLocalStorageSize() {
    if (!this.isLocalStorageAvailable) {
      return 0;
    }

    try {
      let total = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          total += localStorage[key].length + key.length;
        }
      });
      return total;
    } catch (error) {
      console.error('Error calculando tamaño de localStorage:', error);
      return 0;
    }
  }

  /**
   * Obtener tamaño usado en sessionStorage (en bytes)
   */
  getSessionStorageSize() {
    if (!this.isSessionStorageAvailable) {
      return 0;
    }

    try {
      let total = 0;
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          total += sessionStorage[key].length + key.length;
        }
      });
      return total;
    } catch (error) {
      console.error('Error calculando tamaño de sessionStorage:', error);
      return 0;
    }
  }

  /**
   * Verificar si existe una clave
   */
  exists(key, useSession = false) {
    return useSession ? 
      this.getSession(key) !== null : 
      this.getLocal(key) !== null;
  }

  /**
   * Guardar configuración de la aplicación
   */
  saveSettings(settings) {
    return this.setLocal('settings', settings);
  }

  /**
   * Obtener configuración de la aplicación
   */
  getSettings(defaultSettings = {}) {
    return this.getLocal('settings', defaultSettings);
  }

  /**
   * Guardar tema seleccionado
   */
  saveTheme(theme) {
    return this.setLocal('theme', theme);
  }

  /**
   * Obtener tema seleccionado
   */
  getTheme(defaultTheme = 'light') {
    return this.getLocal('theme', defaultTheme);
  }

  /**
   * Guardar preferencia de idioma
   */
  saveLanguage(language) {
    return this.setLocal('language', language);
  }

  /**
   * Obtener preferencia de idioma
   */
  getLanguage(defaultLanguage = 'es') {
    return this.getLocal('language', defaultLanguage);
  }

  /**
   * Guardar estado de sidebar (colapsado/expandido)
   */
  saveSidebarState(collapsed) {
    return this.setLocal('sidebarCollapsed', collapsed);
  }

  /**
   * Obtener estado de sidebar
   */
  getSidebarState() {
    return this.getLocal('sidebarCollapsed', false);
  }

  /**
   * Guardar página de inicio preferida
   */
  saveHomePage(page) {
    return this.setLocal('homePage', page);
  }

  /**
   * Obtener página de inicio preferida
   */
  getHomePage(defaultPage = '/dashboard.html') {
    return this.getLocal('homePage', defaultPage);
  }

  /**
   * Guardar datos del formulario temporalmente (autoguardado)
   */
  saveFormData(formId, formData) {
    return this.setSession(`form_${formId}`, formData);
  }

  /**
   * Obtener datos del formulario temporal
   */
  getFormData(formId, defaultData = {}) {
    return this.getSession(`form_${formId}`, defaultData);
  }

  /**
   * Limpiar datos del formulario temporal
   */
  clearFormData(formId) {
    return this.removeSession(`form_${formId}`);
  }

  /**
   * Guardar items del carrito (temporal)
   */
  saveCartItems(items) {
    return this.setSession('cartItems', items);
  }

  /**
   * Obtener items del carrito
   */
  getCartItems() {
    return this.getSession('cartItems', []);
  }

  /**
   * Limpiar carrito
   */
  clearCartItems() {
    return this.removeSession('cartItems');
  }

  /**
   * Guardar último acceso (para seguridad)
   */
  saveLastAccess() {
    return this.setLocal('lastAccess', new Date().toISOString());
  }

  /**
   * Obtener último acceso
   */
  getLastAccess() {
    return this.getLocal('lastAccess');
  }

  /**
   * Limpiar datos sensibles al cerrar sesión
   */
  clearSensitiveData() {
    // Mantener configuraciones no sensibles
    const settings = this.getSettings();
    const theme = this.getTheme();
    const language = this.getLanguage();
    const sidebarState = this.getSidebarState();
    
    // Limpiar todo
    this.clear();
    
    // Restaurar configuraciones no sensibles
    if (Object.keys(settings).length > 0) {
      this.saveSettings(settings);
    }
    if (theme !== 'light') {
      this.saveTheme(theme);
    }
    if (language !== 'es') {
      this.saveLanguage(language);
    }
    if (sidebarState) {
      this.saveSidebarState(sidebarState);
    }
  }

  /**
   * Exportar todos los datos (para backup)
   */
  exportData() {
    const data = {
      local: {},
      session: {},
      timestamp: new Date().toISOString()
    };

    // Exportar localStorage
    this.getLocalKeys().forEach(key => {
      data.local[key] = this.getLocal(key);
    });

    // Exportar sessionStorage
    this.getSessionKeys().forEach(key => {
      data.session[key] = this.getSession(key);
    });

    return data;
  }

  /**
   * Importar datos (desde backup)
   */
  importData(data, override = false) {
    if (!data || typeof data !== 'object') {
      console.error('Datos de importación inválidos');
      return false;
    }

    try {
      // Importar localStorage
      if (data.local) {
        Object.keys(data.local).forEach(key => {
          if (override || !this.exists(key)) {
            this.setLocal(key, data.local[key]);
          }
        });
      }

      // Importar sessionStorage
      if (data.session) {
        Object.keys(data.session).forEach(key => {
          if (override || !this.exists(key, true)) {
            this.setSession(key, data.session[key]);
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error importando datos:', error);
      return false;
    }
  }
}

// Instancia global del gestor de almacenamiento
const storage = new StorageManager();

// Métodos estáticos para compatibilidad
const Storage = {
  // Métodos genéricos principales
  set: (key, value, useSession = false) => storage.set(key, value, useSession),
  get: (key, defaultValue = null, useSession = false) => storage.get(key, defaultValue, useSession),
  remove: (key, useSession = false) => storage.remove(key, useSession),
  clear: () => storage.clear(),
  exists: (key, useSession = false) => storage.exists(key, useSession),
  
  // Métodos específicos de localStorage/sessionStorage
  setLocal: (key, value) => storage.setLocal(key, value),
  getLocal: (key, defaultValue = null) => storage.getLocal(key, defaultValue),
  removeLocal: (key) => storage.removeLocal(key),
  setSession: (key, value) => storage.setSession(key, value),
  getSession: (key, defaultValue = null) => storage.getSession(key, defaultValue),
  removeSession: (key) => storage.removeSession(key),
  
  // Métodos específicos
  saveSettings: (settings) => storage.saveSettings(settings),
  getSettings: (defaultSettings) => storage.getSettings(defaultSettings),
  saveTheme: (theme) => storage.saveTheme(theme),
  getTheme: (defaultTheme) => storage.getTheme(defaultTheme),
  saveLanguage: (language) => storage.saveLanguage(language),
  getLanguage: (defaultLanguage) => storage.getLanguage(defaultLanguage),
  saveSidebarState: (collapsed) => storage.saveSidebarState(collapsed),
  getSidebarState: () => storage.getSidebarState(),
  clearSensitiveData: () => storage.clearSensitiveData()
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, storage, Storage };
}