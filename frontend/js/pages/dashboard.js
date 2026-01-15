/**
 * Dashboard Page Logic
 * Client-side Data Processing - Loads real data and calculates KPIs
 */

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    showLoader();

    try {
        // 1. Fetch data in parallel (optimized)
        const [ventasRes, productosRes, clientesRes, serviciosRes] = await Promise.all([
            apiGet('/ventas/?page_size=1000'),  // Get recent sales
            apiGet('/productos/?page_size=1'),  // Only need count
            apiGet('/clientes/?page_size=1'),   // Only need count
            apiGet('/servicios_tecnicos/?page_size=5')  // Get latest 5 services
        ]);

        const ventas = ventasRes.results || ventasRes;
        const totalProductos = productosRes.count || (Array.isArray(productosRes) ? productosRes.length : 0);
        const totalClientes = clientesRes.count || (Array.isArray(clientesRes) ? clientesRes.length : 0);
        const servicios = serviciosRes.results || serviciosRes;
        const totalServicios = serviciosRes.count || (Array.isArray(serviciosRes) ? serviciosRes.length : 0);

        // 2. Client-side Processing
        processAndRenderKPIs(ventas, totalProductos, totalClientes, totalServicios);

        // 3. Render Latest Tables
        renderLatestSalesTable(ventas.slice(0, 5));
        renderLatestServicesTable(servicios.slice(0, 5));

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error al cargar datos del dashboard', 'danger');

        // Fallback to empty state
        document.getElementById('totalVentas').textContent = '0';
        document.getElementById('totalProductos').textContent = '0';
        document.getElementById('totalClientes').textContent = '0';
        document.getElementById('totalServicios').textContent = '0';
    } finally {
        hideLoader();
    }
}

/**
 * Process sales data and calculate KPIs
 */
function processAndRenderKPIs(ventas, totalProductos, totalClientes, totalServicios) {
    // Filter out cancelled sales
    const ventasValidas = ventas.filter(v => v.estado !== 'Anulada');

    // Get current month's sales
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ventasMes = ventasValidas.filter(v => {
        const fechaVenta = new Date(v.fecha_venta);
        return fechaVenta >= startOfMonth;
    });

    // Calculate KPIs
    const totalIngresosMes = ventasMes.reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);
    const cantidadVentasMes = ventasMes.length;
    const ticketPromedio = cantidadVentasMes > 0 ? totalIngresosMes / cantidadVentasMes : 0;

    // Count active services (not "Entregado")
    const serviciosActivos = totalServicios; // Backend already filters by user's branch

    // Render KPIs
    document.getElementById('totalVentas').innerHTML = `
        <strong>${cantidadVentasMes}</strong>
        <small class="d-block text-muted" style="font-size: 0.75rem; margin-top: 4px;">
            ${formatCurrency(totalIngresosMes)}
        </small>
    `;

    document.getElementById('totalProductos').textContent = totalProductos.toLocaleString();
    document.getElementById('totalClientes').textContent = totalClientes.toLocaleString();
    document.getElementById('totalServicios').textContent = serviciosActivos.toLocaleString();

    // Log stats for debugging
    console.log('Dashboard Stats:', {
        ventasDelMes: cantidadVentasMes,
        ingresosDelMes: totalIngresosMes,
        ticketPromedio: ticketPromedio,
        totalVentas: ventas.length,
        ventasValidas: ventasValidas.length
    });
}

/**
 * Render latest sales table
 */
function renderLatestSalesTable(ventas) {
    const tbody = document.getElementById('lastSalesTable');

    if (!ventas || ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay ventas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ventas.map(venta => {
        const esAnulada = venta.estado === 'Anulada';
        const rowClass = esAnulada ? 'table-secondary text-decoration-line-through' : '';

        return `
            <tr class="${rowClass}">
                <td><strong>${venta.numero_boleta || 'N/A'}</strong></td>
                <td>${venta.nombre_cliente || 'Sin cliente'}</td>
                <td>${formatDate(venta.fecha_venta)}</td>
                <td>
                    ${formatCurrency(venta.total_venta)}
                    ${esAnulada ? '<span class="badge bg-danger ms-2">Anulada</span>' : ''}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render latest services table
 */
function renderLatestServicesTable(servicios) {
    const tbody = document.getElementById('lastServicesTable');

    if (!servicios || servicios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay servicios registrados</td></tr>';
        return;
    }

    tbody.innerHTML = servicios.map(servicio => {
        const esAnulado = servicio.estado === 'Anulado';
        const rowClass = esAnulado ? 'table-secondary text-decoration-line-through' : '';

        return `
            <tr class="${rowClass}">
                <td><strong>${servicio.numero_servicio || 'N/A'}</strong></td>
                <td>${servicio.nombre_cliente || 'Sin cliente'}</td>
                <td>${servicio.marca_dispositivo || ''} ${servicio.modelo_dispositivo || ''}</td>
                <td>${getDashboardEstadoBadge(servicio.estado)}</td>
                <td>${formatDate(servicio.fecha_inicio)}</td>
            </tr>
        `;
    }).join('');
}

function getDashboardEstadoBadge(estado) {
    const estados = {
        'En Reparación': '<span class="badge bg-primary">🔵 En Reparación</span>',
        'Para Retirar': '<span class="badge bg-warning text-dark">🟡 Para Retirar</span>',
        'Entregado': '<span class="badge bg-success">🟢 Entregado</span>',
        'Anulado': '<span class="badge bg-danger">❌ Anulado</span>'
    };
    return estados[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}
