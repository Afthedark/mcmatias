/**
 * Dashboard Page Logic
 * Client-side Data Processing - Loads real data and calculates KPIs
 * Includes Chart.js integration with Day/Month view selector
 */

// Chart instances (global for destroy/recreate)
let ventasLineChart = null;
let ventasBarChart = null;
let serviciosLineChart = null;
let serviciosBarChart = null;

// Chart view state
let currentChartView = 'day'; // 'day' or 'month'
let cachedVentasData = [];
let cachedServiciosData = [];

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    showLoader();

    try {
        // 1. Fetch data in parallel (optimized)
        const [ventasRes, productosRes, clientesRes, serviciosRes] = await Promise.all([
            apiGet('/ventas/?page_size=1000'),  // Get all sales for charts
            apiGet('/productos/?page_size=1'),  // Only need count
            apiGet('/clientes/?page_size=1'),   // Only need count
            apiGet('/servicios_tecnicos/?page_size=1000')  // Get all services for charts
        ]);

        const ventas = ventasRes.results || ventasRes;
        const totalProductos = productosRes.count || (Array.isArray(productosRes) ? productosRes.length : 0);
        const totalClientes = clientesRes.count || (Array.isArray(clientesRes) ? clientesRes.length : 0);
        const servicios = serviciosRes.results || serviciosRes;
        const totalServicios = serviciosRes.count || (Array.isArray(serviciosRes) ? serviciosRes.length : 0);

        // Cache data for chart view switching
        cachedVentasData = ventas;
        cachedServiciosData = servicios;

        // 2. Client-side Processing
        processAndRenderKPIs(ventas, totalProductos, totalClientes, totalServicios);

        // 3. Render Latest Tables
        renderLatestSalesTable(ventas.slice(0, 5));
        renderLatestServicesTable(servicios.slice(0, 5));

        // 4. Render Charts
        renderAllCharts();

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

    // Render KPIs
    document.getElementById('totalVentas').innerHTML = `
        <strong>${cantidadVentasMes}</strong>
        <small class="d-block text-muted" style="font-size: 0.75rem; margin-top: 4px;">
            ${formatCurrency(totalIngresosMes)}
        </small>
    `;

    document.getElementById('totalProductos').textContent = totalProductos.toLocaleString();
    document.getElementById('totalClientes').textContent = totalClientes.toLocaleString();
    document.getElementById('totalServicios').textContent = totalServicios.toLocaleString();

    // Log stats for debugging
    console.log('Dashboard Stats:', {
        ventasDelMes: cantidadVentasMes,
        ingresosDelMes: totalIngresosMes,
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
        'En Reparación': '<span class="badge bg-primary">En Reparación</span>',
        'Para Retirar': '<span class="badge bg-warning text-dark">Para Retirar</span>',
        'Entregado': '<span class="badge bg-success">Entregado</span>',
        'Anulado': '<span class="badge bg-danger">Anulado</span>'
    };
    return estados[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

// ============================================
// CHART.JS FUNCTIONS
// ============================================

/**
 * Switch between day and month view
 */
function switchChartView(view) {
    currentChartView = view;

    // Update button states
    const btnDay = document.getElementById('btnViewDay');
    const btnMonth = document.getElementById('btnViewMonth');

    if (view === 'day') {
        btnDay.classList.add('active');
        btnDay.classList.remove('btn-outline-primary');
        btnDay.classList.add('btn-primary');
        btnMonth.classList.remove('active', 'btn-primary');
        btnMonth.classList.add('btn-outline-primary');
    } else {
        btnMonth.classList.add('active');
        btnMonth.classList.remove('btn-outline-primary');
        btnMonth.classList.add('btn-primary');
        btnDay.classList.remove('active', 'btn-primary');
        btnDay.classList.add('btn-outline-primary');
    }

    // Update chart subtitles
    const subtitle = view === 'day' ? 'Últimos 7 días' : 'Últimos 12 meses';
    document.getElementById('ventasLineChartSubtitle').textContent = subtitle;
    document.getElementById('ventasBarChartSubtitle').textContent = subtitle;
    document.getElementById('serviciosLineChartSubtitle').textContent = subtitle;
    document.getElementById('serviciosBarChartSubtitle').textContent = subtitle;

    // Re-render charts with cached data
    renderAllCharts();
}

/**
 * Get last 7 days labels (format: dd/mm)
 */
function getLast7DaysLabels() {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
    }
    return labels;
}

/**
 * Get last 12 months labels (format: MMM)
 */
function getLast12MonthsLabels() {
    const labels = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(monthNames[date.getMonth()]);
    }
    return labels;
}

/**
 * Group sales by date (last 7 days)
 */
function processSalesDataForCharts(ventas) {
    const labels = getLast7DaysLabels();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push(date);
    }

    // Filter valid sales (not cancelled)
    const ventasValidas = ventas.filter(v => v.estado !== 'Anulada');

    // Group by date
    const dataByDate = last7Days.map(targetDate => {
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const ventasDelDia = ventasValidas.filter(v => {
            const fechaVenta = new Date(v.fecha_venta);
            return fechaVenta >= targetDate && fechaVenta < nextDate;
        });

        const totalEfectivo = ventasDelDia
            .filter(v => v.tipo_pago === 'Efectivo')
            .reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

        const totalQR = ventasDelDia
            .filter(v => v.tipo_pago === 'QR')
            .reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

        return {
            total: totalEfectivo + totalQR,
            efectivo: totalEfectivo,
            qr: totalQR,
            cantidad: ventasDelDia.length
        };
    });

    return { labels, dataByDate };
}

