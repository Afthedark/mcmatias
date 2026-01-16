/**
 * Módulo de Generación de Boletas de Venta
 * Soporta formatos adaptativos: Ticket 80mm y Boleta A4
 * 
 * @author MCMatias System
 * @version 1.0
 */

let formatoActual = 'A4'; // 'A4' o 'TICKET'
let ventaActual = null;

// ============================================
// Cargar Datos de Venta
// ============================================
async function cargarDatosVenta(idVenta) {
    try {
        // Cargar venta con detalles en paralelo
        const [venta, detallesResponse] = await Promise.all([
            apiGet(`/ventas/${idVenta}/`),
            apiGet(`/detalle_ventas/?id_venta=${idVenta}`)
        ]);

        ventaActual = {
            ...venta,
            detalles: detallesResponse.results || detallesResponse
        };

        return ventaActual;
    } catch (error) {
        console.error('Error cargando venta:', error);
        if (typeof showToast === 'function') {
            showToast('Error al cargar datos de la venta', 'error');
        }
        throw error;
    }
}

// ============================================
// Modal de Selección de Formato
// ============================================
function mostrarSelectorFormato(idVenta) {
    // Crear modal con botones
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
                        <p class="mb-4">¿Qué formato desea utilizar para la boleta?</p>
                        <div class="row mt-4">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-4" 
                                        onclick="seleccionarFormato('TICKET', ${idVenta})">
                                    <i class="bi bi-receipt fs-1 d-block mb-2"></i>
                                    <strong>Ticket 80mm</strong>
                                    <small class="d-block text-muted mt-1">Impresora térmica</small>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-4" 
                                        onclick="seleccionarFormato('A4', ${idVenta})">
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

    // Insertar y mostrar modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('modalFormatoImpresion');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Limpiar al cerrar
    modalElement.addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// ============================================
// Seleccionar Formato y Generar Boleta
// ============================================
async function seleccionarFormato(formato, idVenta) {
    formatoActual = formato;

    // Cerrar modal
    const modalElement = document.getElementById('modalFormatoImpresion');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }

    // Cargar datos y generar boleta
    await generarBoleta(idVenta, formato);
}

