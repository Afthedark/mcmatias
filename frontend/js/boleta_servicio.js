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
                        <div class="row g-3">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-3 h-100" 
                                        onclick="seleccionarFormato('TICKET', ${idServicio})">
                                    <i class="bi bi-receipt fs-1 d-block mb-2"></i>
                                    <strong>Ticket 80mm</strong>
                                    <small class="d-block text-muted mt-1">Impresora térmica</small>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-3 h-100" 
                                        onclick="seleccionarFormato('A4', ${idServicio})">
                                    <i class="bi bi-file-earmark-text fs-1 d-block mb-2"></i>
                                    <strong>Boleta A4</strong>
                                    <small class="d-block text-muted mt-1">Impresora estándar</small>
                                </button>
                            </div>
                            <div class="col-12">
                                <button class="btn btn-outline-success w-100 p-3" 
                                        onclick="seleccionarFormato('PANORAMICA', ${idServicio})">
                                    <i class="bi bi-card-heading fs-1 d-block mb-2"></i>
                                    <strong>Formato 21.5x9cm</strong>
                                    <small class="d-block text-muted mt-1">Orden de Servicio / Nota de Entrega</small>
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
        // Extraer solo el número (ej: 6693 de ST-2026-06693)
        const num = servicio.numero_servicio.split('-').pop();
        el.textContent = parseInt(num); // Quitar ceros a la izquierda
    });

    // Sucursal
    container.querySelectorAll('.talon-sucursal-nombre, .sucursal-nombre-full').forEach(el => {
        el.textContent = servicio.nombre_sucursal || '';
    });

    // Fechas
    const fechaIngreso = formatDate(servicio.fecha_inicio, true) + ' ' + 
                        new Date(servicio.fecha_inicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
    
    const fechaEntrega = servicio.fecha_entrega ? 
                        formatDate(servicio.fecha_entrega, true) + ' ' + new Date(servicio.fecha_entrega).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : 
                        'Pendiente';

    container.querySelectorAll('.fecha-ingreso-val').forEach(el => el.textContent = fechaIngreso);
    container.querySelectorAll('.fecha-entrega-val').forEach(el => el.textContent = fechaEntrega);
    
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

    // ==========================================
    // DATOS ESPECÍFICOS POR TIPO
    // ==========================================
    
    if (esEntrega) {
        // NOTA DE ENTREGA
        container.querySelectorAll('.fecha-entrega-real').forEach(el => el.textContent = fechaEntrega);
        container.querySelectorAll('.diagnostico-final').forEach(el => el.textContent = 'Revisión'); // Valor por defecto o campo futuro
        container.querySelectorAll('.solucion-final').forEach(el => el.textContent = 'MANTENIMIENTO'); // Valor por defecto o campo futuro
    } else {
        // ORDEN DE SERVICIO
        container.querySelectorAll('.servicio-id').forEach(el => el.textContent = '1'); // Placeholder
        container.querySelectorAll('.falla-desc').forEach(el => el.textContent = servicio.descripcion_problema || '');
        container.querySelectorAll('.estado-val').forEach(el => el.textContent = servicio.estado.toUpperCase());
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
