/**
 * Categorias Page Logic - Dual Table Implementation
 * Manages two independent tables: Productos and Servicios
 */

// State for Productos
const productosState = {
    data: [],
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    searchTimeout: null
};

// State for Servicios
const serviciosState = {
    data: [],
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    searchTimeout: null
};

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup search for Productos
    const searchProductos = document.getElementById('searchProductos');
    if (searchProductos) {
        searchProductos.addEventListener('input', (e) => {
            clearTimeout(productosState.searchTimeout);
            productosState.searchTimeout = setTimeout(() => {
                productosState.searchQuery = e.target.value.trim();
                productosState.currentPage = 1;
                loadProductos();
            }, 300);
        });
    }

    // Setup search for Servicios
    const searchServicios = document.getElementById('searchServicios');
    if (searchServicios) {
        searchServicios.addEventListener('input', (e) => {
            clearTimeout(serviciosState.searchTimeout);
            serviciosState.searchTimeout = setTimeout(() => {
                serviciosState.searchQuery = e.target.value.trim();
                serviciosState.currentPage = 1;
                loadServicios();
            }, 300);
        });
    }

    // Initial load
    loadProductos();
    loadServicios();
});

/**
 * Load Productos categories
 */
async function loadProductos(page = null) {
    if (page) productosState.currentPage = page;

    try {
        let url = `/categorias/?tipo=producto&page=${productosState.currentPage}`;
        if (productosState.searchQuery) {
            url += `&search=${encodeURIComponent(productosState.searchQuery)}`;
        }

        const data = await apiGet(url);
        productosState.data = data.results || data;

        if (data.count) {
            productosState.totalPages = Math.ceil(data.count / 10);
        } else {
            productosState.totalPages = 1;
        }

        renderTableProductos();
        renderPaginationProductos();

    } catch (error) {
        console.error('Error loading productos:', error);
        document.getElementById('tableProductos').innerHTML =
            '<tr><td colspan="2" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

/**
 * Load Servicios categories
 */
async function loadServicios(page = null) {
    if (page) serviciosState.currentPage = page;

    try {
        let url = `/categorias/?tipo=servicio&page=${serviciosState.currentPage}`;
        if (serviciosState.searchQuery) {
            url += `&search=${encodeURIComponent(serviciosState.searchQuery)}`;
        }

        const data = await apiGet(url);
        serviciosState.data = data.results || data;

        if (data.count) {
            serviciosState.totalPages = Math.ceil(data.count / 10);
        } else {
            serviciosState.totalPages = 1;
        }

        renderTableServicios();
        renderPaginationServicios();

    } catch (error) {
        console.error('Error loading servicios:', error);
        document.getElementById('tableServicios').innerHTML =
            '<tr><td colspan="2" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

/**
 * Render Productos table
 */
function renderTableProductos() {
    const tbody = document.getElementById('tableProductos');

    if (productosState.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No hay categorías de productos</td></tr>';
        return;
    }

    tbody.innerHTML = productosState.data.map(item => `
        <tr>
            <td>${item.nombre_categoria}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="openEditModal(${item.id_categoria}, 'producto')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategoria(${item.id_categoria}, 'producto')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render Servicios table
 */
function renderTableServicios() {
    const tbody = document.getElementById('tableServicios');

    if (serviciosState.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No hay categorías de servicios</td></tr>';
        return;
    }

    tbody.innerHTML = serviciosState.data.map(item => `
        <tr>
            <td>${item.nombre_categoria}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="openEditModal(${item.id_categoria}, 'servicio')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategoria(${item.id_categoria}, 'servicio')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render pagination for Productos
 */
function renderPaginationProductos() {
    const container = document.getElementById('paginationProductos');

    if (productosState.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <nav aria-label="Productos pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${productosState.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadProductos(${productosState.currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${productosState.currentPage} de ${productosState.totalPages}</span>
                </li>
                <li class="page-item ${productosState.currentPage === productosState.totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadProductos(${productosState.currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

/**
 * Render pagination for Servicios
 */
function renderPaginationServicios() {
    const container = document.getElementById('paginationServicios');

    if (serviciosState.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <nav aria-label="Servicios pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${serviciosState.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadServicios(${serviciosState.currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${serviciosState.currentPage} de ${serviciosState.totalPages}</span>
                </li>
                <li class="page-item ${serviciosState.currentPage === serviciosState.totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadServicios(${serviciosState.currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

/**
 * Open modal for create (tipo pre-selected)
 */
function openModal(tipo) {
    const modalEl = document.getElementById('categoriaModal');
    const form = document.getElementById('categoriaForm');

    form.reset();
    form.classList.remove('was-validated');

    document.getElementById('categoriaId').value = '';
    document.getElementById('categoriaTipo').value = tipo;
    document.getElementById('tipoDisplay').value = tipo === 'producto' ? 'Producto' : 'Servicio Técnico';
    document.getElementById('modalTitle').textContent = `Nueva Categoría de ${tipo === 'producto' ? 'Producto' : 'Servicio'}`;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Open modal for edit
 */
async function openEditModal(id, tipo) {
    const modalEl = document.getElementById('categoriaModal');
    const form = document.getElementById('categoriaForm');

    form.reset();
    form.classList.remove('was-validated');

    try {
        const data = await apiGet(`/categorias/${id}/`);

        document.getElementById('categoriaId').value = data.id_categoria;
        document.getElementById('nombreCategoria').value = data.nombre_categoria;
        document.getElementById('categoriaTipo').value = data.tipo;
        document.getElementById('tipoDisplay').value = data.tipo === 'producto' ? 'Producto' : 'Servicio Técnico';
        document.getElementById('modalTitle').textContent = 'Editar Categoría';

        const modal = new bootstrap.Modal(modalEl);
        modal.show();

    } catch (error) {
        showToast('Error al cargar categoría', 'danger');
    }
}

/**
 * Save categoria
 */
async function saveCategoria() {
    const form = document.getElementById('categoriaForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('categoriaId').value;
    const tipo = document.getElementById('categoriaTipo').value;
    const payload = {
        nombre_categoria: document.getElementById('nombreCategoria').value,
        tipo: tipo
    };

    try {
        if (id) {
            await apiPatch(`/categorias/${id}/`, payload);
            showToast('Categoría actualizada', 'success');
        } else {
            await apiPost('/categorias/', payload);
            showToast('Categoría creada', 'success');
        }

        // Hide modal
        const modalEl = document.getElementById('categoriaModal');
        bootstrap.Modal.getInstance(modalEl).hide();

        // Reload appropriate table
        if (tipo === 'producto') {
            loadProductos();
        } else {
            loadServicios();
        }

    } catch (error) {
        console.error('Error saving:', error);
        showToast('Error al guardar categoría', 'danger');
    }
}

/**
 * Delete categoria
 */
async function deleteCategoria(id, tipo) {
    if (!confirmDelete('¿Está seguro de eliminar esta categoría?')) return;

    try {
        await apiDelete(`/categorias/${id}/`);
        showToast('Categoría eliminada', 'success');

        // Reload appropriate table
        if (tipo === 'producto') {
            loadProductos();
        } else {
            loadServicios();
        }

    } catch (error) {
        console.error('Error deleting:', error);
        showToast('Error al eliminar categoría', 'danger');
    }
}