// ============================================
// Generar y Mostrar Boleta
// ============================================
async function generarBoleta(idVenta, formato = 'A4') {
    try {
        if (typeof showLoader === 'function') showLoader();

        // Cargar datos
        const venta = await cargarDatosVenta(idVenta);

        // Abrir ventana de boleta y llenar datos
        abrirVentanaImpresion(venta, formato);

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
function abrirVentanaImpresion(venta, formato) {
    // Crear nueva ventana
    const ventanaImpresion = window.open('boleta_ventas.html', '_blank', 'width=800,height=600');

    if (!ventanaImpresion) {
        alert('Por favor, permita ventanas emergentes para imprimir la boleta');
        return;
    }

    // Esperar a que cargue la ventana
    ventanaImpresion.addEventListener('load', function () {
        setTimeout(() => {
            try {
                // Llenar plantilla según formato
                if (formato === 'TICKET') {
                    llenarBoletaTicket(venta, ventanaImpresion.document);
                    // Asegurar que solo el ticket sea visible
                    ventanaImpresion.document.getElementById('boletaTicket').style.display = 'block';
                    ventanaImpresion.document.getElementById('boletaTicket').style.visibility = 'visible';
                    ventanaImpresion.document.getElementById('boletaA4').style.display = 'none';
                } else {
                    llenarBoletaA4(venta, ventanaImpresion.document);
                    // Asegurar que solo la boleta A4 sea visible
                    ventanaImpresion.document.getElementById('boletaA4').style.display = 'block';
                    ventanaImpresion.document.getElementById('boletaA4').style.visibility = 'visible';
                    ventanaImpresion.document.getElementById('boletaTicket').style.display = 'none';
                }

                // Agregar clase al body para indicar el formato
                ventanaImpresion.document.body.classList.add(formato === 'TICKET' ? 'formato-ticket' : 'formato-a4');

                // Esperar un poco y luego imprimir
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
function llenarBoletaTicket(venta, doc) {
    doc.getElementById('ticketSucursal').textContent = venta.nombre_sucursal || '';

    // Agregar dirección si existe
    const direccionElement = doc.getElementById('ticketDireccion');
    if (direccionElement && venta.direccion_sucursal) {
        direccionElement.textContent = venta.direccion_sucursal;
        direccionElement.style.display = 'block';
    } else if (direccionElement) {
        direccionElement.style.display = 'none';
    }

    doc.getElementById('ticketNumero').textContent = venta.numero_boleta;
    doc.getElementById('ticketFecha').textContent = formatDate(venta.fecha_venta, true);
    doc.getElementById('ticketCliente').textContent = venta.nombre_cliente || 'Cliente General';
    doc.getElementById('ticketTotal').textContent = formatCurrency(venta.total_venta);
    doc.getElementById('ticketMetodo').textContent = venta.tipo_pago;
    doc.getElementById('ticketUsuario').textContent = venta.nombre_usuario || '';

    // Tabla de productos
    const tbody = doc.getElementById('ticketProductos');
    tbody.innerHTML = venta.detalles.map(detalle => `
        <tr>
            <td>${detalle.nombre_producto}</td>
            <td style="text-align: right;">Bs ${parseFloat(detalle.precio_venta * detalle.cantidad).toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="2" style="font-size: 7pt; color: #666;">
                ${detalle.cantidad} x Bs ${parseFloat(detalle.precio_venta).toFixed(2)}
            </td>
        </tr>
    `).join('');

    // Marca de anulación
    if (venta.estado === 'Anulada') {
        doc.getElementById('ticketAnulada').style.display = 'block';
        doc.querySelector('#ticketAnulada .anulada-motivo').textContent =
            `Motivo: ${venta.motivo_anulacion || 'No especificado'}`;
    }

    // Mostrar formato correcto
    doc.getElementById('boletaTicket').style.display = 'block';
    doc.getElementById('boletaA4').style.display = 'none';
}

// ============================================
// Llenar Plantilla A4
// ============================================
function llenarBoletaA4(venta, doc) {
    doc.getElementById('boletaSucursal').textContent = venta.nombre_sucursal || '';
    doc.getElementById('boletaDireccion').textContent = venta.direccion_sucursal || '';
    doc.getElementById('boletaNumero').textContent = venta.numero_boleta;

    // Fecha formateada completa
    const fecha = new Date(venta.fecha_venta);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.getElementById('boletaFecha').textContent = fechaFormateada;

    doc.getElementById('boletaCliente').textContent = venta.nombre_cliente || 'Cliente General';
    doc.getElementById('boletaTotal').textContent = formatCurrency(venta.total_venta);
    doc.getElementById('boletaMetodo').textContent = venta.tipo_pago;
    doc.getElementById('boletaUsuario').textContent = venta.nombre_usuario || '';

    // Tabla de productos
    const tbody = doc.getElementById('boletaProductos');
    tbody.innerHTML = venta.detalles.map(detalle => `
        <tr>
            <td>${detalle.nombre_producto}</td>
            <td>${detalle.cantidad}</td>
            <td>Bs ${parseFloat(detalle.precio_venta).toFixed(2)}</td>
            <td>Bs ${parseFloat(detalle.precio_venta * detalle.cantidad).toFixed(2)}</td>
        </tr>
    `).join('');

    // Marca de anulación
    if (venta.estado === 'Anulada') {
        doc.getElementById('boletaAnulada').style.display = 'block';
        doc.querySelector('#boletaAnulada .anulada-motivo').textContent =
            `Motivo: ${venta.motivo_anulacion || 'No especificado'}`;
        doc.querySelector('#boletaAnulada .anulada-fecha').textContent =
            `Anulada el: ${formatDate(venta.fecha_anulacion)}`;
    }

    // Mostrar formato correcto
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

// ============================================
// Exponer funciones globalmente
// ============================================
window.mostrarSelectorFormato = mostrarSelectorFormato;
window.seleccionarFormato = seleccionarFormato;
window.generarBoleta = generarBoleta;
