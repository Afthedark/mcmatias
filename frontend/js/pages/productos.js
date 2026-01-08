/**
 * Productos Page Logic
 * CRUD operations for products
 */

let productos = [];
let categorias = [];
let currentProductoId = null;
let modalInstance = null;

/**
 * Load all products
 */
async function loadProductos() {
    try {
        const data = await apiGet('/productos/');
        productos = data.results || data;
        renderProductosTable();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error al cargar productos', 'danger');
    }
}

/**
 * Load categories for select
 */
async function loadCategorias() {
    try {
        const data = await apiGet('/categorias/');
        categorias = data.results || data;

        const select = document.getElementById('idCategoria');
        select.innerHTML = '<option value="">Seleccione...</option>';
        categorias.forEach(cat => {
            select.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre_categoria} (${cat.tipo})</option>`;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
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
            <td>${getCategoriaName(producto.id_categoria)}</td>
            <td>${producto.codigo_barras || '-'}</td>
            <td>${formatCurrency(producto.precio)}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="openEditModal(${producto.id_producto})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProducto(${producto.id_producto})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Get category name by ID
 */
function getCategoriaName(id) {
    const cat = categorias.find(c => c.id_categoria === id);
    return cat ? cat.nombre_categoria : '-';
}

/**
 * Open create modal
 */
function openCreateModal() {
    currentProductoId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('productoForm').reset();
    document.getElementById('productoId').value = '';

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
        document.getElementById('idCategoria').value = producto.id_categoria || '';
        document.getElementById('precio').value = producto.precio;

        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        modal.show();
    } catch (error) {
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
            await apiPutFormData(`/productos/${currentProductoId}/`, formData);
            showToast('Producto actualizado correctamente', 'success');
        } else {
            await apiPostFormData('/productos/', formData);
            showToast('Producto creado correctamente', 'success');
        }

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();

        // Reload table
        await loadProductos();

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
        await loadProductos();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error al eliminar producto', 'danger');
    } finally {
        hideLoader();
    }
}
