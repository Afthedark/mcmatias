/**
 * API Configuration and Axios Instance
 * Handles all HTTP requests to Django backend with JWT authentication
 */

// Base URL for API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
 * Handles common errors (401, 403, etc.)
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;

            // Unauthorized - token expired or invalid
            if (status === 401) {
                // Clear tokens
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // Redirect to login if not already there
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
            }

            // Forbidden - no permission
            else if (status === 403) {
                window.location.href = 'unauthorized.html';
            }

            // Server error
            else if (status >= 500) {
                console.error('Server error:', error.response.data);
                showToast('Error del servidor. Por favor intenta más tarde.', 'danger');
            }
        } else if (error.request) {
            // Request made but no response
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
