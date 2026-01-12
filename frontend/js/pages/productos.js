/**
 * Productos Page Logic
 * CRUD operations for products with pagination
 */

let productos = [];
let currentProductoId = null;
let currentPage = 1;
let totalPages = 1;

/**
 * Load products with pagination
 */
async function loadProductos(page = 1) {
    try {
        showLoader();
        const data = await apiGet(`/productos/?page=${page}`);

        productos = data.results || data;
        currentPage = page;

        // Calculate pagination if using DRF pagination
        if (data.count) {
            totalPages = Math.ceil(data.count / 10); // 10 items per page
        } else {
            totalPages = 1;
        }

        renderProductosTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error al cargar productos', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Load initial categories for searchable dropdown (Server-Side)
 */
let searchDebounceTimer = null;

async function loadCategorias() {
    try {
        // Load only 3 initial categories of type 'producto'
        const data = await apiGet('/categorias/?tipo=producto&page_size=3');
        const cats = data.results || data;

        renderCategoriasList(cats);
        setupCategoriaSearch();

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Search categories on server (Server-Side Search)
 */
async function searchCategoriasServer(term) {
    try {
        let url = '/categorias/?tipo=producto';
        if (term && term.trim() !== '') {
            url += `&search=${encodeURIComponent(term)}`;
        } else {
            url += '&page_size=3'; // Show only 3 when no search term
        }

        const data = await apiGet(url);
        const cats = data.results || data;
        renderCategoriasList(cats);

    } catch (error) {
        console.error('Error searching categories:', error);
        renderCategoriasList([]);
    }
}

/**
 * Render categories list in dropdown
 */
function renderCategoriasList(items) {
    const listContainer = document.getElementById('listaCategorias');

    if (!items || items.length === 0) {
        listContainer.innerHTML = '<div class="p-2 text-muted text-center small">No se encontraron resultados</div>';
        return;
    }

    listContainer.innerHTML = items.map(cat => `
        <li>
            <a class="dropdown-item" href="#" onclick="selectCategoria(${cat.id_categoria}, '${cat.nombre_categoria.replace(/'/g, "\\'")}', event)">
                ${cat.nombre_categoria}
            </a>
        </li>
    `).join('');
}

/**
 * Handle category selection
 */
function selectCategoria(id, name, event) {
    if (event) event.preventDefault();

    document.getElementById('idCategoria').value = id;
    document.querySelector('#btnSelectCategoria span').textContent = name;

    // Validar manualmente porque es un hidden input
    document.getElementById('idCategoria').classList.remove('is-invalid');
    document.getElementById('btnSelectCategoria').classList.remove('is-invalid');
    document.getElementById('btnSelectCategoria').classList.remove('border-danger');

    // Close dropdown after selection
    const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('btnSelectCategoria'));
    if (dropdown) dropdown.hide();
}

/**
 * Setup search listener with debounce (Server-Side)
 */
function setupCategoriaSearch() {
    const searchInput = document.getElementById('busquedaCategoria');

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();

        // Debounce: wait 300ms after user stops typing
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            searchCategoriasServer(term);
        }, 300);
    });

    // Prevent dropdown closing when clicking input
    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // Prevent dropdown closing when typing
    searchInput.addEventListener('keydown', (e) => e.stopPropagation());
}

/**
 * Render products table
 */
function renderProductosTable() {
    const tbody = document.getElementById('productosTable');

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td><img src="${getImageUrl(producto.foto_producto)}" class="product-img" alt="${producto.nombre_producto}"></td>
            <td>${producto.nombre_producto}</td>
            <td>${producto.nombre_categoria || '-'}</td>
            <td>${producto.codigo_barras || '-'}</td>
            <td>${formatCurrency(producto.precio)}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="openEditModal(${producto.id_producto})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProducto(${producto.id_producto})" title="Eliminar">
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
        <nav aria-label="Products pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadProductos(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadProductos(${currentPage + 1}); return false;">
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
    currentProductoId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('productoForm').reset();
    document.getElementById('productoForm').classList.remove('was-validated');

    // Reset dropdown
    document.getElementById('idCategoria').value = '';
    document.querySelector('#btnSelectCategoria span').textContent = 'Seleccione...';
    document.getElementById('busquedaCategoria').value = '';
    // Reload initial categories from server
    searchCategoriasServer('');

    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}

/**
 * Open edit modal
 */
async function openEditModal(id) {
    currentProductoId = id;
    document.getElementById('modalTitle').textContent = 'Editar Producto';

    try {
        const producto = await apiGet(`/productos/${id}/`);

        document.getElementById('productoId').value = producto.id_producto;
        document.getElementById('nombreProducto').value = producto.nombre_producto;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('codigoBarras').value = producto.codigo_barras || '';

        document.getElementById('precio').value = producto.precio;

        // Set category in dropdown
        document.getElementById('idCategoria').value = producto.id_categoria || '';

        if (producto.id_categoria && producto.nombre_categoria) {
            document.querySelector('#btnSelectCategoria span').textContent = producto.nombre_categoria;
        } else {
            document.querySelector('#btnSelectCategoria span').textContent = 'Seleccione...';
        }

        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        modal.show();
    } catch (error) {
        console.error(error);
        showToast('Error al cargar producto', 'danger');
    }
}

/**
 * Save product (create or update)
 */
async function saveProducto() {
    const form = document.getElementById('productoForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData();
    formData.append('nombre_producto', document.getElementById('nombreProducto').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('codigo_barras', document.getElementById('codigoBarras').value);
    formData.append('id_categoria', document.getElementById('idCategoria').value);
    formData.append('precio', document.getElementById('precio').value);

    const fileInput = document.getElementById('fotoProducto');
    if (fileInput.files.length > 0) {
        formData.append('foto_producto', fileInput.files[0]);
    }

    try {
        showLoader();

        if (currentProductoId) {
            // Update using PATCH
            await apiPatchFormData(`/productos/${currentProductoId}/`, formData);
            showToast('Producto actualizado correctamente', 'success');
        } else {
            // Create using POST
            await apiPostFormData('/productos/', formData);
            showToast('Producto creado correctamente', 'success');
        }

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();

        // Reload table
        await loadProductos(currentPage);

    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error al guardar producto', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Delete product
 */
async function deleteProducto(id) {
    if (!confirmDelete('¿Estás seguro de eliminar este producto?')) {
        return;
    }

    try {
        showLoader();
        await apiDelete(`/productos/${id}/`);
        showToast('Producto eliminado correctamente', 'success');

        // Reload current page or go back if it's empty
        const newCount = productos.length - 1;
        if (newCount === 0 && currentPage > 1) {
            await loadProductos(currentPage - 1);
        } else {
            await loadProductos(currentPage);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error al eliminar producto', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Reset modal when closed
 */
document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('productoModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            document.getElementById('productoForm').classList.remove('was-validated');
        });
    }
});
