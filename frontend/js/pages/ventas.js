/**
 * Ventas Page Logic
 * CRUD operations for sales with cart system
 */

// === Estado Global ===
let ventas = [];
let currentPage = 1;
let totalPages = 1;

// Nueva Venta
let clienteSeleccionado = null;
let carrito = []; // [{ id_producto, nombre_producto, precio, cantidad }]
let metodoPago = 'Efectivo';

// Debounce timers
let searchClienteTimeout = null;
let searchProductoTimeout = null;

// ============================================
// CRUD VENTAS - Lista Principal
// ============================================

/**
 * Cargar ventas con paginación
 */
async function loadVentas(page = 1) {
    try {
        showLoader();
        const data = await apiGet(`/ventas/?page=${page}`);

        ventas = data.results || data;
        currentPage = page;

        if (data.count) {
            totalPages = Math.ceil(data.count / 10);
        } else {
            totalPages = 1;
        }

        renderVentasTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading ventas:', error);
        showToast('Error al cargar ventas', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Renderizar tabla de ventas
 */
function renderVentasTable() {
    const tbody = document.getElementById('ventasTable');

    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay ventas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ventas.map(venta => {
        const esAnulada = venta.estado === 'Anulada';
        const rowClass = esAnulada ? 'table-secondary' : '';
        const textClass = esAnulada ? 'text-decoration-line-through text-muted' : '';

        return `
        <tr class="${rowClass}">
            <td class="${textClass}"><strong>${venta.numero_boleta || '-'}</strong></td>
            <td class="${textClass}">${venta.nombre_cliente || 'Sin cliente'}</td>
            <td class="${textClass}">${formatDate(venta.fecha_venta)}</td>
            <td class="${textClass}">${formatCurrency(venta.total_venta)}</td>
            <td class="${textClass}">
                <span class="badge ${venta.tipo_pago === 'Efectivo' ? 'bg-success' : 'bg-info'}">${venta.tipo_pago}</span>
            </td>
            <td>
                ${esAnulada
                ? '<span class="badge bg-danger">Anulada</span>'
                : '<span class="badge bg-primary">Completada</span>'
            }
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="verDetalleVenta(${venta.id_venta})" title="Ver Detalle">
                    <i class="bi bi-eye"></i>
                </button>
                ${!esAnulada ? `
                    <button class="btn btn-sm btn-warning" onclick="abrirModalAnular(${venta.id_venta}, '${venta.numero_boleta}')" title="Anular">
                        <i class="bi bi-x-circle"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `}).join('');
}

/**
 * Renderizar paginación
 */
function renderPagination() {
    const container = document.getElementById('paginationContainer');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <nav aria-label="Ventas pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadVentas(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadVentas(${currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

/**
 * Ver detalle de venta
 */
async function verDetalleVenta(id) {
    try {
        showLoader();
        const venta = await apiGet(`/ventas/${id}/`);
        const detalles = await apiGet(`/detalle_ventas/?id_venta=${id}`);

        document.getElementById('detalleNumeroBoleta').textContent = venta.numero_boleta || '';
        document.getElementById('detalleCliente').textContent = venta.nombre_cliente || 'Sin cliente';
        document.getElementById('detalleFecha').textContent = formatDate(venta.fecha_venta);
        document.getElementById('detalleVendedor').textContent = venta.nombre_usuario || '-';
        document.getElementById('detalleTipoPago').textContent = venta.tipo_pago;
        document.getElementById('detalleTotal').textContent = formatCurrency(venta.total_venta);

        // Mostrar estado y info de anulación
        const estadoContainer = document.getElementById('detalleEstadoContainer');
        if (venta.estado === 'Anulada') {
            estadoContainer.innerHTML = `
                <div class="alert alert-danger mb-3">
                    <h6 class="alert-heading"><i class="bi bi-x-circle"></i> Venta Anulada</h6>
                    <p class="mb-1"><strong>Motivo:</strong> ${venta.motivo_anulacion || 'No especificado'}</p>
                    <p class="mb-0"><strong>Fecha de anulación:</strong> ${venta.fecha_anulacion ? formatDate(venta.fecha_anulacion) : '-'}</p>
                </div>
            `;
            estadoContainer.style.display = 'block';
        } else {
            estadoContainer.innerHTML = '';
            estadoContainer.style.display = 'none';
        }

        const detallesData = detalles.results || detalles;
        document.getElementById('detalleProductosTable').innerHTML = detallesData.map(d => `
            <tr>
                <td>${d.nombre_producto || 'Producto #' + d.id_producto}</td>
                <td>${d.cantidad}</td>
                <td>${formatCurrency(d.precio_venta)}</td>
                <td>${formatCurrency(d.cantidad * d.precio_venta)}</td>
            </tr>
        `).join('');

        const modal = new bootstrap.Modal(document.getElementById('detalleVentaModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading venta detail:', error);
        showToast('Error al cargar detalle', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Eliminar venta
 */
async function deleteVenta(id) {
    if (!confirmDelete('¿Estás seguro de eliminar esta venta?')) {
        return;
    }

    try {
        showLoader();
        await apiDelete(`/ventas/${id}/`);
        showToast('Venta eliminada correctamente', 'success');

        const newCount = ventas.length - 1;
        if (newCount === 0 && currentPage > 1) {
            await loadVentas(currentPage - 1);
        } else {
            await loadVentas(currentPage);
        }
    } catch (error) {
        console.error('Error deleting venta:', error);
        showToast('Error al eliminar venta', 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// NUEVA VENTA - Wizard
// ============================================

/**
 * Mostrar vista de nueva venta
 */
function mostrarNuevaVenta() {
    document.getElementById('vistaListaVentas').style.display = 'none';
    document.getElementById('vistaNuevaVenta').style.display = 'block';
    resetNuevaVenta();
}

/**
 * Cancelar nueva venta y volver a lista
 */
function cancelarNuevaVenta() {
    document.getElementById('vistaNuevaVenta').style.display = 'none';
    document.getElementById('vistaListaVentas').style.display = 'block';
    resetNuevaVenta();
}

/**
 * Resetear formulario de nueva venta
 */
function resetNuevaVenta() {
    clienteSeleccionado = null;
    carrito = [];
    metodoPago = 'Efectivo';

    document.getElementById('searchClienteInput').value = '';
    document.getElementById('clienteResultados').style.display = 'none';
    document.getElementById('clienteSeleccionadoContainer').style.display = 'none';

    document.getElementById('searchProductoInput').value = '';
    document.getElementById('productoResultados').innerHTML = '';

    document.getElementById('btnEfectivo').classList.add('selected');
    document.getElementById('btnQR').classList.remove('selected');

    renderCarrito();
}

// ============================================
// BÚSQUEDA DE CLIENTES (Server-Side)
// ============================================

/**
 * Buscar clientes en el servidor
 */
async function searchClientes(term) {
    if (!term || term.length < 2) {
        document.getElementById('clienteResultados').style.display = 'none';
        return;
    }

    try {
        const data = await apiGet(`/clientes/?search=${encodeURIComponent(term)}`);
        const clientes = data.results || data;
        renderClienteResultados(clientes);
    } catch (error) {
        console.error('Error searching clients:', error);
    }
}

/**
 * Renderizar resultados de búsqueda de clientes
 */
function renderClienteResultados(clientes) {
    const container = document.getElementById('clienteResultados');

    if (clientes.length === 0) {
        container.innerHTML = '<div class="search-result-item text-muted">No se encontraron clientes</div>';
    } else {
        container.innerHTML = clientes.map(c => `
            <div class="search-result-item" onclick="seleccionarCliente(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                <strong>${c.nombre_apellido}</strong>
                ${c.cedula_identidad ? `<span class="text-muted ms-2">CI: ${c.cedula_identidad}</span>` : ''}
            </div>
        `).join('');
    }
    container.style.display = 'block';
}

/**
 * Seleccionar un cliente
 */
function seleccionarCliente(cliente) {
    clienteSeleccionado = cliente;

    document.getElementById('clienteNombre').textContent = cliente.nombre_apellido;
    document.getElementById('clienteCI').textContent = cliente.cedula_identidad ? `CI: ${cliente.cedula_identidad}` : '';
    document.getElementById('clienteSeleccionadoContainer').style.display = 'block';
    document.getElementById('clienteResultados').style.display = 'none';
    document.getElementById('searchClienteInput').value = '';

    validarFormulario();
}

/**
 * Deseleccionar cliente
 */
function deseleccionarCliente() {
    clienteSeleccionado = null;
    document.getElementById('clienteSeleccionadoContainer').style.display = 'none';
    validarFormulario();
}

/**
 * Abrir modal de nuevo cliente
 */
function abrirModalNuevoCliente() {
    document.getElementById('nuevoClienteForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('nuevoClienteModal'));
    modal.show();
}

/**
 * Guardar nuevo cliente
 */
async function guardarNuevoCliente() {
    const form = document.getElementById('nuevoClienteForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const data = {
        nombre_apellido: document.getElementById('ncNombre').value,
        cedula_identidad: document.getElementById('ncCI').value,
        celular: document.getElementById('ncCelular').value
    };

    try {
        showLoader();
        const nuevoCliente = await apiPost('/clientes/', data);
        showToast('Cliente creado correctamente', 'success');

        // Seleccionar el cliente recién creado
        seleccionarCliente(nuevoCliente);

        bootstrap.Modal.getInstance(document.getElementById('nuevoClienteModal')).hide();
    } catch (error) {
        console.error('Error creating client:', error);
        showToast('Error al crear cliente', 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// BÚSQUEDA DE PRODUCTOS (Server-Side)
// ============================================

/**
 * Buscar productos en el servidor (por nombre o código de barras)
 */
async function searchProductos(term) {
    if (!term || term.length < 2) {
        document.getElementById('productoResultados').innerHTML = '';
        return;
    }

    try {
        const data = await apiGet(`/productos/?search=${encodeURIComponent(term)}`);
        const productos = data.results || data;
        renderProductoResultados(productos);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

/**
 * Renderizar resultados de búsqueda de productos
 */
function renderProductoResultados(productos) {
    const container = document.getElementById('productoResultados');

    if (productos.length === 0) {
        container.innerHTML = '<p class="text-muted">No se encontraron productos</p>';
        return;
    }

    container.innerHTML = productos.map(p => `
        <div class="producto-card d-flex justify-content-between align-items-center">
            <div>
                <strong>${p.nombre_producto}</strong>
                <div class="small text-muted">
                    ${p.codigo_barras ? `Código: ${p.codigo_barras}` : 'Sin código'}
                </div>
            </div>
            <div class="d-flex align-items-center gap-3">
                <span class="fw-bold">${formatCurrency(p.precio)}</span>
                <button class="btn btn-sm btn-outline-primary" onclick='agregarProductoCarrito(${JSON.stringify(p).replace(/'/g, "\\'")})'>
                    <i class="bi bi-cart-plus"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// CARRITO
// ============================================

/**
 * Agregar producto al carrito
 */
function agregarProductoCarrito(producto) {
    const existente = carrito.find(item => item.id_producto === producto.id_producto);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            precio: parseFloat(producto.precio),
            cantidad: 1
        });
    }

    renderCarrito();
    validarFormulario();
    showToast('Producto agregado', 'success');
}

