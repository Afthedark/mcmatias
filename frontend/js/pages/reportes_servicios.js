/**
 * Logic for Technical Services Reports
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
            select.innerHTML += `<option value="${suc.id_sucursal}">${suc.nombre || suc.nombre_sucursal}</option>`;
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

    let url = `/reportes/servicios/dashboard/?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
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
    // 1. Entregados
    document.getElementById('kpiMontoEntregado').innerText = formatCurrency(kpis.monto_entregado);
    document.getElementById('kpiTransaccionesEntregado').innerText = kpis.transacciones_entregado;

    // 2. Para Retirar
    document.getElementById('kpiMontoRetirar').innerText = formatCurrency(kpis.monto_para_retirar);
    document.getElementById('kpiTransaccionesRetirar').innerText = kpis.transacciones_para_retirar;

    // 3. En Reparación
    document.getElementById('kpiMontoReparacion').innerText = formatCurrency(kpis.monto_en_reparacion);
    document.getElementById('kpiTransaccionesReparacion').innerText = kpis.transacciones_en_reparacion;
}

/**
 * Render Charts using Chart.js
 */
function renderCharts(data) {

    // 1. Chart Estado (Pie/Doughnut)
    renderChart(
        'chartEstado',
        'doughnut',
        data.grafico_estado.labels,
        [{
            data: data.grafico_estado.data,
            backgroundColor: ['#ffc107', '#28a745', '#dc3545', '#17a2b8', '#6c757d']
        }]
    );

    // 2. Chart Marca (Bar Horizontal)
    renderChart(
        'chartMarca',
        'bar',
        data.grafico_marca.labels,
        [{
            label: 'Cantidad',
            data: data.grafico_marca.data,
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }],
        { indexAxis: 'y' }
    );

    // 3. Chart Evolución (Line)
    renderChart(
        'chartEvolucion',
        'line',
        data.grafico_evolucion.labels,
        [{
            label: 'Recepciones por Día',
            data: data.grafico_evolucion.data,
            borderColor: '#6610f2',
            tension: 0.3,
            fill: false
        }]
    );

    // 4. Agregado: Chart Técnicos (Barra Vertical)
    if (data.grafico_tecnicos && data.grafico_tecnicos.labels) {
        renderChart(
            'chartTecnicos',
            'bar',
            data.grafico_tecnicos.labels,
            [{
                label: 'Servicios Entregados',
                data: data.grafico_tecnicos.data,
                backgroundColor: 'rgba(40, 167, 69, 0.7)', // Verde success
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }],
            {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad' },
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        );
    }

    // 5. Nuevo: Chart Distribución por Hora (Line)
    if (data.grafico_hora && data.grafico_hora.labels) {
        renderChart(
            'chartHora',
            'line',
            data.grafico_hora.labels,
            [{
                label: 'Servicios por Hora',
                data: data.grafico_hora.data,
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }],
            {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Servicios' },
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

    // Destroy previous instance if exists in global var (needs unique vars map or similar logic)
    // Quick Hack: Store in window object using dynamic keys
    if (window[`myChart_${canvasId}`]) {
        window[`myChart_${canvasId}`].destroy();
    }

    window[`myChart_${canvasId}`] = new Chart(ctx, {
        type: type,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            ...extraOptions
        }
    });
}

/**
 * Download Handler
 */
function downloadReport(type) {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const sucursalId = document.getElementById('sucursalSelect').value;

    if (!fechaDesde || !fechaHasta) return;

    const baseUrl = type === 'pdf' ? '/reportes/servicios/pdf/' : '/reportes/servicios/excel/';
    let qParams = `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
    if (sucursalId) qParams += `&id_sucursal=${sucursalId}`;

    downloadSecurely(`${baseUrl}${qParams}`, `servicios_reporte.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
}

async function downloadSecurely(endpoint, filename) {
    const token = localStorage.getItem('access_token');

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
