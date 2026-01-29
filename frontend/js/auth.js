/**
 * Authentication Module
 * Handles login, logout, token management, and route protection
 */

/**
 * Login function
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Resolves on successful login
 */
async function login(email, password) {
    try {
        const response = await axios.post(`${API_BASE_URL}/token/`, {
            correo_electronico: email,
            password: password
        });

        // Store tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Store user email for display
        localStorage.setItem('user_email', email);

        // --- PRE-CARGA DE PERFIL ---
        // Descargamos el rol inmediatamente para evitar el error de "No Autorizado" al redirigir
        try {
            const profileResponse = await axios.get(`${API_BASE_URL}/perfil/`, {
                headers: { 'Authorization': `Bearer ${response.data.access}` }
            });
            const userData = profileResponse.data;
            if (userData.numero_rol) localStorage.setItem('user_numero_rol', userData.numero_rol);
            if (userData.nombre_apellido) localStorage.setItem('user_name', userData.nombre_apellido);
            if (userData.nombre_rol) localStorage.setItem('user_role', userData.nombre_rol);
            if (userData.nombre_sucursal) localStorage.setItem('user_sucursal', userData.nombre_sucursal);
        } catch (e) {
            console.error("Error al pre-cargar perfil tras login:", e);
        }
        // ---------------------------

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error('Credenciales incorrectas');
        } else if (error.response && error.response.data) {
            throw new Error(error.response.data.detail || 'Error al iniciar sesión');
        } else {
            throw new Error('Error de conexión con el servidor');
        }
    }
}

/**
 * Logout function
 * Clears tokens and redirects to login
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    window.location.href = 'index.html';
}

/**
 * Get access token
 * @returns {string|null} - Access token or null
 */
function getToken() {
    return localStorage.getItem('access_token');
}

/**
 * Get refresh token
 * @returns {string|null} - Refresh token or null
 */
function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
function isAuthenticated() {
    return getToken() !== null;
}

/**
 * Get current user email
 * @returns {string|null} - User email or null
 */
function getCurrentUserEmail() {
    return localStorage.getItem('user_email');
}

/**
 * Refresh access token
 * @returns {Promise} - New access token
 */
async function refreshAccessToken() {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
        });

        localStorage.setItem('access_token', response.data.access);
        return response.data.access;
    } catch (error) {
        // If refresh fails, logout user
        logout();
        throw error;
    }
}

/**
 * Check authentication and protect route
 * Call this function on every protected page
 */
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Verificar permisos de rol para la página actual si roles_vistas.js está cargado
    if (typeof protectCurrentPage === 'function') {
        protectCurrentPage();
    }
}

/**
 * Initialize auth check on protected pages
 * Add this script to all protected HTML pages
 */
if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('/index.html')) {
    // Only check auth if not on login page
    const isLoginPage = window.location.pathname.includes('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/frontend/');

    if (!isLoginPage) {
        checkAuth();
    }
}

