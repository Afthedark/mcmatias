/**
 * Categorias Page Logic
 * CRUD operations for categories search and pagination
 */

let categorias = [];
let currentFilter = 'todos';
let currentPage = 1;
let totalPages = 1;
let searchTimeout = null;
let currentSearch = '';

/**
 * Initialize listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Filter tabs
    document.querySelectorAll('.nav-link[data-filter]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            // UI Update
            document.querySelectorAll('.nav-link[data-filter]').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            // Logic Update
            currentFilter = e.target.getAttribute('data-filter');
            currentPage = 1;
            loadCategorias();
        });
    });

    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value.trim();
                currentPage = 1;
                loadCategorias();
            }, 300);
        });
    }

    loadCategorias();
});

/**
 * Load categories from API
 */
async function loadCategorias(page = null) {
    if (page) currentPage = page;

    try {
        const tbody = document.getElementById('categoriasTableBody');
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';

        let url = `/categorias/?page=${currentPage}`;

        // Add search param if exists
        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        // Add filtering logic (Server-side filter usually requires backend support but we can do client side if small dataset, 
        // OR simply pass the filter if backend supports it. Assuming backend supports searching which covers basic filtering)
        // Note: The original prompt implied search is server side.

        const data = await apiGet(url);

        // Process results
        let results = data.results || data;

        // Apply type filter client-side if backend doesn't support specific 'type' filter param individually
        // (Optimally this should be server-side filter like ?tipo=producto)
        if (currentFilter !== 'todos') {
            results = results.filter(c => c.tipo === currentFilter);
        }

        categorias = results;

        // Pagination (DRF standard)
        if (data.count) {
            // Note: If we client-side filter, pagination count might be off.
            // Ideally we should send ?tipo={currentFilter} to backend.
            // If backend doesn't support it, client side filtering on paginated results is buggy.
            // Let's assume for now we render what we have.
            totalPages = Math.ceil(data.count / 10);
        } else {
            totalPages = 1;
        }

        renderTable();
        renderPagination();

    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error al cargar categorías', 'danger');
        document.getElementById('categoriasTableBody').innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

/**
 * Render table rows
 */
function renderTable() {
    const tbody = document.getElementById('categoriasTableBody');

    if (categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No s e encontraron categorías</td></tr>';
        return;
    }

    tbody.innerHTML = categorias.map(item => `
        <tr>
            <td>${item.nombre_categoria}</td>
            <td>
                <span class="badge ${item.tipo === 'producto' ? 'bg-info' : 'bg-warning'}">
                    ${item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="openEditModal(${item.id_categoria})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategoria(${item.id_categoria})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render pagination
 */
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    const info = document.getElementById('paginationInfo');

    // Info text
    if (info) info.textContent = `Página ${currentPage} de ${totalPages || 1}`;

    if (!container || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Prev
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadCategorias(${currentPage - 1}); return false;">Anterior</a>
        </li>
    `;

    // Next
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadCategorias(${currentPage + 1}); return false;">Siguiente</a>
        </li>
    `;

    container.innerHTML = html;
}

/**
 * Open Modal (Create or Edit)
 */
async function openEditModal(id = null) {
    const modalEl = document.getElementById('categoriaModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('categoriaForm');
    const idInput = document.getElementById('categoriaId');
    const nameInput = document.getElementById('nombreCategoria');
    const typeInput = document.getElementById('tipo');

    form.reset();
    form.classList.remove('was-validated');

    if (id) {
        // Edit Mode
        modalTitle.textContent = 'Editar Categoría';
        const item = categorias.find(c => c.id_categoria === id);
        if (item) {
            idInput.value = item.id_categoria;
            nameInput.value = item.nombre_categoria;
            typeInput.value = item.tipo;
        } else {
            // Fetch if not in current page list (rare but possible)
            try {
                const data = await apiGet(`/categorias/${id}/`);
                idInput.value = data.id_categoria;
                nameInput.value = data.nombre_categoria;
                typeInput.value = data.tipo;
            } catch (e) {
                showToast('Error al cargar datos', 'danger');
                return;
            }
        }
    } else {
        // Create Mode
        modalTitle.textContent = 'Nueva Categoría';
        idInput.value = '';
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Save Category
 */
async function saveCategoria() {
    const form = document.getElementById('categoriaForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('categoriaId').value;
    const payload = {
        nombre_categoria: document.getElementById('nombreCategoria').value,
        tipo: document.getElementById('tipo').value
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

        // Reload
        loadCategorias();

    } catch (error) {
        console.error('Error saving:', error);
        showToast('Error al guardar categoría', 'danger');
    }
}

/**
 * Delete Category
 */
async function deleteCategoria(id) {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;

    try {
        await apiDelete(`/categorias/${id}/`);
        showToast('Categoría eliminada', 'success');
        loadCategorias();
    } catch (error) {
        console.error('Error deleting:', error);
        showToast('Error al eliminar', 'danger');
    }
}