/**
 * Group sales by month (last 12 months)
 */
function processSalesDataByMonth(ventas) {
    const labels = getLast12MonthsLabels();
    const last12Months = [];

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        last12Months.push(date);
    }

    // Filter valid sales
    const ventasValidas = ventas.filter(v => v.estado !== 'Anulada');

    // Group by month
    const dataByDate = last12Months.map(targetDate => {
        const nextMonth = new Date(targetDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const ventasDelMes = ventasValidas.filter(v => {
            const fechaVenta = new Date(v.fecha_venta);
            return fechaVenta >= targetDate && fechaVenta < nextMonth;
        });

        const totalEfectivo = ventasDelMes
            .filter(v => v.tipo_pago === 'Efectivo')
            .reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

        const totalQR = ventasDelMes
            .filter(v => v.tipo_pago === 'QR')
            .reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

        return {
            total: totalEfectivo + totalQR,
            efectivo: totalEfectivo,
            qr: totalQR,
            cantidad: ventasDelMes.length
        };
    });

    return { labels, dataByDate };
}

/**
 * Group services by date (last 7 days)
 */
function processServicesDataForCharts(servicios) {
    const labels = getLast7DaysLabels();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push(date);
    }

    // Filter valid services (not cancelled)
    const serviciosValidos = servicios.filter(s => s.estado !== 'Anulado');

    // Group by date and state
    const dataByDate = last7Days.map(targetDate => {
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const serviciosDelDia = serviciosValidos.filter(s => {
            const fechaInicio = new Date(s.fecha_inicio);
            return fechaInicio >= targetDate && fechaInicio < nextDate;
        });

        return {
            total: serviciosDelDia.length,
            enReparacion: serviciosDelDia.filter(s => s.estado === 'En Reparación').length,
            paraRetirar: serviciosDelDia.filter(s => s.estado === 'Para Retirar').length,
            entregado: serviciosDelDia.filter(s => s.estado === 'Entregado').length
        };
    });

    return { labels, dataByDate };
}

/**
 * Group services by month (last 12 months)
 */
function processServicesDataByMonth(servicios) {
    const labels = getLast12MonthsLabels();
    const last12Months = [];

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        last12Months.push(date);
    }

    // Filter valid services
    const serviciosValidos = servicios.filter(s => s.estado !== 'Anulado');

    // Group by month and state
    const dataByDate = last12Months.map(targetDate => {
        const nextMonth = new Date(targetDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const serviciosDelMes = serviciosValidos.filter(s => {
            const fechaInicio = new Date(s.fecha_inicio);
            return fechaInicio >= targetDate && fechaInicio < nextMonth;
        });

        return {
            total: serviciosDelMes.length,
            enReparacion: serviciosDelMes.filter(s => s.estado === 'En Reparación').length,
            paraRetirar: serviciosDelMes.filter(s => s.estado === 'Para Retirar').length,
            entregado: serviciosDelMes.filter(s => s.estado === 'Entregado').length
        };
    });

    return { labels, dataByDate };
}

/**
 * Render all charts based on current view (day/month)
 */
function renderAllCharts() {
    let salesChartData, servicesChartData;

    if (currentChartView === 'day') {
        salesChartData = processSalesDataForCharts(cachedVentasData);
        servicesChartData = processServicesDataForCharts(cachedServiciosData);
    } else {
        salesChartData = processSalesDataByMonth(cachedVentasData);
        servicesChartData = processServicesDataByMonth(cachedServiciosData);
    }

    createVentasLineChart(salesChartData.labels, salesChartData.dataByDate);
    createVentasBarChart(salesChartData.labels, salesChartData.dataByDate);
    createServiciosLineChart(servicesChartData.labels, servicesChartData.dataByDate);
    createServiciosBarChart(servicesChartData.labels, servicesChartData.dataByDate);
}

/**
 * Create Ventas Line Chart
 */
function createVentasLineChart(labels, data) {
    const ctx = document.getElementById('ventasLineChart');
    if (!ctx) return;

    // Destroy previous instance
    if (ventasLineChart) ventasLineChart.destroy();

    ventasLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Ventas (Bs.)',
                data: data.map(d => d.total),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: (context) => `Total: Bs. ${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/**
 * Create Ventas Bar Chart (Total per period)
 */
function createVentasBarChart(labels, data) {
    const ctx = document.getElementById('ventasBarChart');
    if (!ctx) return;

    if (ventasBarChart) ventasBarChart.destroy();

    ventasBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Ventas (Bs.)',
                data: data.map(d => d.total),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Total: Bs. ${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/**
 * Create Servicios Line Chart
 */
function createServiciosLineChart(labels, data) {
    const ctx = document.getElementById('serviciosLineChart');
    if (!ctx) return;

    if (serviciosLineChart) serviciosLineChart.destroy();

    serviciosLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Servicios',
                data: data.map(d => d.total),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: (context) => `Total: ${context.parsed.y} servicios`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Create Servicios Grouped Bar Chart
 */
function createServiciosBarChart(labels, data) {
    const ctx = document.getElementById('serviciosBarChart');
    if (!ctx) return;

    if (serviciosBarChart) serviciosBarChart.destroy();

    serviciosBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'En Reparación',
                    data: data.map(d => d.enReparacion),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Para Retirar',
                    data: data.map(d => d.paraRetirar),
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: 'rgb(255, 206, 86)',
                    borderWidth: 1
                },
                {
                    label: 'Entregado',
                    data: data.map(d => d.entregado),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} servicios`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}
