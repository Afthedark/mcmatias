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
 * Load products for select dropdown
 */
async function loadProductos() {
    try {
        const data = await apiGet('/productos/?page_size=1000');
        productos = data.results || data;

        const select = document.getElementById('idProducto');
        select.innerHTML = '<option value="">Seleccione producto...</option>';
        productos.forEach(prod => {
            select.innerHTML += `<option value="${prod.id_producto}">${prod.nombre_producto}</option>`;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

/**
 * Load branches for select dropdown
 */
async function loadSucursales() {
    try {
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
            <td>${getProductoName(inv.id_producto)}</td>
            <td>${getSucursalName(inv.id_sucursal)}</td>
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
 * Get product name by ID
 */
function getProductoName(id) {
    const prod = productos.find(p => p.id_producto === id);
    return prod ? prod.nombre_producto : `Producto #${id}`;
}

/**
 * Get branch name by ID
 */
function getSucursalName(id) {
    const suc = sucursales.find(s => s.id_sucursal === id);
    return suc ? suc.nombre : `Sucursal #${id}`;
}

/**
 * Open create modal
 */
function openCreateModal() {
    currentInventarioId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Registro de Inventario';
    document.getElementById('inventarioForm').reset();
    document.getElementById('inventarioId').value = '';

    const modal = new bootstrap.Modal(document.getElementById('inventarioModal'));
    modal.show();
}

/**
 * Open edit modal
 */
async function openEditModal(id) {
    currentInventarioId = id;
    document.getElementById('modalTitle').textContent = 'Editar Inventario';

    try {
        const inventario = await apiGet(`/inventario/${id}/`);

        document.getElementById('inventarioId').value = inventario.id_inventario;
        document.getElementById('idProducto').value = inventario.id_producto;
        document.getElementById('idSucursal').value = inventario.id_sucursal;
        document.getElementById('cantidad').value = inventario.cantidad;

        // Disable product and branch selects when editing (to prevent changing the key)
        document.getElementById('idProducto').disabled = true;
        document.getElementById('idSucursal').disabled = true;

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

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const payload = {
        id_producto: parseInt(document.getElementById('idProducto').value),
        id_sucursal: parseInt(document.getElementById('idSucursal').value),
        cantidad: parseInt(document.getElementById('cantidad').value)
    };

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

        // Re-enable selects for next use
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