/**
 * Actualizar cantidad de un item
 */
function actualizarCantidad(idProducto, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad < 1) {
        eliminarDelCarrito(idProducto);
        return;
    }

    const item = carrito.find(i => i.id_producto === idProducto);
    if (item) {
        item.cantidad = cantidad;
        renderCarrito();
    }
}

/**
 * Eliminar producto del carrito
 */
function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id_producto !== idProducto);
    renderCarrito();
    validarFormulario();
}

/**
 * Renderizar carrito
 */
function renderCarrito() {
    const container = document.getElementById('carritoItems');
    const emptyMsg = document.getElementById('carritoVacio');

    if (carrito.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        document.getElementById('subtotalVenta').textContent = 'Bs 0.00';
        document.getElementById('totalVenta').textContent = 'Bs 0.00';
        return;
    }

    emptyMsg.style.display = 'none';

    container.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <div class="d-flex justify-content-between mb-2">
                <strong>${item.nombre_producto}</strong>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="eliminarDelCarrito(${item.id_producto})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <div class="cantidad-control">
                    <button class="btn btn-sm btn-outline-secondary" onclick="actualizarCantidad(${item.id_producto}, ${item.cantidad - 1})">-</button>
                    <input type="number" class="form-control form-control-sm" value="${item.cantidad}" min="1" 
                           onchange="actualizarCantidad(${item.id_producto}, this.value)">
                    <button class="btn btn-sm btn-outline-secondary" onclick="actualizarCantidad(${item.id_producto}, ${item.cantidad + 1})">+</button>
                </div>
                <span class="fw-bold">${formatCurrency(item.precio * item.cantidad)}</span>
            </div>
        </div>
    `).join('');

    const total = calcularTotal();
    document.getElementById('subtotalVenta').textContent = formatCurrency(total);
    document.getElementById('totalVenta').textContent = formatCurrency(total);
}

/**
 * Calcular total del carrito
 */
function calcularTotal() {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

// ============================================
// MÉTODO DE PAGO
// ============================================

/**
 * Seleccionar método de pago
 */
function seleccionarMetodoPago(metodo) {
    metodoPago = metodo;

    document.getElementById('btnEfectivo').classList.toggle('selected', metodo === 'Efectivo');
    document.getElementById('btnQR').classList.toggle('selected', metodo === 'QR');
}

// ============================================
// CONFIRMAR VENTA
// ============================================

/**
 * Validar formulario para habilitar botón
 */
function validarFormulario() {
    const valido = clienteSeleccionado && carrito.length > 0;
    document.getElementById('btnConfirmarVenta').disabled = !valido;
}

/**
 * Confirmar y guardar la venta
 */
async function confirmarVenta() {
    if (!clienteSeleccionado || carrito.length === 0) {
        showToast('Complete todos los campos', 'warning');
        return;
    }

    try {
        showLoader();

        // 1. Crear la venta
        const ventaData = {
            id_cliente: clienteSeleccionado.id_cliente,
            total_venta: calcularTotal(),
            tipo_pago: metodoPago
        };

        const ventaCreada = await apiPost('/ventas/', ventaData);

        // 2. Crear los detalles de venta (con validación de stock en backend)
        let detallesCreados = 0;
        for (const item of carrito) {
            try {
                await apiPost('/detalle_ventas/', {
                    id_venta: ventaCreada.id_venta,
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_venta: item.precio
                });
                detallesCreados++;
            } catch (detalleError) {
                // Si falla un detalle, mostrar error específico de stock
                const errorMsg = detalleError.response?.data?.cantidad ||
                    detalleError.response?.data?.id_producto ||
                    'Error al agregar producto';

                showToast(errorMsg, 'danger');

                // Si no se creó ningún detalle, eliminar la venta huérfana
                if (detallesCreados === 0) {
                    try {
                        await apiDelete(`/ventas/${ventaCreada.id_venta}/`);
                    } catch (e) {
                        console.error('Error cleaning up orphan sale:', e);
                    }
                }

                hideLoader();
                return;
            }
        }

        showToast(`Venta ${ventaCreada.numero_boleta} creada exitosamente`, 'success');

        // Volver a la lista
        cancelarNuevaVenta();
        await loadVentas(1);

    } catch (error) {
        console.error('Error creating venta:', error);
        const errorMsg = error.response?.data?.detail || 'Error al crear la venta';
        showToast(errorMsg, 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Búsqueda de clientes con debounce
    const searchClienteInput = document.getElementById('searchClienteInput');
    if (searchClienteInput) {
        searchClienteInput.addEventListener('input', (e) => {
            clearTimeout(searchClienteTimeout);
            searchClienteTimeout = setTimeout(() => {
                searchClientes(e.target.value.trim());
            }, 300);
        });

        // Cerrar resultados al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!searchClienteInput.contains(e.target) && !document.getElementById('clienteResultados').contains(e.target)) {
                document.getElementById('clienteResultados').style.display = 'none';
            }
        });
    }

    // Búsqueda de productos con debounce
    const searchProductoInput = document.getElementById('searchProductoInput');
    if (searchProductoInput) {
        searchProductoInput.addEventListener('input', (e) => {
            clearTimeout(searchProductoTimeout);
            searchProductoTimeout = setTimeout(() => {
                searchProductos(e.target.value.trim());
            }, 300);
        });
    }
});

// ============================================
// ANULACIÓN DE VENTAS
// ============================================

let ventaAAnular = null;

/**
 * Abrir modal de anulación
 */
function abrirModalAnular(idVenta, numeroBoleta) {
    ventaAAnular = idVenta;
    document.getElementById('anularNumeroBoleta').textContent = numeroBoleta;
    document.getElementById('motivoAnulacion').value = '';
    new bootstrap.Modal(document.getElementById('anularVentaModal')).show();
}

/**
 * Confirmar anulación de venta
 */
async function confirmarAnulacion() {
    const motivo = document.getElementById('motivoAnulacion').value.trim();

    if (!motivo) {
        showToast('Ingrese el motivo de anulación', 'warning');
        return;
    }

    try {
        showLoader();
        await apiPatch(`/ventas/${ventaAAnular}/anular/`, { motivo_anulacion: motivo });
        showToast('Venta anulada correctamente. Stock restaurado.', 'success');

        bootstrap.Modal.getInstance(document.getElementById('anularVentaModal')).hide();
        await loadVentas(currentPage);
    } catch (error) {
        console.error('Error anulando venta:', error);
        const errorMsg = error.response?.data?.error || 'Error al anular venta';
        showToast(errorMsg, 'danger');
    } finally {
        hideLoader();
    }
}

