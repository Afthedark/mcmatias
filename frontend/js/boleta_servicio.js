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
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center pt-0 pb-4">
                        <div class="mb-4">
                            <i class="bi bi-printer-fill text-primary" style="font-size: 3rem;"></i>
                            <h4 class="mt-2">Imprimir Orden de Servicio</h4>
                            <p class="text-muted">Generar documento en formato oficial</p>
                        </div>
                        
                        <div class="row justify-content-center">
                            <div class="col-10">
                                <button class="btn btn-primary w-100 p-3 shadow-sm" 
                                        onclick="seleccionarFormato('PANORAMICA', ${idServicio})">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-file-earmark-richtext fs-3 me-3"></i>
                                        <div class="text-start">
                                            <div class="fw-bold fs-5">Formato Oficial</div>
                                            <small class="text-white-50">21.5cm x 9cm (Panorámico)</small>
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
    const ventanaImpresion = window.open('boleta_servicio.html', '_blank', 'width=1000,height=600');

    if (!ventanaImpresion) {
        alert('Por favor, permita ventanas emergentes para imprimir la boleta');
        return;
    }

    ventanaImpresion.addEventListener('load', function () {
        setTimeout(() => {
            try {
                const doc = ventanaImpresion.document;
                
                // Ocultar todo primero
                doc.getElementById('boletaTicket').style.display = 'none';
                doc.getElementById('boletaA4').style.display = 'none';
                doc.getElementById('boletaPanoramica').style.display = 'none';

                let claseBody = '';

                if (formato === 'TICKET') {
                    llenarBoletaTicket(servicio, doc);
                    doc.getElementById('boletaTicket').style.display = 'block';
                    claseBody = 'formato-ticket';
                } else if (formato === 'A4') {
                    llenarBoletaA4(servicio, doc);
                    doc.getElementById('boletaA4').style.display = 'block';
                    claseBody = 'formato-a4';
                } else if (formato === 'PANORAMICA') {
                    llenarBoletaPanoramica(servicio, doc);
                    doc.getElementById('boletaPanoramica').style.display = 'block';
                    claseBody = 'formato-panoramica';
                }

                doc.body.className = claseBody;

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
// Llenar Plantilla PANORAMICA (21.5x9)
// ============================================
function llenarBoletaPanoramica(servicio, doc) {
    // Determinar qué sub-formato usar: Orden de Servicio (Recepción) o Nota de Entrega (Salida)
    const esEntrega = servicio.estado === 'Entregado' || servicio.estado === 'Para Retirar';
    
    // Ocultar ambos sub-formatos primero
    doc.getElementById('formatoOrdenServicio').style.display = 'none';
    doc.getElementById('formatoNotaEntrega').style.display = 'none';

    // Seleccionar contenedor activo
    const containerId = esEntrega ? 'formatoNotaEntrega' : 'formatoOrdenServicio';
    const container = doc.getElementById(containerId);
    container.style.display = 'block';

    // ==========================================
    // DATOS COMUNES
    // ==========================================
    
    // Números de Orden
    container.querySelectorAll('.talon-numero, .cuerpo-numero').forEach(el => {
        const raw = (servicio.numero_servicio || '').toString();
        const lastPart = raw.split('-').pop() || '';
        const orderNum = parseInt(lastPart, 10);
        el.textContent = Number.isFinite(orderNum) ? String(orderNum) : (raw || String(servicio.id_servicio || ''));
    });

    // Sucursal
    container.querySelectorAll('.talon-sucursal-nombre, .sucursal-nombre-full').forEach(el => {
        el.textContent = servicio.nombre_sucursal || '';
    });

    function formatDateTimeCompact(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date
            .toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            .replace(',', '')
            .trim();
    }

    function formatDateOnly(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Fechas
    const fechaIngreso = formatDateTimeCompact(servicio.fecha_inicio);
    const fechaIngresoShort = formatDateOnly(servicio.fecha_inicio);

    const fechaEntrega = servicio.fecha_entrega ? formatDateTimeCompact(servicio.fecha_entrega) : 'Pendiente';
    const fechaEntregaShort = servicio.fecha_entrega ? formatDateOnly(servicio.fecha_entrega) : 'Pendiente';

    container.querySelectorAll('.fecha-ingreso-val').forEach(el => el.textContent = fechaIngreso);
    container.querySelectorAll('.fecha-ingreso-short').forEach(el => el.textContent = fechaIngresoShort);
    
    container.querySelectorAll('.fecha-entrega-val').forEach(el => el.textContent = fechaEntrega);
    container.querySelectorAll('.fecha-entrega-short').forEach(el => el.textContent = fechaEntregaShort);
    
    // Fecha actual (Pie de página)
    const fechaHoy = new Date().toLocaleDateString('es-ES');
    container.querySelectorAll('.fecha-hoy').forEach(el => el.textContent = fechaHoy);

    // Cliente
    container.querySelectorAll('.cliente-nombre').forEach(el => el.textContent = servicio.nombre_cliente || '');
    container.querySelectorAll('.cliente-celular').forEach(el => el.textContent = servicio.celular_cliente || '');

    // Técnico
    container.querySelectorAll('.tecnico-nombre').forEach(el => el.textContent = servicio.nombre_tecnico_asignado || 'Sin asignar');

    // Financiero
    const total = formatCurrency(servicio.costo_estimado || 0);
    const adelanto = formatCurrency(servicio.adelanto || 0);
    const saldo = formatCurrency(servicio.saldo || 0);

    container.querySelectorAll('.monto-total').forEach(el => el.textContent = total);
    container.querySelectorAll('.monto-adelanto').forEach(el => el.textContent = adelanto);
    container.querySelectorAll('.monto-saldo').forEach(el => el.textContent = saldo);

    // Dispositivo
    const dispositivo = `${servicio.marca_dispositivo || ''} ${servicio.modelo_dispositivo || ''}`.trim();
    container.querySelectorAll('.dispositivo-desc, .dispositivo-full').forEach(el => el.textContent = dispositivo);

    // Servicio (categoría)
    // Priorizamos nombre_categoria para mostrar texto legible en lugar de ID
    const servicioIdValue = servicio.nombre_categoria || (servicio.id_categoria ? String(servicio.id_categoria) : '-');
    container.querySelectorAll('.servicio-id').forEach(el => el.textContent = servicioIdValue);

    // ==========================================
    // DATOS ESPECÍFICOS POR TIPO
    // ==========================================
    
    if (esEntrega) {
        // NOTA DE ENTREGA
        container.querySelectorAll('.fecha-entrega-real').forEach(el => el.textContent = fechaEntrega);
        container.querySelectorAll('.diagnostico-final').forEach(el => el.textContent = 'Revisión');
        container.querySelectorAll('.solucion-final').forEach(el => el.textContent = 'MANTENIMIENTO');

        const notaFecha = container.querySelector('.nota-fecha');
        if (notaFecha) {
            notaFecha.textContent = fechaEntrega === 'Pendiente' ? '_________________' : fechaEntrega;
        }
    } else {
        // ORDEN DE SERVICIO
        container.querySelectorAll('.falla-desc').forEach(el => el.textContent = servicio.descripcion_problema || '');
        container.querySelectorAll('.estado-val').forEach(el => el.textContent = (servicio.estado || 'Pendiente').toString().toUpperCase());
        container.querySelectorAll('.diagnostico-desc').forEach(el => el.textContent = 'Revisión');
        container.querySelectorAll('.solucion-desc').forEach(el => el.textContent = 'Revisión');
    }

    // Dirección Sucursal (si existe elemento)
    const dirContainer = container.querySelector('.sucursal-direccion');
    if (dirContainer && servicio.direccion_sucursal) {
        dirContainer.textContent = servicio.direccion_sucursal;
    }
    
    const fonosContainer = container.querySelector('.sucursal-fonos');
    if (fonosContainer) {
        let fonos = [];
        if (servicio.cel1_sucursal) fonos.push(servicio.cel1_sucursal);
        if (servicio.cel2_sucursal) fonos.push(servicio.cel2_sucursal);
        fonosContainer.textContent = fonos.join(' - ');
    }
}


// ============================================
// Llenar Plantilla TICKET
// ============================================
function llenarBoletaTicket(servicio, doc) {
    doc.getElementById('ticketSucursal').textContent = servicio.nombre_sucursal || '';

    const direccionElement = doc.getElementById('ticketDireccion');
    if (direccionElement) {
        if (servicio.direccion_sucursal) {
            direccionElement.innerHTML = servicio.direccion_sucursal;

            // Construir línea de celulares
            let celText = '';
            if (servicio.cel1_sucursal && servicio.cel2_sucursal) {
                celText = `${servicio.cel1_sucursal} - ${servicio.cel2_sucursal}`;
            } else if (servicio.cel1_sucursal || servicio.cel2_sucursal) {
                celText = servicio.cel1_sucursal || servicio.cel2_sucursal;
            }

            if (celText) {
                direccionElement.innerHTML += `<br>${celText}`;
            }
            direccionElement.style.display = 'block';
        } else {
            direccionElement.style.display = 'none';
        }
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
    doc.getElementById('ticketAdelanto').textContent = formatCurrency(servicio.adelanto || 0);
    doc.getElementById('ticketSaldo').textContent = formatCurrency(servicio.saldo || 0);
    doc.getElementById('ticketUsuario').textContent = servicio.nombre_tecnico_asignado || 'Sin asignar';

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
    doc.getElementById('boletaSucursal').textContent = servicio.nombre_sucursal || '';

    // Dirección y Celulares
    let dirText = servicio.direccion_sucursal || '';
    let celTextA4 = '';
    if (servicio.cel1_sucursal && servicio.cel2_sucursal) {
        celTextA4 = `${servicio.cel1_sucursal} - ${servicio.cel2_sucursal}`;
    } else if (servicio.cel1_sucursal || servicio.cel2_sucursal) {
        celTextA4 = servicio.cel1_sucursal || servicio.cel2_sucursal;
    }

    if (dirText && celTextA4) {
        dirText += ` - ${celTextA4}`;
    } else if (celTextA4) {
        dirText = celTextA4;
    }

    doc.getElementById('boletaDireccion').textContent = dirText;
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
    doc.getElementById('boletaAdelanto').textContent = formatCurrency(servicio.adelanto || 0);
    doc.getElementById('boletaSaldo').textContent = formatCurrency(servicio.saldo || 0);
    doc.getElementById('boletaUsuario').textContent = servicio.nombre_tecnico_asignado || 'Sin asignar';

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
