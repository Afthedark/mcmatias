/**
 * Módulo de Generación de Boletas de Servicio Técnico
 * Soporta formatos adaptativos: Ticket 80mm y Boleta A4
 * 
 * @author MCMatias System
 * @version 1.0
 */

let formatoActual = 'A4'; // 'A4' o 'TICKET'
let servicioActual = null;

// ============================================
// Cargar Datos de Servicio
// ============================================
async function cargarDatosServicio(idServicio) {
    try {
        const servicio = await apiGet(`/servicios_tecnicos/${idServicio}/`);
        servicioActual = servicio;
        return servicioActual;
    } catch (error) {
        console.error('Error cargando servicio:', error);
        if (typeof showToast === 'function') {
            showToast('Error al cargar datos del servicio', 'error');
        }
        throw error;
    }
}

// ============================================
// Modal de Selección de Formato
// ============================================
function mostrarSelectorFormato(idServicio) {
    const modalHTML = `
        <div class="modal fade" id="modalFormatoImpresion" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-printer me-2"></i>
                            Seleccionar Formato de Impresión
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="mb-4">¿Qué formato desea utilizar para la orden de servicio?</p>
                        <div class="row mt-4">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-4" 
                                        onclick="seleccionarFormato('TICKET', ${idServicio})">
                                    <i class="bi bi-receipt fs-1 d-block mb-2"></i>
                                    <strong>Ticket 80mm</strong>
                                    <small class="d-block text-muted mt-1">Impresora térmica</small>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-4" 
                                        onclick="seleccionarFormato('A4', ${idServicio})">
                                    <i class="bi bi-file-earmark-text fs-1 d-block mb-2"></i>
                                    <strong>Boleta A4</strong>
                                    <small class="d-block text-muted mt-1">Impresora estándar</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('modalFormatoImpresion');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    modalElement.addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// ============================================
// Seleccionar Formato y Generar Boleta
// ============================================
async function seleccionarFormato(formato, idServicio) {
    formatoActual = formato;

    const modalElement = document.getElementById('modalFormatoImpresion');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }

    await generarBoleta(idServicio, formato);
}

// ============================================
// Generar y Mostrar Boleta
// ============================================
async function generarBoleta(idServicio, formato = 'A4') {
    try {
        if (typeof showLoader === 'function') showLoader();

        const servicio = await cargarDatosServicio(idServicio);
        abrirVentanaImpresion(servicio, formato);

        if (typeof hideLoader === 'function') hideLoader();

    } catch (error) {
        if (typeof hideLoader === 'function') hideLoader();
        console.error('Error generando boleta:', error);
        if (typeof showToast === 'function') {
            showToast('Error al generar la boleta', 'error');
        }
    }
}

// ============================================
// Abrir Ventana de Impresión
// ============================================
function abrirVentanaImpresion(servicio, formato) {
    const ventanaImpresion = window.open('boleta_servicio.html', '_blank', 'width=800,height=600');

    if (!ventanaImpresion) {
        alert('Por favor, permita ventanas emergentes para imprimir la boleta');
        return;
    }

    ventanaImpresion.addEventListener('load', function () {
        setTimeout(() => {
            try {
                if (formato === 'TICKET') {
                    llenarBoletaTicket(servicio, ventanaImpresion.document);
                    ventanaImpresion.document.getElementById('boletaTicket').style.display = 'block';
                    ventanaImpresion.document.getElementById('boletaTicket').style.visibility = 'visible';
                    ventanaImpresion.document.getElementById('boletaA4').style.display = 'none';
                } else {
                    llenarBoletaA4(servicio, ventanaImpresion.document);
                    ventanaImpresion.document.getElementById('boletaA4').style.display = 'block';
                    ventanaImpresion.document.getElementById('boletaA4').style.visibility = 'visible';
                    ventanaImpresion.document.getElementById('boletaTicket').style.display = 'none';
                }

                ventanaImpresion.document.body.classList.add(formato === 'TICKET' ? 'formato-ticket' : 'formato-a4');

                setTimeout(() => {
                    ventanaImpresion.print();
                }, 500);

            } catch (error) {
                console.error('Error llenando boleta:', error);
            }
        }, 100);
    });
}

// ============================================
// Llenar Plantilla TICKET
// ============================================
function llenarBoletaTicket(servicio, doc) {
    doc.getElementById('ticketSucursal').textContent = servicio.nombre_sucursal || '';

    const direccionElement = doc.getElementById('ticketDireccion');
    if (direccionElement && servicio.direccion_sucursal) {
        direccionElement.textContent = servicio.direccion_sucursal;
        direccionElement.style.display = 'block';
    } else if (direccionElement) {
        direccionElement.style.display = 'none';
    }

    doc.getElementById('ticketNumero').textContent = servicio.numero_servicio;
    doc.getElementById('ticketFecha').textContent = formatDate(servicio.fecha_inicio, true);
    doc.getElementById('ticketCliente').textContent = servicio.nombre_cliente || 'Cliente';

    const celularElement = doc.getElementById('ticketCelular');
    if (celularElement && servicio.celular_cliente) {
        celularElement.querySelector('span').textContent = servicio.celular_cliente;
        celularElement.style.display = 'block';
    } else if (celularElement) {
        celularElement.style.display = 'none';
    }

    doc.getElementById('ticketMarca').textContent = servicio.marca_dispositivo || 'N/A';
    doc.getElementById('ticketModelo').textContent = servicio.modelo_dispositivo || 'N/A';
    doc.getElementById('ticketCategoria').textContent = servicio.nombre_categoria || 'General';
    doc.getElementById('ticketProblema').textContent = servicio.descripcion_problema || 'No especificado';

    const estadoBadge = doc.getElementById('ticketEstado');
    estadoBadge.textContent = servicio.estado;
    estadoBadge.className = 'badge ' + getBadgeClass(servicio.estado);

    doc.getElementById('ticketCosto').textContent = formatCurrency(servicio.costo_estimado || 0);
    doc.getElementById('ticketUsuario').textContent = servicio.nombre_usuario || '';

    if (servicio.estado === 'Anulado') {
        doc.getElementById('ticketAnulado').style.display = 'block';
    }

    doc.getElementById('boletaTicket').style.display = 'block';
    doc.getElementById('boletaA4').style.display = 'none';
}

// ============================================
// Llenar Plantilla A4
// ============================================
function llenarBoletaA4(servicio, doc) {
    doc.getElementById('boletaSucursal').textContent = servicio.nombre_sucursal || '';
    doc.getElementById('boletaDireccion').textContent = servicio.direccion_sucursal || '';
    doc.getElementById('boletaNumero').textContent = servicio.numero_servicio;

    const fecha = new Date(servicio.fecha_inicio);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.getElementById('boletaFecha').textContent = fechaFormateada;

    doc.getElementById('boletaCliente').textContent = servicio.nombre_cliente || 'Cliente';

    const celularElement = doc.getElementById('boletaCelular');
    if (celularElement && servicio.celular_cliente) {
        celularElement.querySelector('span').textContent = servicio.celular_cliente;
        celularElement.style.display = 'block';
    } else if (celularElement) {
        celularElement.style.display = 'none';
    }

    doc.getElementById('boletaMarca').textContent = servicio.marca_dispositivo || 'No especificado';
    doc.getElementById('boletaModelo').textContent = servicio.modelo_dispositivo || 'No especificado';
    doc.getElementById('boletaCategoria').textContent = servicio.nombre_categoria || 'General';
    doc.getElementById('boletaProblema').textContent = servicio.descripcion_problema || 'No especificado';

    const estadoBadge = doc.getElementById('boletaEstado');
    estadoBadge.textContent = servicio.estado;
    estadoBadge.className = 'badge ' + getBadgeClass(servicio.estado);

    doc.getElementById('boletaCosto').textContent = formatCurrency(servicio.costo_estimado || 0);
    doc.getElementById('boletaUsuario').textContent = servicio.nombre_usuario || '';

    if (servicio.estado === 'Anulado') {
        doc.getElementById('boletaAnulado').style.display = 'block';
    }

    doc.getElementById('boletaTicket').style.display = 'none';
    doc.getElementById('boletaA4').style.display = 'block';
}

// ============================================
// Funciones de Utilidad
// ============================================
function formatDate(dateString, short = false) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (short) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
}

function getBadgeClass(estado) {
    const badgeMap = {
        'En Reparación': 'badge-reparacion',
        'Para Retirar': 'badge-retirar',
        'Entregado': 'badge-entregado',
        'Anulado': 'badge-anulado'
    };
    return badgeMap[estado] || 'badge-reparacion';
}

// ============================================
// Exponer funciones globalmente
// ============================================
window.mostrarSelectorFormato = mostrarSelectorFormato;
window.seleccionarFormato = seleccionarFormato;
window.generarBoleta = generarBoleta;
