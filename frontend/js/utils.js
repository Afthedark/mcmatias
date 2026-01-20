/**
 * Utility Functions
 * Reusable helper functions for the application
 */

/**
 * Format date from ISO string to DD/MM/YYYY
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format date and time
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date and time
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const formattedDate = formatDate(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${formattedDate} ${hours}:${minutes}`;
}

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: 'Bs')
 * @returns {string} - Formatted currency
 */
function formatCurrency(amount, currency = 'Bs') {
    if (amount === null || amount === undefined) return `${currency} 0.00`;
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
}

/**
 * Show loading spinner overlay
 */
function showLoader() {
    let loader = document.getElementById('spinner-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'spinner-overlay';
        loader.className = 'spinner-overlay';
        loader.innerHTML = '<div class="spinner-border text-light"></div>';
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

/**
 * Hide loading spinner
 */
function hideLoader() {
    const loader = document.getElementById('spinner-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Show toast notification using Bootstrap Toast
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'danger', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    // Create toast container if doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const bgClass = `bg-${type}`;
    const iconClass = type === 'success' ? 'bi-check-circle' :
        type === 'danger' ? 'bi-exclamation-triangle' :
            type === 'warning' ? 'bi-exclamation-circle' :
                'bi-info-circle';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${iconClass} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();

    // Remove toast after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @returns {boolean} - True if confirmed
 */
function confirmDelete(message = '¿Estás seguro de que deseas eliminar este elemento?') {
    return confirm(message);
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} - Truncated text
 */
function truncateText(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Get image URL or placeholder
 * @param {string} imagePath - Image path from API
 * @returns {string} - Full image URL or placeholder
 */
function getImageUrl(imagePath) {
    if (!imagePath) {
        return 'https://via.placeholder.com/150?text=Sin+Imagen';
    }
    // If path starts with http, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    // Otherwise, prepend backend URL
    return `http://127.0.0.1:8000${imagePath}`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
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
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Generate random ID
 * @returns {string} - Random ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

