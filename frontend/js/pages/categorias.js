/**
 * Categorias Management Module
 * Handles CRUD operations for Categories with Type Filtering
 */

let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 10;
let allCategorias = []; // Store current page results to filter locally if needed
let currentFilter = 'todos'; // todos, producto, servicio
let currentSearch = '';
let searchTimeout = null;

/**
 * Setup Search Filter
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();

            // Debounce to avoid too many API calls
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = val;
                currentPage = 1; // Reset to page 1 on search
                loadCategorias();
            }, 300); // 300ms delay
        });
    }
}

// Initialize when document is ready
// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // initializePage is called in HTML
    loadCategorias();
    setupFilters();
    setupSearch();
});

/**
 * Setup Tab Filters
 */
function setupFilters() {
    const tabs = document.querySelectorAll('.nav-pills .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');

            // Set filter
            currentFilter = e.target.dataset.filter;
            currentPage = 1; // Reset to page 1 on filter change

            // NOTE: Backend standard SearchFilter searches text globally.
            // It doesn't strictly support combined "search text AND exact type match"
            // via standard ?search= param easily without conflict or extra implementation (DjangoFilterBackend).
            // HOWEVER, we can stick to Client-Side filtering for 'type' (since it's a small enum)
            // and Server-Side for 'search' text.
            // OR we send ?search=PRODUCTO to filter by type if we included 'tipo' in search_fields?
            // Yes, I included 'tipo' in search_fields. So searching 'producto' will find products.
            // But searching 'Canon' + 'Producto' is harder with single ?search param.
            // STRATEGY:
            // 1. Search Param: Used for text input.
            // 2. Client Side Filter: Used for Type (still filtering the results returned by search).
            // This is a hybrid approach valid for now.

            loadCategorias();
        });
    });
}

/**
 * Load Categorias from API with pagination and Search
 * @param {number} page - Page number to load
 */
async function loadCategorias(page = 1) {
    if (page !== currentPage && page !== 1) showLoadingTable();
    else if (page === 1) showLoading();

    try {
        // Build Endpoint
        let endpoint = `/categorias/?page=${page}&page_size=${ITEMS_PER_PAGE}`;

        // Add Backend Search Param
        if (currentSearch) {
            endpoint += `&search=${encodeURIComponent(currentSearch)}`;
        }

        const response = await apiGet(endpoint);

        // Handle DRF pagination
        const results = response.results ? response.results : response;
        const count = response.count ? response.count : results.length;

        // Store for potential client-side type filtering
        allCategorias = results;

        totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        currentPage = page;

        renderTable(results);
        renderPagination(count);

    } catch (error) {
        console.error('Error loading categorias:', error);
        showToast('Error al cargar categorias', 'error');
        document.querySelector('#categoriasTableBody').innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">Error al cargar datos.</td>
            </tr>
        `;
    } finally {
        hideLoading();
    }
}

/**
 * Render Categorias Table
 * @param {Array} categorias - List of categories
 */
function renderTable(categorias) {
    const tbody = document.getElementById('categoriasTableBody');

    // Client-side filter for TYPE only (Search is now server-side)
    let filtered = categorias;
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(c => c.tipo === currentFilter);
    }
    // No client-side search filtering needed anymore

    if (!filtered || filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    ${currentSearch ? 'No se encontraron resultados' : 'No hay categorías para mostrar'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(cat => {
        const badgeClass = cat.tipo === 'producto' ? 'bg-primary' : 'bg-warning text-dark';
        const tipoLabel = cat.tipo.charAt(0).toUpperCase() + cat.tipo.slice(1);

        return `
            <tr>
                <td>${cat.nombre_categoria}</td>
                <td><span class="badge ${badgeClass}">${tipoLabel}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                            onclick="openEditModal(${cat.id_categoria})"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="confirmDelete(${cat.id_categoria}, '${cat.nombre_categoria}')"
                            title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render Pagination Controls
 */
function renderPagination(totalItems) {
    const container = document.getElementById('paginationContainer');
    const infoContainer = document.getElementById('paginationInfo');

    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    infoContainer.innerText = `Mostrando ${start} a ${end} de ${totalItems} categorías`;

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadCategorias(${currentPage - 1})">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="loadCategorias(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadCategorias(${currentPage + 1})">Siguiente</a>
        </li>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * Open Modal for Creating or Editing
 * @param {number|null} id - Categoria ID
 */
async function openEditModal(id = null) {
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('categoriaForm');

    form.reset();
    form.classList.remove('was-validated');

    if (id) {
        modalTitle.innerText = 'Editar Categoría';
        document.getElementById('categoriaId').value = id;

        try {
            const cat = await apiGet(`/categorias/${id}/`);
            document.getElementById('nombreCategoria').value = cat.nombre_categoria;
            document.getElementById('tipo').value = cat.tipo;
        } catch (error) {
            console.error('Error fetching categoria:', error);
            showToast('Error al cargar datos', 'error');
            return;
        }

    } else {
        modalTitle.innerText = 'Nueva Categoría';
        document.getElementById('categoriaId').value = '';
        // Set default based on current filter if possible, else empty
        if (currentFilter !== 'todos') {
            document.getElementById('tipo').value = currentFilter;
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('categoriaModal'));
    modal.show();
}

/**
 * Save Categoria
 */
async function saveCategoria() {
    const form = document.getElementById('categoriaForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('categoriaId').value;
    const data = {
        nombre_categoria: document.getElementById('nombreCategoria').value,
        tipo: document.getElementById('tipo').value
    };

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerText;
    btnSave.disabled = true;
    btnSave.innerText = 'Guardando...';

    try {
        if (id) {
            await apiPatch(`/categorias/${id}/`, data);
            showToast('Categoría actualizada correctamente');
        } else {
            await apiPost('/categorias/', data);
            showToast('Categoría creada correctamente');
        }

        const modalElement = document.getElementById('categoriaModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        loadCategorias(currentPage);

    } catch (error) {
        console.error('Error saving categoria:', error);
        showToast('Error al guardar. Verifique si el nombre ya existe para este tipo.', 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = originalText;
    }
}

/**
 * Confirm Delete
 */
function confirmDelete(id, name) {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${name}"?`)) {
        deleteCategoria(id);
    }
}

/**
 * Execute Delete
 */
async function deleteCategoria(id) {
    try {
        await apiDelete(`/categorias/${id}/`);
        showToast('Categoría eliminada correctamente');
        loadCategorias(currentPage);
    } catch (error) {
        console.error('Error deleting categoria:', error);
        showToast('Error al eliminar categoría', 'error');
    }
}

/**
 * Helpers
 */
function showLoading() {
    document.getElementById('categoriasTableBody').innerHTML = `
        <tr>
            <td colspan="3" class="text-center">
                <div class="spinner-border text-primary" role="status"></div>
            </td>
        </tr>
    `;
}

function showLoadingTable() {
    // Optional
}

function hideLoading() { }
