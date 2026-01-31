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
    // Crear modal simplificado (solo formato oficial)
    const modalHTML = `
        <div class="modal fade" id="modalFormatoImpresion" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center pt-0 pb-4">
                        <div class="mb-4">
                            <i class="bi bi-printer-fill text-primary" style="font-size: 3rem;"></i>
                            <h4 class="mt-2">Imprimir Boleta de Venta</h4>
                            <p class="text-muted">Generar documento en formato oficial</p>
                        </div>
                        
                        <div class="row justify-content-center">
                            <div class="col-10">
                                <button class="btn btn-primary w-100 p-3 shadow-sm" 
                                        onclick="seleccionarFormato('PANORAMICA', ${idVenta})">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-file-earmark-richtext fs-3 me-3"></i>
                                        <div class="text-start">
                                            <div class="fw-bold fs-5">Formato Oficial</div>
                                            <small class="text-white-50">21cm x 9cm (Panorámico)</small>
                                        </div>
                                    </div>
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
                // Ocultar todo primero
                ventanaImpresion.document.getElementById('boletaTicket').style.display = 'none';
                ventanaImpresion.document.getElementById('boletaA4').style.display = 'none';
                ventanaImpresion.document.getElementById('boletaPanoramica').style.display = 'none';

                let claseBody = '';

                if (formato === 'TICKET') {
                    llenarBoletaTicket(venta, ventanaImpresion.document);
                    claseBody = 'formato-ticket';
                } else if (formato === 'A4') {
                    llenarBoletaA4(venta, ventanaImpresion.document);
                    claseBody = 'formato-a4';
                } else if (formato === 'PANORAMICA') {
                    llenarBoletaPanoramica(venta, ventanaImpresion.document);
                    claseBody = 'formato-panoramica';
                }

                ventanaImpresion.document.body.className = claseBody;

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
// Llenar Plantilla PANORAMICA (21x9)
// ============================================
function llenarBoletaPanoramica(venta, doc) {
    const container = doc.getElementById('boletaPanoramica');

    // Datos comunes
    const numeroBoleta = venta.numero_boleta || '';
    container.querySelectorAll('.cuerpo-numero').forEach(el => el.textContent = numeroBoleta);
    
    // Código ST Discreto (ej: VTA-2026-00009)
    container.querySelectorAll('.codigo-st-discreto').forEach(el => {
        el.textContent = numeroBoleta;
    });

    const fechaVenta = formatDate(venta.fecha_venta, true);
    container.querySelectorAll('.fecha-venta-val').forEach(el => el.textContent = fechaVenta);

    container.querySelectorAll('.sucursal-nombre-full').forEach(el => {
        el.textContent = venta.nombre_sucursal || '';
    });

    const dirContainer = container.querySelector('.sucursal-direccion');
    if (dirContainer) dirContainer.textContent = venta.direccion_sucursal || '';

    const fonosContainer = container.querySelector('.sucursal-fonos');
    if (fonosContainer) {
        let fonos = [];
        if (venta.cel1_sucursal) fonos.push(venta.cel1_sucursal);
        if (venta.cel2_sucursal) fonos.push(venta.cel2_sucursal);
        fonosContainer.textContent = fonos.join(' - ');
    }

    container.querySelectorAll('.cliente-nombre').forEach(el => el.textContent = venta.nombre_cliente || 'Cliente General');

    const total = formatCurrency(venta.total_venta || 0);
    container.querySelectorAll('.monto-total').forEach(el => el.textContent = total);
    container.querySelectorAll('.tipo-pago').forEach(el => el.textContent = venta.tipo_pago || '-');

    // Firmas y Nombres
    const vendedorFirma = doc.getElementById('nombreVendedorFirma');
    if (vendedorFirma) vendedorFirma.textContent = venta.nombre_usuario || '';

    const clienteFirma = doc.getElementById('nombreClienteFirma');
    if (clienteFirma) {
        clienteFirma.textContent = (venta.nombre_cliente && venta.nombre_cliente !== 'Cliente General') 
            ? venta.nombre_cliente 
            : '';
    }

    // Tabla de productos cuerpo (Derecho)
    const cuerpoBody = container.querySelector('.productos-cuerpo-body');
    cuerpoBody.innerHTML = venta.detalles.map(d => `
        <tr>
            <td>${d.cantidad}</td>
            <td style="text-align: left;">${d.nombre_producto}</td>
            <td>${formatCurrency(d.precio_venta)}</td>
            <td>${formatCurrency(d.precio_venta * d.cantidad)}</td>
        </tr>
    `).join('');

    // Pie de página
    const fechaHoy = new Date().toLocaleDateString('es-ES');
    container.querySelectorAll('.fecha-hoy').forEach(el => el.textContent = fechaHoy);

    // Marca de anulación
    if (venta.estado === 'Anulada') {
        doc.getElementById('panoramicaAnulada').style.display = 'block';
    }

    doc.getElementById('boletaPanoramica').style.display = 'block';
    doc.getElementById('boletaTicket').style.display = 'none';
    doc.getElementById('boletaA4').style.display = 'none';
}

// ============================================
// Llenar Plantilla TICKET
// ============================================
function llenarBoletaTicket(venta, doc) {
    doc.getElementById('ticketSucursal').textContent = venta.nombre_sucursal || '';

    // Agregar dirección si existe
    const direccionElement = doc.getElementById('ticketDireccion');
    if (direccionElement) {
        if (venta.direccion_sucursal) {
            direccionElement.innerHTML = venta.direccion_sucursal;

            // Construir línea de celulares
            let celText = '';
            if (venta.cel1_sucursal && venta.cel2_sucursal) {
                celText = `${venta.cel1_sucursal} - ${venta.cel2_sucursal}`;
            } else if (venta.cel1_sucursal || venta.cel2_sucursal) {
                celText = venta.cel1_sucursal || venta.cel2_sucursal;
            }

            if (celText) {
                direccionElement.innerHTML += `<br>${celText}`;
            }
            direccionElement.style.display = 'block';
        } else {
            direccionElement.style.display = 'none';
        }
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
    doc.getElementById('boletaSucursal').textContent = venta.nombre_sucursal || '';

    // Dirección y Celulares
    let dirText = venta.direccion_sucursal || '';
    let celTextA4 = '';
    if (venta.cel1_sucursal && venta.cel2_sucursal) {
        celTextA4 = `${venta.cel1_sucursal} - ${venta.cel2_sucursal}`;
    } else if (venta.cel1_sucursal || venta.cel2_sucursal) {
        celTextA4 = venta.cel1_sucursal || venta.cel2_sucursal;
    }

    if (dirText && celTextA4) {
        dirText += ` - ${celTextA4}`;
    } else if (celTextA4) {
        dirText = celTextA4;
    }

    doc.getElementById('boletaDireccion').textContent = dirText;
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
