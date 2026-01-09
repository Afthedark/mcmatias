/**
 * Sucursales Management Module
 * Handles CRUD operations for Sucursales
 */

let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 10;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // initializePage is called in HTML
    loadSucursales();
});

/**
 * Load Sucursales from API with pagination
 * @param {number} page - Page number to load
 */
async function loadSucursales(page = 1) {
    if (page !== currentPage && page !== 1) showLoadingTable(); // Use a lighter loading indicator for pagination if preferred
    else if (page === 1) showLoading();

    try {
        const response = await apiGet(`/sucursales/?page=${page}&page_size=${ITEMS_PER_PAGE}`);

        // Handle DRF pagination response structure
        const results = response.results ? response.results : response;
        const count = response.count ? response.count : results.length;

        totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        currentPage = page;

        renderTable(results);
        renderPagination(count);

    } catch (error) {
        console.error('Error loading sucursales:', error);
        showToast('Error al cargar sucursales', 'error');
        document.querySelector('#sucursalesTableBody').innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Error al cargar datos. Por favor intente nuevamente.
                </td>
            </tr>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * Render Sucursales Table
 * @param {Array} sucursales - List of sucursales
 */
function renderTable(sucursales) {
    const tbody = document.getElementById('sucursalesTableBody');
    if (!sucursales || sucursales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No hay sucursales registradas</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sucursales.map(sucursal => `
        <tr>
            <td>${sucursal.nombre}</td>
            <td>${sucursal.direccion || '<span class="text-muted">Sin dirección</span>'}</td>
            <td>
                 ${sucursal.activo
            ? '<span class="badge bg-success">Activa</span>'
            : '<span class="badge bg-secondary">Inactiva</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEditModal(${sucursal.id_sucursal})"
                        title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="confirmDelete(${sucursal.id_sucursal}, '${sucursal.nombre}')"
                        title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render Pagination Controls
 * @param {number} totalItems - Total number of items
 */
function renderPagination(totalItems) {
    const container = document.getElementById('paginationContainer');
    const infoContainer = document.getElementById('paginationInfo');

    // Update Info Text
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    infoContainer.innerText = `Mostrando ${start} a ${end} de ${totalItems} sucursales`;

    // Generate Pagination Buttons
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadSucursales(${currentPage - 1})">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="loadSucursales(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadSucursales(${currentPage + 1})">Siguiente</a>
        </li>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * Open Modal for Creating or Editing
 * @param {number|null} id - Sucursal ID (null for create)
 */
async function openEditModal(id = null) {
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('sucursalForm');

    form.reset();
    form.classList.remove('was-validated');

    if (id) {
        modalTitle.innerText = 'Editar Sucursal';
        document.getElementById('sucursalId').value = id;

        try {
            const sucursal = await apiGet(`/sucursales/${id}/`);
            document.getElementById('nombreSucursal').value = sucursal.nombre;
            document.getElementById('direccion').value = sucursal.direccion || '';
            document.getElementById('activo').checked = sucursal.activo;
        } catch (error) {
            console.error('Error fetching sucursal details:', error);
            showToast('Error al cargar datos de la sucursal', 'error');
            return;
        }

    } else {
        modalTitle.innerText = 'Nueva Sucursal';
        document.getElementById('sucursalId').value = '';
        document.getElementById('activo').checked = true; // Default active
    }

    const modal = new bootstrap.Modal(document.getElementById('sucursalModal'));
    modal.show();
}

/**
 * Save Sucursal (Create or Update)
 */
async function saveSucursal() {
    const form = document.getElementById('sucursalForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('sucursalId').value;
    const data = {
        nombre: document.getElementById('nombreSucursal').value,
        direccion: document.getElementById('direccion').value,
        activo: document.getElementById('activo').checked
    };

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerText;
    btnSave.disabled = true;
    btnSave.innerText = 'Guardando...';

    try {
        if (id) {
            // Update (PATCH)
            await apiPatch(`/sucursales/${id}/`, data);
            showToast('Sucursal actualizada correctamente');
        } else {
            // Create (POST)
            await apiPost('/sucursales/', data);
            showToast('Sucursal creada correctamente');
        }

        // Close modal and reload
        const modalElement = document.getElementById('sucursalModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        loadSucursales(currentPage);

    } catch (error) {
        console.error('Error saving sucursal:', error);
        showToast('Error al guardar la sucursal', 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = originalText;
    }
}

/**
 * Confirm Delete
 * @param {number} id - Sucursal ID
 * @param {string} name - Sucursal Name
 */
function confirmDelete(id, name) {
    if (confirm(`¿Está seguro que desea eliminar la sucursal "${name}"?`)) {
        deleteSucursal(id);
    }
}

/**
 * Execute Delete
 * @param {number} id - Sucursal ID
 */
async function deleteSucursal(id) {
    try {
        await apiDelete(`/sucursales/${id}/`);
        showToast('Sucursal eliminada correctamente');
        loadSucursales(currentPage);
    } catch (error) {
        console.error('Error deleting sucursal:', error);
        showToast('Error al eliminar. Verifique que no tenga dependencias.', 'error');
    }
}

/**
 * Helpers for loading state
 */
function showLoading() {
    document.getElementById('sucursalesTableBody').innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </td>
        </tr>
    `;
}

function showLoadingTable() {
    // Optional: lighter loading state
}

function hideLoading() {
    // Nothing needed, table render overwrites
}
