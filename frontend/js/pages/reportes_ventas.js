/**
 * Logic for Sales Reports
 */

document.addEventListener('DOMContentLoaded', async () => {
    await initFilters();
    setQuickDate('month'); // Default to this month
});

/**
 * Initialize Filters based on Role
 */
async function initFilters() {
    // Show/Hide Sucursal Filter based on Role permissions
    if (canPerformAction('ver_filtro_sucursal')) {
        const container = document.getElementById('sucursalFilterContainer');
        container.style.display = 'block';
        await loadSucursalesSelect();
    }
}

/**
 * Load Sucursales into Select
 */
async function loadSucursalesSelect() {
    try {
        const response = await apiGet('/sucursales/');
        const select = document.getElementById('sucursalSelect');
        select.innerHTML = '<option value="">Todas las Sucursales</option>';

        const results = response.results || response;
        results.forEach(suc => {
            select.innerHTML += `<option value="${suc.id_sucursal}">${suc.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error loading sucursales:', error);
    }
}

/**
 * Set Quick Date Range
 */
function setQuickDate(type) {
    const hoy = new Date();
    let desde, hasta;

    // Formatear a YYYY-MM-DD usando hora local
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (type === 'today') {
        const todayStr = formatDate(hoy);
        desde = todayStr;
        hasta = todayStr;
    } else if (type === 'month') {
        const firstDay = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const lastDay = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        desde = formatDate(firstDay);
        hasta = formatDate(lastDay);
    } else if (type === 'year') {
        const firstDay = new Date(hoy.getFullYear(), 0, 1);
        const lastDay = new Date(hoy.getFullYear(), 11, 31);
        desde = formatDate(firstDay);
        hasta = formatDate(lastDay);
    }

    document.getElementById('fechaDesde').value = desde;
    document.getElementById('fechaHasta').value = hasta;

    loadReporteData();
}

/**
 * Load Data from Backend and Render Charts
 */
async function loadReporteData() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const sucursalId = document.getElementById('sucursalSelect').value;

    if (!fechaDesde || !fechaHasta) {
        showToast('Por favor seleccione un rango de fechas', 'warning');
        return;
    }

    let url = `/reportes/ventas/dashboard/?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
    if (sucursalId) {
        url += `&id_sucursal=${sucursalId}`;
    }

    try {
        const data = await apiGet(url);
        renderKpis(data.kpis);
        renderCharts(data);
    } catch (error) {
        console.error('Error loading report data:', error);
        showToast('Error al cargar datos del reporte', 'error');
    }
}

/**
 * Render KPIs
 */
function renderKpis(kpis) {
    document.getElementById('kpiMonto').innerText = formatCurrency(kpis.total_monto);
    document.getElementById('kpiTransacciones').innerText = kpis.total_transacciones;
}

/**
 * Render Charts using Chart.js
 */
function renderCharts(data) {

    // 1. Chart Ventas por Dia (Mixed Bar + Line)
    const datasetsVentas = [
        {
            label: 'Monto de Ventas (Bs)',
            data: data.grafico_dias.datasets[0].data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
        },
        {
            label: 'Cantidad de Ventas',
            data: data.grafico_dias.datasets[1].data,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
        }
    ];

    renderChart(
        'chartVentas',
        'bar',
        data.grafico_dias.labels,
        datasetsVentas,
        {
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Monto (Bs)' },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Cantidad' },
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    );

    // 2. Chart Métodos de Pago (Doughnut)
    renderChart(
        'chartPagos',
        'doughnut',
        data.grafico_pago.labels,
        [{
            data: data.grafico_pago.data,
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 205, 86, 0.7)'
            ]
        }],
        {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    );


    // 3. Chart Productos Más Vendidos (Horizontal Bar)
    if (data.grafico_productos && data.grafico_productos.labels && data.grafico_productos.labels.length > 0) {
        renderChart(
            'chartProductos',
            'bar',
            data.grafico_productos.labels,
            [{
                label: 'Cantidad Vendida',
                data: data.grafico_productos.data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }],
            {
                indexAxis: 'y', // Horizontal bars
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad Vendida' },
                        ticks: { stepSize: 1 }
                    }
                }
            }
        );
    }

    // 4. Chart Ventas por Hora (Line)
    if (data.grafico_hora && data.grafico_hora.labels) {
        renderChart(
            'chartHora',
            'line',
            data.grafico_hora.labels,
            [{
                label: 'Cantidad de Ventas',
                data: data.grafico_hora.data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4 // Smooth curve
            }],
            {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Ventas' },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        title: { display: true, text: 'Hora del Día' }
                    }
                }
            }
        );
    }
}

/**
 * Helper to create Charts
 */
function renderChart(canvasId, type, labels, datasets, extraOptions = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Check if chart already exists
    if (window[`myChart_${canvasId}`]) {
        // Update existing chart data with animation
        const chart = window[`myChart_${canvasId}`];
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update('active'); // Trigger animation
    } else {
        // Create new chart instance
        window[`myChart_${canvasId}`] = new Chart(ctx, {
            type: type,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 800
                        }
                    }
                },
                ...extraOptions
            }
        });
    }
}

/**
 * Download Handler
 */
function downloadReport(type) {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const sucursalId = document.getElementById('sucursalSelect').value;

    if (!fechaDesde || !fechaHasta) return;

    const baseUrl = type === 'pdf' ? '/reportes/ventas/pdf/' : '/reportes/ventas/excel/';
    let qParams = `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
    if (sucursalId) qParams += `&id_sucursal=${sucursalId}`;

    downloadSecurely(`${baseUrl}${qParams}`, `ventas_reporte.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
}

async function downloadSecurely(endpoint, filename) {
    const token = localStorage.getItem('access_token');
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    showToast('Generando reporte...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error en descarga');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Descarga iniciada', 'success');

    } catch (error) {
        console.error('Download error:', error);
        showToast('Error al descargar', 'error');
    }
}
