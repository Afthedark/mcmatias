/**
 * Dashboard Page Logic
 * Loads and displays KPIs and latest sales
 */

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    // Show loader
    showLoader();

    try {
        // Load KPIs (with dummy data for now as requested)
        loadKPIs();

        // Load latest sales
        await loadLatestSales();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error al cargar datos del dashboard', 'danger');
    } finally {
        hideLoader();
    }
}

/**
 * Load KPI data (fictitious for now)
 */
function loadKPIs() {
    // Fictitious data as requested by user
    const kpis = {
        ventas: '250',
        productos: '1,234',
        clientes: '567',
        servicios: '45'
    };

    document.getElementById('totalVentas').textContent = kpis.ventas;
    document.getElementById('totalProductos').textContent = kpis.productos;
    document.getElementById('totalClientes').textContent = kpis.clientes;
    document.getElementById('totalServicios').textContent = kpis.servicios;
}

/**
 *  Load latest sales from API
 */
async function loadLatestSales() {
    try {
        // Try to fetch real data
        const response = await apiGet('/ventas/?page_size=5');
        const ventas = response.results || response;

        const tbody = document.getElementById('lastSalesTable');

        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay ventas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = ventas.map(venta => `
            <tr>
                <td>${venta.numero_boleta || 'N/A'}</td>
                <td>${venta.id_cliente || 'Cliente General'}</td>
                <td>${formatDateTime(venta.fecha_venta)}</td>
                <td>${formatCurrency(venta.total_venta)}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.log('Using fictitious sales data:', error);
        // If API fails, show fictitious data
        const fictitiousSales = [
            { numero_boleta: 'B-001', cliente: 'Juan Pérez', fecha: '2026-01-08T14:30:00', total: 1250.50 },
            { numero_boleta: 'B-002', cliente: 'María López', fecha: '2026-01-08T15:45:00', total: 890.00 },
            { numero_boleta: 'B-003', cliente: 'Carlos Rodríguez', fecha: '2026-01-08T16:20:00', total: 3400.75 },
            { numero_boleta: 'B-004', cliente: 'Ana García', fecha: '2026-01-08T17:10:00', total: 560.25 },
            { numero_boleta: 'B-005', cliente: 'Luis Martínez', fecha: '2026-01-08T18:00:00', total: 2100.00 }
        ];

        const tbody = document.getElementById('lastSalesTable');
        tbody.innerHTML = fictitiousSales.map(venta => `
            <tr>
                <td>${venta.numero_boleta}</td>
                <td>${venta.cliente}</td>
                <td>${formatDateTime(venta.fecha)}</td>
                <td>${formatCurrency(venta.total)}</td>
            </tr>
        `).join('');
    }
}
