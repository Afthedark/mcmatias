/**
 * API Configuration and Axios Instance
 * Handles all HTTP requests to Django backend with JWT authentication
 */

// --- CONFIGURACIÓN DE URL DEL BACKEND ---
// Descomenta la URL que desees usar según el entorno:

// 1. DESARROLLO LOCAL
// const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 2. PRODUCCIÓN / PROXY NETLIFY (Usa esta para desplegar en Netlify)
const API_BASE_URL = '/api'; 

// 3. VPS DIRECTO (Solo si no usas HTTPS en el frontend)
// const API_BASE_URL = 'http://167.86.66.229:8000/api';
// ----------------------------------------

// Create Axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles 401 errors with automatic token refresh
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si es 401 y NO es un retry, intentar refrescar el token
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Si ya estamos refrescando, encolar esta petición
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            // Si no hay refresh token, ir a login
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
                return Promise.reject(error);
            }

            try {
                // Intentar refrescar el token
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);

                // Actualizar header de la petición original
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Procesar cola de peticiones pendientes
                processQueue(null, newAccessToken);

                console.log('🔄 Access token refrescado automáticamente');

                // Reintentar la petición original
                return api(originalRequest);

            } catch (refreshError) {
                // El refresh token también expiró - ahora sí, cerrar sesión
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                console.log('⏰ Sesión expirada - Refresh token inválido');
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Forbidden - no permission
        if (error.response?.status === 403) {
            // Evitar redirección si estamos en el index o si el error viene de cargar el perfil inicial
            const isInitialLoad = originalRequest.url.includes('/perfil/');
            const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
            
            if (!isInitialLoad && !isLoginPage) {
                window.location.href = 'unauthorized.html';
            }
        }

        // Server error
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response.data);
            showToast('Error del servidor. Por favor intenta más tarde.', 'danger');
        }

        // Network error
        if (!error.response && error.request) {
            console.error('Network error:', error.request);
            showToast('Error de conexión. Verifica tu conexión a internet.', 'danger');
        }

        return Promise.reject(error);
    }
);

/**
 * API Helper Functions
 */

// GET request
async function apiGet(endpoint) {
    try {
        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// POST request
async function apiPost(endpoint, data) {
    try {
        const response = await api.post(endpoint, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// PUT request
async function apiPut(endpoint, data) {
    try {
        const response = await api.put(endpoint, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// PATCH request
async function apiPatch(endpoint, data) {
    try {
        const response = await api.patch(endpoint, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// DELETE request
async function apiDelete(endpoint) {
    try {
        const response = await api.delete(endpoint);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// POST with FormData (for file uploads)
async function apiPostFormData(endpoint, formData) {
    try {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// PUT with FormData
async function apiPutFormData(endpoint, formData) {
    try {
        const response = await api.put(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// PATCH with FormData
async function apiPatchFormData(endpoint, formData) {
    try {
        const response = await api.patch(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
