/**
 * Clientes Page Logic
 * CRUD operations for clients with pagination
 */

let clientes = [];
let currentClienteId = null;
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let searchTimeout = null;

/**
 * Load clients with pagination
 */
async function loadClientes(page = 1) {
    try {
        showLoader();

        // Build URL with search parameter if exists
        let url = `/clientes/?page=${page}`;
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const data = await apiGet(url);

        clientes = data.results || data;
        currentPage = page;

        // Calculate pagination
        if (data.count) {
            totalPages = Math.ceil(data.count / 10); // 10 items per page
        } else {
            totalPages = 1;
        }

        renderClientesTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading clients:', error);
        showToast('Error al cargar clientes', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Render clients table
 */
function renderClientesTable() {
    const tbody = document.getElementById('clientesTable');

    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes registrados</td></tr>';
        return;
    }

    const startNumber = (currentPage - 1) * 10 + 1; // 10 items per page

    tbody.innerHTML = clientes.map((cliente, index) => {
        const estadoClass = cliente.activo ? 'success' : 'secondary';
        const estadoTexto = cliente.activo ? 'Activo' : 'Inactivo';
        const rowClass = cliente.activo ? '' : 'table-secondary text-decoration-line-through';

        return `
            <tr class="${rowClass}">
                <td><strong>${startNumber + index}</strong></td>
                <td>${cliente.nombre_apellido || 'N/A'}</td>
                <td>${cliente.cedula_identidad || 'N/A'}</td>
                <td>${cliente.celular || 'N/A'}</td>
                <td>${cliente.correo_electronico || 'N/A'}</td>
                <td><span class="badge bg-${estadoClass}">${estadoTexto}</span></td>
                <td>
                    ${(typeof canPerformAction !== 'function' || canPerformAction('editar_clientes')) ? (cliente.activo ? `
                        <button class="btn btn-sm btn-info me-1" onclick="openEditModal(${cliente.id_cliente})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCliente(${cliente.id_cliente})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="reactivarCliente(${cliente.id_cliente})" title="Reactivar">
                            <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                        </button>
                    `) : ''}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render pagination controls
 */
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <nav aria-label="Clients pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadClientes(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadClientes(${currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

/**
 * Open create modal
 */
function openCreateModal() {
    currentClienteId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Cliente';
    document.getElementById('clienteForm').reset();
    document.getElementById('clienteForm').classList.remove('was-validated');

    const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
    modal.show();
}

/**
 * Open edit modal
 */
async function openEditModal(id) {
    currentClienteId = id;
    document.getElementById('modalTitle').textContent = 'Editar Cliente';

    try {
        const cliente = await apiGet(`/clientes/${id}/`);
        document.getElementById('clienteId').value = cliente.id_cliente;
        document.getElementById('nombreApellido').value = cliente.nombre_apellido;
        document.getElementById('cedulaIdentidad').value = cliente.cedula_identidad || '';
        document.getElementById('celular').value = cliente.celular || '';
        document.getElementById('correoElectronico').value = cliente.correo_electronico || '';
        document.getElementById('direccion').value = cliente.direccion || '';

        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        modal.show();
    } catch (error) {
        showToast('Error al cargar cliente', 'danger');
    }
}

/**
 * Save client (create or update)
 */
async function saveCliente() {
    const form = document.getElementById('clienteForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const data = {
        nombre_apellido: document.getElementById('nombreApellido').value,
        cedula_identidad: document.getElementById('cedulaIdentidad').value,
        celular: document.getElementById('celular').value,
        correo_electronico: document.getElementById('correoElectronico').value,
        direccion: document.getElementById('direccion').value
    };

    try {
        showLoader();

        if (currentClienteId) {
            // Update using PATCH
            await apiPatch(`/clientes/${currentClienteId}/`, data);
            showToast('Cliente actualizado correctamente', 'success');
        } else {
            // Create using POST
            await apiPost('/clientes/', data);
            showToast('Cliente creado correctamente', 'success');
        }

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();

        // Reload table
        await loadClientes(currentPage);

    } catch (error) {
        console.error('Error saving client:', error);
        showToast('Error al guardar cliente', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Delete client (soft delete - marks as inactive)
 */
async function deleteCliente(id) {
    if (!confirmDelete('¿Estás seguro de eliminar este cliente?')) {
        return;
    }

    try {
        showLoader();
        await apiDelete(`/clientes/${id}/`);
        showToast('Cliente eliminado correctamente', 'success');

        // Reload current page
        await loadClientes(currentPage);
    } catch (error) {
        console.error('Error deactivating client:', error);
        showToast('Error al eliminar cliente', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Reactivate an inactive client
 */
async function reactivarCliente(id) {
    if (!confirm('¿Deseas reactivar este cliente?')) {
        return;
    }

    try {
        showLoader();
        await apiPatch(`/clientes/${id}/reactivar/`, {});
        showToast('Cliente reactivado correctamente', 'success');

        await loadClientes(currentPage);
    } catch (error) {
        console.error('Error reactivating client:', error);
        showToast('Error al reactivar cliente', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Initialize search functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchClientes');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value.trim();
                currentPage = 1; // Reset to page 1 on new search
                loadClientes(1);
            }, 300); // 300ms debounce
        });
    }
});
