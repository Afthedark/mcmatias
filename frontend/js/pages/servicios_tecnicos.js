/**
 * Servicios Técnicos - Módulo Completo
 * CRUD con navegación por vistas, búsqueda server-side, paginación
 */

// ============================================
// Estado Global
// ============================================
let servicios = [];
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let editingId = null;

// Selecciones
let clienteSeleccionado = null;
let categoriaSeleccionada = null;

// Debounce timers
let searchTimeout = null;
let searchClienteTimeout = null;
let searchCategoriaTimeout = null;

// ============================================
// Inicialización
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Búsqueda principal en tabla
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value.trim();
                currentPage = 1;
                loadServicios(1);
            }, 300);
        });
    }

    // Búsqueda de clientes
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
            const resultados = document.getElementById('clienteResultados');
            if (resultados && !searchClienteInput.contains(e.target) && !resultados.contains(e.target)) {
                resultados.style.display = 'none';
            }
        });
    }

    // Búsqueda de categorías
    const searchCategoriaInput = document.getElementById('searchCategoriaInput');
    if (searchCategoriaInput) {
        searchCategoriaInput.addEventListener('input', (e) => {
            clearTimeout(searchCategoriaTimeout);
            searchCategoriaTimeout = setTimeout(() => {
                searchCategorias(e.target.value.trim());
            }, 300);
        });

        // Al hacer focus, mostrar categorías iniciales
        searchCategoriaInput.addEventListener('focus', () => {
            if (!searchCategoriaInput.value.trim()) {
                loadCategoriasIniciales();
            }
        });

        // Cerrar resultados al hacer click fuera
        document.addEventListener('click', (e) => {
            const resultados = document.getElementById('categoriaResultados');
            if (resultados && !searchCategoriaInput.contains(e.target) && !resultados.contains(e.target)) {
                resultados.style.display = 'none';
            }
        });
    }

    // Preview de imágenes
    ['foto_1', 'foto_2', 'foto_3'].forEach((fieldName, index) => {
        const input = document.getElementById(fieldName);
        if (input) {
            input.addEventListener('change', (e) => handleImagePreview(e, index + 1));
        }
    });

    // Actualizar resumen en tiempo real
    document.getElementById('costo_estimado')?.addEventListener('input', actualizarResumen);
    document.getElementById('marca_dispositivo')?.addEventListener('input', actualizarResumen);
    document.getElementById('modelo_dispositivo')?.addEventListener('input', actualizarResumen);
}

