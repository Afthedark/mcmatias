/**
 * Categorías Servicios Técnicos Page Logic
 * Manages categories of type 'servicio'
 */

// State
let categorias = [];
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let searchTimeout = null;

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value.trim();
                currentPage = 1;
                loadCategorias();
            }, 300);
        });
    }

    // Initial load
    loadCategorias();
});

/**
 * Load categories from API
 */
async function loadCategorias(page = null) {
    if (page !== null) currentPage = page;

    try {
        let url = `/categorias/?tipo=servicio&page=${currentPage}`;
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await apiGet(url);
        categorias = response.results || [];
        totalPages = Math.ceil(response.count / 10) || 1;

        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading categorias:', error);
        showToast('Error al cargar categorías', 'danger');
    }
}

/**
 * Render table
 */
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (categorias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">
                    ${searchQuery ? 'No se encontraron resultados' : 'No hay categorías registradas'}
                </td>
            </tr>
        `;
        return;
    }

    // Calcular índice inicial basado en paginación (10 items por página)
    const startNumber = (currentPage - 1) * 10 + 1;

    tbody.innerHTML = categorias.map((cat, index) => {
        return `
            <tr>
                <td><strong>${startNumber + index}</strong></td>
                <td>${cat.nombre_categoria}</td>
                <td>
                    <span class="badge bg-success">Activa</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${cat.id_categoria})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="desactivarCategoria(${cat.id_categoria})" title="Desactivar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render pagination
 */
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted">Página ${currentPage} de ${totalPages}</span>
            <div class="btn-group">
                <button class="btn btn-outline-secondary btn-sm" 
                    onclick="loadCategorias(${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-left"></i> Anterior
                </button>
                <button class="btn btn-outline-secondary btn-sm" 
                    onclick="loadCategorias(${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                    Siguiente <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Open modal for create
 */
function openModal() {
    document.getElementById('categoriaId').value = '';
    document.getElementById('nombreCategoria').value = '';
    document.getElementById('modalTitle').textContent = 'Nueva Categoría de Servicio Técnico';

    const modal = new bootstrap.Modal(document.getElementById('categoriaModal'));
    modal.show();
}

/**
 * Open modal for edit
 */
async function openEditModal(id) {
    try {
        const categoria = await apiGet(`/categorias/${id}/`);

        document.getElementById('categoriaId').value = categoria.id_categoria;
        document.getElementById('nombreCategoria').value = categoria.nombre_categoria;
        document.getElementById('modalTitle').textContent = 'Editar Categoría de Servicio Técnico';

        const modal = new bootstrap.Modal(document.getElementById('categoriaModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading categoria:', error);
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
    const data = {
        nombre_categoria: document.getElementById('nombreCategoria').value.trim(),
        tipo: 'servicio'
    };

    try {
        if (id) {
            await apiPatch(`/categorias/${id}/`, data);
            showToast('Categoría actualizada correctamente', 'success');
        } else {
            await apiPost('/categorias/', data);
            showToast('Categoría creada correctamente', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('categoriaModal')).hide();
        form.classList.remove('was-validated');
        loadCategorias();
    } catch (error) {
        console.error('Error saving categoria:', error);
        const message = error.response?.data?.nombre_categoria?.[0] || 'Error al guardar categoría';
        showToast(message, 'danger');
    }
}

/**
 * Soft delete (desactivar) categoria
 */
async function desactivarCategoria(id) {
    const confirmed = await confirmDelete('¿Desactivar esta categoría?');
    if (!confirmed) return;

    try {
        await apiDelete(`/categorias/${id}/`);
        showToast('Categoría desactivada', 'success');

        // Navigate back if page becomes empty
        if (categorias.length === 1 && currentPage > 1) {
            currentPage--;
        }
        loadCategorias();
    } catch (error) {
        console.error('Error deactivating categoria:', error);
        showToast('Error al desactivar categoría', 'danger');
    }
}

