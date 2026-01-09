/**
 * Roles Management Module
 * Handles CRUD operations for User Roles
 */

let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 10;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Already initialized in roles.html via initializePage('roles.html')
    // We just need to load data
    loadRoles();
});

/**
 * Load Roles from API with pagination
 * @param {number} page - Page number to load
 */
async function loadRoles(page = 1) {
    showLoading();
    try {
        // Calculate offset and limit for manual pagination simulation
        // Since DRF default pagination might be different, we'll handle standard DRF pagination
        // Or if backend doesn't paginate, we simulate it here.
        // Assuming StandardPagination from previous context (limit/offset or page_size)

        const response = await apiGet(`/roles/?page=${page}&page_size=${ITEMS_PER_PAGE}`);

        // Handle DRF pagination response structure
        const results = response.results ? response.results : response;
        const count = response.count ? response.count : results.length;

        // Calculate total pages
        totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        currentPage = page;

        renderTable(results);
        renderPagination(count);

    } catch (error) {
        console.error('Error loading roles:', error);
        // showToast is defined in utils.js
        showToast('Error al cargar roles', 'error');
        document.querySelector('#rolesTableBody').innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Error al cargar datos. Por favor intente nuevamente.
                </td>
            </tr>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * Render Roles Table
 * @param {Array} roles - List of roles
 */
function renderTable(roles) {
    const tbody = document.getElementById('rolesTableBody');
    if (!roles || roles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">No hay roles registrados</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = roles.map(rol => `
        <tr>
            <td>${rol.id_rol}</td>
            <td>${rol.nombre_rol}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEditModal(${rol.id_rol}, '${rol.nombre_rol}')"
                        title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="confirmDelete(${rol.id_rol}, '${rol.nombre_rol}')"
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
    infoContainer.innerText = `Mostrando ${start} a ${end} de ${totalItems} roles`;

    // Generate Pagination Buttons
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadRoles(${currentPage - 1})">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="loadRoles(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadRoles(${currentPage + 1})">Siguiente</a>
        </li>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * Open Modal for Creating or Editing
 * @param {number|null} id - Rol ID (null for create)
 * @param {string|null} name - Rol Name (null for create)
 */
function openEditModal(id = null, name = null) {
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('rolForm');
    const idInput = document.getElementById('rolId');
    const nameInput = document.getElementById('nombreRol');

    form.reset();
    form.classList.remove('was-validated');

    if (id) {
        modalTitle.innerText = 'Editar Rol';
        idInput.value = id;
        nameInput.value = name;
    } else {
        modalTitle.innerText = 'Nuevo Rol';
        idInput.value = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('rolModal'));
    modal.show();
}

/**
 * Save Rol (Create or Update)
 */
async function saveRol() {
    const form = document.getElementById('rolForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('rolId').value;
    const name = document.getElementById('nombreRol').value;
    const data = { nombre_rol: name };

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerText;
    btnSave.disabled = true;
    btnSave.innerText = 'Guardando...';

    try {
        if (id) {
            // Update (PATCH)
            await apiPatch(`/roles/${id}/`, data);
            showToast('Rol actualizado correctamente');
        } else {
            // Create (POST)
            await apiPost('/roles/', data);
            showToast('Rol creado correctamente');
        }

        // Close modal and reload
        const modalElement = document.getElementById('rolModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        loadRoles(currentPage);

    } catch (error) {
        console.error('Error saving rol:', error);
        showToast('Error al guardar el rol', 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = originalText;
    }
}

/**
 * Confirm Delete
 * @param {number} id - Rol ID
 * @param {string} name - Rol Name
 */
function confirmDelete(id, name) {
    if (confirm(`¿Está seguro que desea eliminar el rol "${name}"?`)) {
        deleteRol(id);
    }
}

/**
 * Execute Delete
 * @param {number} id - Rol ID
 */
async function deleteRol(id) {
    try {
        await apiDelete(`/roles/${id}/`);
        showToast('Rol eliminado correctamente');
        loadRoles(currentPage);
    } catch (error) {
        console.error('Error deleting rol:', error);
        showToast('Error al eliminar. Verifique que no tenga usuarios asignados.', 'error');
    }
}

/**
 * Helpers for loading state
 */
function showLoading() {
    document.getElementById('rolesTableBody').innerHTML = `
        <tr>
            <td colspan="3" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </td>
        </tr>
    `;
}

function hideLoading() {
    // Nothing needed, table render overwrites
}