// ============================================
// CRUD - Cargar Servicios (Paginación)
// ============================================
async function loadServicios(page = 1) {
    try {
        showLoader();
        currentPage = page;

        let url = `/servicios_tecnicos/?page=${page}`;
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const data = await apiGet(url);
        servicios = data.results || [];

        if (data.count) {
            totalPages = Math.ceil(data.count / 10);
        } else {
            totalPages = 1;
        }

        renderServiciosTable();
        renderPagination();
    } catch (error) {
        console.error('Error loading servicios:', error);
        showToast('Error al cargar servicios', 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// Renderizar Tabla
// ============================================
function renderServiciosTable() {
    const tbody = document.getElementById('serviciosTableBody');

    if (servicios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay servicios registrados</td></tr>';
        return;
    }

    tbody.innerHTML = servicios.map(servicio => {
        const esAnulado = servicio.estado === 'Anulado';
        const rowClass = esAnulado ? 'table-secondary' : '';
        const textClass = esAnulado ? 'text-decoration-line-through text-muted' : '';

        return `
        <tr class="${rowClass}">
            <td class="${textClass}"><strong>${servicio.numero_servicio || '-'}</strong></td>
            <td class="${textClass}">${servicio.nombre_cliente || 'Sin cliente'}</td>
            <td class="${textClass}">${servicio.marca_dispositivo || ''} ${servicio.modelo_dispositivo || ''}</td>
            <td class="${textClass}">${servicio.nombre_categoria || '-'}</td>
            <td>${getEstadoBadge(servicio.estado)}</td>
            <td class="${textClass}">${formatDate(servicio.fecha_inicio)}</td>
            <td class="${textClass}">${formatCurrency(servicio.costo_estimado || 0)}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-info" onclick="verDetalle(${servicio.id_servicio})" title="Ver Detalle">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="imprimirBoletaServicio(${servicio.id_servicio})" title="Imprimir Orden">
                    <i class="bi bi-printer"></i>
                </button>
                ${!esAnulado ? `
                    <button class="btn btn-sm btn-warning" onclick="mostrarEditarServicio(${servicio.id_servicio})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${(typeof canPerformAction !== 'function' || canPerformAction('anular_servicios')) ? `
                    <button class="btn btn-sm btn-danger" onclick="abrirModalAnular(${servicio.id_servicio}, '${servicio.numero_servicio}')" title="Anular">
                        <i class="bi bi-x-circle"></i>
                    </button>` : ''}
                ` : ''}
            </td>
        </tr>
    `}).join('');
}

function getEstadoBadge(estado) {
    const estados = {
        'En Reparación': '<span class="badge bg-primary">🔵 En Reparación</span>',
        'Para Retirar': '<span class="badge bg-warning text-dark">🟡 Para Retirar</span>',
        'Entregado': '<span class="badge bg-success">🟢 Entregado</span>',
        'Anulado': '<span class="badge bg-danger">❌ Anulado</span>'
    };
    return estados[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

function renderPagination() {
    const container = document.getElementById('paginationContainer');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <nav aria-label="Paginación de servicios">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadServicios(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="loadServicios(${currentPage + 1}); return false;">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

// ============================================
// Navegación entre Vistas
// ============================================
function mostrarNuevoServicio() {
    editingId = null;
    resetFormulario();

    document.getElementById('vistaListaServicios').style.display = 'none';
    document.getElementById('vistaNuevoServicio').style.display = 'block';
    document.getElementById('tituloFormulario').innerHTML =
        '<i class="bi bi-tools text-primary"></i> Nuevo Servicio Técnico';

    // Ocultar campo de estado (solo para edición)
    const estadoGroup = document.getElementById('estadoGroup');
    if (estadoGroup) estadoGroup.style.display = 'none';

    window.scrollTo(0, 0);
}

function cancelarNuevoServicio() {
    document.getElementById('vistaNuevoServicio').style.display = 'none';
    document.getElementById('vistaListaServicios').style.display = 'block';
    loadServicios(currentPage);
}

async function mostrarEditarServicio(id) {
    try {
        showLoader();
        const servicio = await apiGet(`/servicios_tecnicos/${id}/`);
        editingId = id;

        // Mostrar vista de formulario
        document.getElementById('vistaListaServicios').style.display = 'none';
        document.getElementById('vistaNuevoServicio').style.display = 'block';
        document.getElementById('tituloFormulario').innerHTML =
            `<i class="bi bi-tools text-primary"></i> Editar Servicio ${servicio.numero_servicio}`;

        // Llenar datos del cliente
        clienteSeleccionado = {
            id_cliente: servicio.id_cliente,
            nombre_apellido: servicio.nombre_cliente,
            celular: servicio.celular_cliente
        };
        document.getElementById('searchClienteInput').parentElement.parentElement.style.display = 'none';
        document.getElementById('clienteSeleccionadoContainer').style.display = 'block';
        document.getElementById('clienteNombre').textContent = servicio.nombre_cliente;
        document.getElementById('clienteCelular').textContent = servicio.celular_cliente || '';

        // Llenar formulario
        document.getElementById('marca_dispositivo').value = servicio.marca_dispositivo || '';
        document.getElementById('modelo_dispositivo').value = servicio.modelo_dispositivo || '';
        document.getElementById('costo_estimado').value = servicio.costo_estimado || '';
        document.getElementById('descripcion_problema').value = servicio.descripcion_problema || '';
        document.getElementById('estado').value = servicio.estado || 'En Reparación';

        // Cargar categoría seleccionada
        if (servicio.id_categoria) {
            categoriaSeleccionada = {
                id_categoria: servicio.id_categoria,
                nombre_categoria: servicio.nombre_categoria
            };
            document.getElementById('id_categoria').value = servicio.id_categoria;
            document.getElementById('nombreCategoriaSeleccionada').textContent = servicio.nombre_categoria;
            document.getElementById('categoriaSeleccionada').style.display = 'block';
            document.getElementById('searchCategoriaInput').style.display = 'none';
        }

        // Mostrar campo de estado
        document.getElementById('estadoGroup').style.display = 'block';

        actualizarResumen();
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error al cargar servicio:', error);
        showToast('Error al cargar el servicio', 'danger');
    } finally {
        hideLoader();
    }
}

function resetFormulario() {
    clienteSeleccionado = null;
    categoriaSeleccionada = null;

    // Cliente
    const searchClienteInput = document.getElementById('searchClienteInput');
    if (searchClienteInput) {
        searchClienteInput.value = '';
        searchClienteInput.parentElement.parentElement.style.display = 'block';
    }
    document.getElementById('clienteResultados').style.display = 'none';
    document.getElementById('clienteResultados').innerHTML = '';
    document.getElementById('clienteSeleccionadoContainer').style.display = 'none';

    // Categoría
    const searchCategoriaInput = document.getElementById('searchCategoriaInput');
    if (searchCategoriaInput) {
        searchCategoriaInput.value = '';
        searchCategoriaInput.style.display = 'block';
    }
    document.getElementById('categoriaResultados').style.display = 'none';
    document.getElementById('categoriaSeleccionada').style.display = 'none';
    document.getElementById('id_categoria').value = '';

    // Campos
    document.getElementById('marca_dispositivo').value = '';
    document.getElementById('modelo_dispositivo').value = '';
    document.getElementById('costo_estimado').value = '';
    document.getElementById('descripcion_problema').value = '';
    document.getElementById('estado').value = 'En Reparación';

    // Fotos
    ['foto_1', 'foto_2', 'foto_3'].forEach((fieldName, index) => {
        const input = document.getElementById(fieldName);
        if (input) input.value = '';
        const container = document.getElementById(`preview_container_${index + 1}`);
        if (container) container.style.display = 'none';
    });

    // Resumen
    document.getElementById('resumenCliente').textContent = '-';
    document.getElementById('resumenDispositivo').textContent = '-';
    document.getElementById('resumenCategoria').textContent = '-';
    document.getElementById('resumenCosto').textContent = 'Bs 0.00';
}

// ============================================
// Búsqueda de Clientes (Server-Side)
// ============================================
async function searchClientes(term) {
    const container = document.getElementById('clienteResultados');

    if (!term || term.length < 2) {
        container.style.display = 'none';
        return;
    }

    try {
        const response = await apiGet(`/clientes/?search=${encodeURIComponent(term)}`);
        const clientes = response.results || [];
        renderClienteResultados(clientes);
    } catch (error) {
        console.error('Error buscando clientes:', error);
    }
}

function renderClienteResultados(clientes) {
    const container = document.getElementById('clienteResultados');

    if (clientes.length === 0) {
        container.innerHTML = '<div class="search-result-item text-muted">No se encontraron clientes</div>';
    } else {
        container.innerHTML = clientes.map(cliente => `
            <div class="search-result-item" onclick='seleccionarCliente(${JSON.stringify(cliente).replace(/'/g, "\\'")})'>
                <strong>${cliente.nombre_apellido}</strong>
                <small class="text-muted d-block">${cliente.celular || ''} - ${cliente.cedula_identidad || ''}</small>
            </div>
        `).join('');
    }
    container.style.display = 'block';
}

function seleccionarCliente(cliente) {
    clienteSeleccionado = cliente;

    document.getElementById('clienteNombre').textContent = cliente.nombre_apellido;
    document.getElementById('clienteCelular').textContent = cliente.celular || '';
    document.getElementById('searchClienteInput').parentElement.parentElement.style.display = 'none';
    document.getElementById('clienteSeleccionadoContainer').style.display = 'block';
    document.getElementById('clienteResultados').style.display = 'none';
    document.getElementById('searchClienteInput').value = '';

    actualizarResumen();
}

function deseleccionarCliente() {
    clienteSeleccionado = null;
    document.getElementById('clienteSeleccionadoContainer').style.display = 'none';
    document.getElementById('searchClienteInput').parentElement.parentElement.style.display = 'block';
    document.getElementById('resumenCliente').textContent = '-';
}

// ============================================
// Modal Nuevo Cliente
// ============================================
function abrirModalNuevoCliente() {
    document.getElementById('ncNombre').value = '';
    document.getElementById('ncCI').value = '';
    document.getElementById('ncCelular').value = '';
    new bootstrap.Modal(document.getElementById('nuevoClienteModal')).show();
}

async function guardarNuevoCliente() {
    const nombre = document.getElementById('ncNombre').value.trim();
    const cedula = document.getElementById('ncCI').value.trim();
    const celular = document.getElementById('ncCelular').value.trim();

    if (!nombre) {
        showToast('El nombre es obligatorio', 'warning');
        return;
    }

    try {
        showLoader();
        const nuevoCliente = await apiPost('/clientes/', {
            nombre_apellido: nombre,
            cedula_identidad: cedula || null,
            celular: celular || null
        });

        showToast('Cliente creado correctamente', 'success');
        seleccionarCliente(nuevoCliente);
        bootstrap.Modal.getInstance(document.getElementById('nuevoClienteModal')).hide();
    } catch (error) {
        console.error('Error creating client:', error);
        const errorMsg = error.response?.data?.cedula_identidad?.[0] || 'Error al crear cliente';
        showToast(errorMsg, 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// Búsqueda de Categorías (Server-Side)
// ============================================
async function loadCategoriasIniciales() {
    try {
        const response = await apiGet('/categorias/?tipo=servicio');
        const categorias = response.results || [];
        renderCategoriaResultados(categorias.slice(0, 10));
    } catch (error) {
        console.error('Error cargando categorías iniciales:', error);
    }
}

async function searchCategorias(term) {
    const container = document.getElementById('categoriaResultados');

    if (!term || term.length < 1) {
        container.style.display = 'none';
        return;
    }

    try {
        const response = await apiGet(`/categorias/?tipo=servicio&search=${encodeURIComponent(term)}`);
        const categorias = response.results || [];
        renderCategoriaResultados(categorias);
    } catch (error) {
        console.error('Error buscando categorías:', error);
    }
}

function renderCategoriaResultados(categorias) {
    const container = document.getElementById('categoriaResultados');

    if (categorias.length === 0) {
        container.innerHTML = '<div class="search-result-item text-muted">No se encontraron categorías</div>';
    } else {
        container.innerHTML = categorias.map(cat => `
            <div class="search-result-item" onclick='seleccionarCategoria(${JSON.stringify(cat).replace(/'/g, "\\'")})'>
                <strong>${cat.nombre_categoria}</strong>
            </div>
        `).join('');
    }
    container.style.display = 'block';
}

function seleccionarCategoria(categoria) {
    categoriaSeleccionada = categoria;

    document.getElementById('id_categoria').value = categoria.id_categoria;
    document.getElementById('nombreCategoriaSeleccionada').textContent = categoria.nombre_categoria;
    document.getElementById('categoriaSeleccionada').style.display = 'block';
    document.getElementById('searchCategoriaInput').style.display = 'none';
    document.getElementById('categoriaResultados').style.display = 'none';

    actualizarResumen();
}

function deseleccionarCategoria() {
    categoriaSeleccionada = null;
    document.getElementById('id_categoria').value = '';
    document.getElementById('categoriaSeleccionada').style.display = 'none';
    document.getElementById('searchCategoriaInput').style.display = 'block';
    document.getElementById('searchCategoriaInput').value = '';
    document.getElementById('resumenCategoria').textContent = '-';
}

// ============================================
// Actualizar Resumen
// ============================================
function actualizarResumen() {
    // Cliente
    if (clienteSeleccionado) {
        document.getElementById('resumenCliente').textContent = clienteSeleccionado.nombre_apellido;
    }

    // Dispositivo
    const marca = document.getElementById('marca_dispositivo')?.value.trim() || '';
    const modelo = document.getElementById('modelo_dispositivo')?.value.trim() || '';
    document.getElementById('resumenDispositivo').textContent =
        (marca || modelo) ? `${marca} ${modelo}`.trim() : '-';

    // Categoría
    document.getElementById('resumenCategoria').textContent =
        categoriaSeleccionada ? categoriaSeleccionada.nombre_categoria : '-';

    // Costo
    const costo = parseFloat(document.getElementById('costo_estimado')?.value) || 0;
    document.getElementById('resumenCosto').textContent = formatCurrency(costo);
}

// ============================================
// Guardar Servicio (POST/PATCH con FormData)
// ============================================
async function guardarServicio() {
    // Validar cliente (solo en creación)
    if (!clienteSeleccionado && !editingId) {
        showToast('Debe seleccionar un cliente', 'warning');
        return;
    }

    try {
        showLoader();
        const formData = new FormData();

        // Cliente (solo en creación)
        if (!editingId && clienteSeleccionado) {
            formData.append('id_cliente', clienteSeleccionado.id_cliente);
        }

        // Campos
        const campos = {
            marca_dispositivo: document.getElementById('marca_dispositivo').value.trim(),
            modelo_dispositivo: document.getElementById('modelo_dispositivo').value.trim(),
            descripcion_problema: document.getElementById('descripcion_problema').value.trim(),
            id_categoria: document.getElementById('id_categoria').value,
            costo_estimado: document.getElementById('costo_estimado').value
        };

        Object.entries(campos).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        // Estado (solo en edición)
        if (editingId) {
            formData.append('estado', document.getElementById('estado').value);
        }

        // Fotos
        ['foto_1', 'foto_2', 'foto_3'].forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input?.files?.[0]) {
                formData.append(fieldName, input.files[0]);
            }
        });

        let result;
        if (editingId) {
            result = await apiPatchFormData(`/servicios_tecnicos/${editingId}/`, formData);
            showToast('Servicio actualizado correctamente', 'success');
        } else {
            result = await apiPostFormData('/servicios_tecnicos/', formData);
            showToast(`Servicio ${result.numero_servicio} creado correctamente`, 'success');
        }

        cancelarNuevoServicio();
    } catch (error) {
        console.error('Error guardando servicio:', error);
        const errorMsg = error.response?.data?.detail || 'Error al guardar servicio';
        showToast(errorMsg, 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// Ver Detalle (Modal)
// ============================================
async function verDetalle(id) {
    try {
        showLoader();
        const servicio = await apiGet(`/servicios_tecnicos/${id}/`);

        document.getElementById('detalleNumero').textContent = servicio.numero_servicio || 'N/A';
        document.getElementById('detalleCliente').textContent = servicio.nombre_cliente || 'N/A';
        document.getElementById('detalleTelefono').textContent = servicio.celular_cliente || 'N/A';
        document.getElementById('detalleDispositivo').textContent =
            `${servicio.marca_dispositivo || ''} ${servicio.modelo_dispositivo || ''}`.trim() || 'N/A';
        document.getElementById('detalleCategoria').textContent = servicio.nombre_categoria || 'N/A';
        document.getElementById('detalleEstado').innerHTML = getEstadoBadge(servicio.estado);
        document.getElementById('detalleDescripcion').textContent = servicio.descripcion_problema || 'Sin descripción';
        document.getElementById('detalleCosto').textContent = formatCurrency(servicio.costo_estimado || 0);
        document.getElementById('detalleFecha').textContent = formatDate(servicio.fecha_inicio);
        document.getElementById('detalleUsuario').textContent = servicio.nombre_usuario || 'N/A';
        document.getElementById('detalleSucursal').textContent = servicio.nombre_sucursal || 'N/A';

        // Galería
        const galeria = document.getElementById('galeriaFotos');
        const fotos = [servicio.foto_1, servicio.foto_2, servicio.foto_3].filter(f => f);

        if (fotos.length > 0) {
            galeria.innerHTML = fotos.map(foto => `
                <div class="col-4">
                    <img src="${getImageUrl(foto)}" class="img-fluid rounded" style="cursor:pointer"
                         onclick="window.open('${getImageUrl(foto)}', '_blank')">
                </div>
            `).join('');
        } else {
            galeria.innerHTML = '<p class="text-muted">Sin fotos</p>';
        }

        new bootstrap.Modal(document.getElementById('modalDetalle')).show();
    } catch (error) {
        console.error('Error cargando detalle:', error);
        showToast('Error al cargar detalle del servicio', 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// Anular Servicio
// ============================================
let servicioAAnular = null;

function abrirModalAnular(idServicio, numeroServicio) {
    servicioAAnular = idServicio;
    document.getElementById('anularNumeroServicio').textContent = numeroServicio;
    new bootstrap.Modal(document.getElementById('anularServicioModal')).show();
}

async function confirmarAnulacion() {
    if (!servicioAAnular) return;

    try {
        showLoader();
        await apiPatch(`/servicios_tecnicos/${servicioAAnular}/anular/`, {});

        showToast('Servicio anulado correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('anularServicioModal')).hide();

        await loadServicios(currentPage);
    } catch (error) {
        console.error('Error anulando servicio:', error);
        const errorMsg = error.response?.data?.error || 'Error al anular servicio';
        showToast(errorMsg, 'danger');
    } finally {
        hideLoader();
    }
}

// ============================================
// Preview de Imágenes
// ============================================
function handleImagePreview(event, num) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const container = document.getElementById(`preview_container_${num}`);
        const img = document.getElementById(`preview_${num}`);
        if (container && img) {
            img.src = e.target.result;
            container.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// IMPRESIÓN DE BOLETAS
// ============================================

/**
 * Imprimir boleta de servicio técnico
 */
function imprimirBoletaServicio(idServicio) {
    if (typeof mostrarSelectorFormato === 'function') {
        mostrarSelectorFormato(idServicio);
    } else {
        console.error('Módulo de impresión no cargado');
        showToast('Error: Módulo de impresión no disponible', 'error');
    }
}

// Hacer la función globalmente accesible
window.imprimirBoletaServicio = imprimirBoletaServicio;
