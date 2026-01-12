/**
 * Inventario Page Logic
 * CRUD operations for inventory management per branch
 */

let inventarios = [];
let productos = [];
let sucursales = [];
let currentInventarioId = null;
let currentPage = 1;
let totalPages = 1;

/**
 * Load inventory with pagination
 */
async function loadInventario(page = 1) {
    try {
        showLoader();
        const data = await apiGet(`/inventario/?page=${page}`);

        inventarios = data.results || data;
        currentPage = page;

        // Calculate pagination if using DRF pagination
        if (data.count) {
            totalPages = Math.ceil(data.count / 10); // 10 items per page
        } else {
            totalPages = 1;
        }

        renderInventarioTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading inventory:', error);
        showToast('Error al cargar inventario', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Load initial products for searchable dropdown (Server-Side)
 */
let productSearchDebounceTimer = null;

async function loadProductos() {
    try {
        // Load only 10 initial products
        const data = await apiGet('/productos/?page_size=10');
        const prods = data.results || data;

        renderProductosList(prods);
        setupProductoSearch();

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

/**
 * Search products on server (Server-Side Search)
 */
async function searchProductosServer(term) {
    try {
        let url = '/productos/';
        if (term && term.trim() !== '') {
            url += `?search=${encodeURIComponent(term)}`;
        } else {
            url += '?page_size=10'; // Show only 10 when no search term
        }

        const data = await apiGet(url);
        const prods = data.results || data;
        renderProductosList(prods);

    } catch (error) {
        console.error('Error searching products:', error);
        renderProductosList([]);
    }
}

/**
 * Render products list in dropdown
 */
function renderProductosList(items) {
    const listContainer = document.getElementById('listaProductos');

    if (!items || items.length === 0) {
        listContainer.innerHTML = '<div class="p-2 text-muted text-center small">No se encontraron productos</div>';
        return;
    }

    listContainer.innerHTML = items.map(prod => `
        <li>
            <a class="dropdown-item" href="#" onclick="selectProducto(${prod.id_producto}, '${prod.nombre_producto.replace(/'/g, "\\'")}', event)">
                ${prod.nombre_producto}
            </a>
        </li>
    `).join('');
}

/**
 * Handle product selection
 */
function selectProducto(id, name, event) {
    if (event) event.preventDefault();

    document.getElementById('idProducto').value = id;
    document.querySelector('#btnSelectProducto span').textContent = name;

    // Validar manualmente porque es un hidden input
    document.getElementById('idProducto').classList.remove('is-invalid');
    document.getElementById('btnSelectProducto').classList.remove('is-invalid');
    document.getElementById('btnSelectProducto').classList.remove('border-danger');

    // Close dropdown after selection
    const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('btnSelectProducto'));
    if (dropdown) dropdown.hide();
}

/**
 * Setup product search listener with debounce (Server-Side)
 */
function setupProductoSearch() {
    const searchInput = document.getElementById('busquedaProducto');

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();

        // Debounce: wait 300ms after user stops typing
        clearTimeout(productSearchDebounceTimer);
        productSearchDebounceTimer = setTimeout(() => {
            searchProductosServer(term);
        }, 300);
    });

    // Prevent dropdown closing when clicking input
    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // Prevent dropdown closing when typing
    searchInput.addEventListener('keydown', (e) => e.stopPropagation());
}

/**
 * Load branches for select dropdown with RBAC logic
 */
let currentUserRole = null;
let currentUserSucursalId = null;

async function loadSucursales() {
    try {
        // 1. Get User Profile first to know role and sucursal
        try {
            const userProfile = await apiGet('/perfil/');
            currentUserRole = userProfile.numero_rol;

            // Handle id_sucursal whether it's an object (nested) or ID (PK)
            if (userProfile.id_sucursal && typeof userProfile.id_sucursal === 'object') {
                currentUserSucursalId = userProfile.id_sucursal.id_sucursal;
            } else {
                currentUserSucursalId = userProfile.id_sucursal;
            }

        } catch (err) {
            console.error('Error fetching user profile for RBAC:', err);
        }

        const data = await apiGet('/sucursales/');
        sucursales = data.results || data;

        const select = document.getElementById('idSucursal');
        select.innerHTML = '<option value="">Seleccione sucursal...</option>';
        sucursales.forEach(suc => {
            if (suc.activo) {
                select.innerHTML += `<option value="${suc.id_sucursal}">${suc.nombre}</option>`;
            }
        });

    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

/**
 * Render inventory table
 */
function renderInventarioTable() {
    const tbody = document.getElementById('inventarioTable');

    if (inventarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay registros de inventario</td></tr>';
        return;
    }

    tbody.innerHTML = inventarios.map(inv => `
        <tr>
            <td>${inv.nombre_producto}</td>
            <td>${inv.nombre_sucursal}</td>
            <td><span class="badge bg-primary">${inv.cantidad}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="openEditModal(${inv.id_inventario})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventario(${inv.id_inventario})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
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
        <nav aria-label="Inventory pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadInventario(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadInventario(${currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

/**
 * Open create modal with RBAC enforcement
 */
function openCreateModal() {
    currentInventarioId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Registro de Inventario';
    const form = document.getElementById('inventarioForm');
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('inventarioId').value = '';

    // Reset product dropdown
    document.getElementById('idProducto').value = '';
    document.querySelector('#btnSelectProducto span').textContent = 'Seleccione producto...';
    document.getElementById('busquedaProducto').value = '';
    searchProductosServer(''); // Reload initial products

    const sucursalSelect = document.getElementById('idSucursal');

    // RBAC: Handle Sucursal Selection
    if (currentUserRole !== 1 && currentUserSucursalId) {
        // If NOT Super Admin, force their sucursal and disable
        sucursalSelect.value = currentUserSucursalId;
        sucursalSelect.disabled = true;
    } else {
        // Super Admin: Ensure it's enabled and empty (or default)
        sucursalSelect.value = '';
        sucursalSelect.disabled = false;
    }

    const modal = new bootstrap.Modal(document.getElementById('inventarioModal'));
    modal.show();
}

/**
 * Open edit modal with RBAC enforcement
 */
async function openEditModal(id) {
    currentInventarioId = id;
    document.getElementById('modalTitle').textContent = 'Editar Inventario';

    try {
        const inventario = await apiGet(`/inventario/${id}/`);

        document.getElementById('inventarioId').value = inventario.id_inventario;
        document.getElementById('cantidad').value = inventario.cantidad;

        // Set product in dropdown (using name from backend)
        document.getElementById('idProducto').value = inventario.id_producto;
        if (inventario.nombre_producto) {
            document.querySelector('#btnSelectProducto span').textContent = inventario.nombre_producto;
        }

        // Set sucursal
        document.getElementById('idSucursal').value = inventario.id_sucursal;

        // RBAC Logic for Edit Mode
        const sucursalSelect = document.getElementById('idSucursal');

        if (currentUserRole === 1) {
            // Super Admin CAN change sucursal if needed (fixing errors)
            sucursalSelect.disabled = false;
        } else {
            // Others CANNOT change sucursal
            sucursalSelect.disabled = true;
        }

        const modal = new bootstrap.Modal(document.getElementById('inventarioModal'));
        modal.show();
    } catch (error) {
        showToast('Error al cargar registro de inventario', 'danger');
    }
}

/**
 * Save inventory record (create or update)
 */
async function saveInventario() {
    const form = document.getElementById('inventarioForm');

    // Check validity manually if fields are disabled (browser might skip them)
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    // Manually construct payload because disabled inputs might be problematic
    const payload = {
        id_producto: parseInt(document.getElementById('idProducto').value),
        id_sucursal: parseInt(document.getElementById('idSucursal').value),
        cantidad: parseInt(document.getElementById('cantidad').value)
    };

    // Double check sucursal for non-superadmin just in case (frontend safety)
    if (currentUserRole !== 1 && currentUserSucursalId) {
        // Ensure we send THEIR sucursal even if they somehow hacked the DOM
        payload.id_sucursal = currentUserSucursalId;
    }

    try {
        showLoader();

        if (currentInventarioId) {
            // Update using PATCH
            await apiPatch(`/inventario/${currentInventarioId}/`, payload);
            showToast('Inventario actualizado correctamente', 'success');
        } else {
            // Create using POST
            await apiPost('/inventario/', payload);
            showToast('Registro de inventario creado correctamente', 'success');
        }

        // Close modal
        const modalElement = document.getElementById('inventarioModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        // Re-enable selects for next use (cleanup)
        document.getElementById('idProducto').disabled = false;
        document.getElementById('idSucursal').disabled = false;

        // Reload table
        await loadInventario(currentPage);

    } catch (error) {
        console.error('Error saving inventory:', error);
        showToast('Error al guardar registro de inventario', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Delete inventory record
 */
async function deleteInventario(id) {
    if (!confirmDelete('¿Estás seguro de eliminar este registro de inventario?')) {
        return;
    }

    try {
        showLoader();
        await apiDelete(`/inventario/${id}/`);
        showToast('Registro de inventario eliminado correctamente', 'success');

        // Reload current page or go back if it's empty
        const newCount = inventarios.length - 1;
        if (newCount === 0 && currentPage > 1) {
            await loadInventario(currentPage - 1);
        } else {
            await loadInventario(currentPage);
        }
    } catch (error) {
        console.error('Error deleting inventory:', error);
        showToast('Error al eliminar registro de inventario', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Reset modal when closed
 */
document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('inventarioModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            document.getElementById('idProducto').disabled = false;
            document.getElementById('idSucursal').disabled = false;
            document.getElementById('inventarioForm').classList.remove('was-validated');
        });
    }
});
