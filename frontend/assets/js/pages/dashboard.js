/**
 * Dashboard Page Controller
 * Maneja la lógica del dashboard principal
 */
class DashboardPage {
  constructor() {
    this.salesChart = null;
    this.topProductsChart = null;
    this.refreshInterval = null;
    
    this.init();
  }

  async init() {
    try {
      // Verificar autenticación
      if (!auth.requireAuth()) {
        return;
      }

      // Inicializar componentes
      this.setupCharts();
      await this.loadDashboardData();
      this.startAutoRefresh();
      
      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing dashboard:', error);
      UI.showError('Error al cargar el dashboard');
    }
  }

  /**
   * Configurar gráficos
   */
  setupCharts() {
    this.setupSalesChart();
    this.setupTopProductsChart();
  }

  /**
   * Configurar gráfico de ventas
   */
  setupSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Ventas',
          data: [],
          borderColor: 'rgb(13, 110, 253)',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Ventas: ${UI.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => UI.formatCurrency(value)
            }
          }
        }
      }
    });
  }

  /**
   * Configurar gráfico de productos más vendidos
   */
  setupTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    this.topProductsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Cargar datos del dashboard
   */
  async loadDashboardData() {
    try {
      UI.showLoading('Cargando datos del dashboard...');
      
      // Cargar datos en paralelo
      const [salesData, kpiData, recentSales, recentServices] = await Promise.all([
        this.loadSalesData(),
        this.loadKPIData(),
        this.loadRecentSales(),
        this.loadRecentServices()
      ]);

      // Actualizar KPIs
      this.updateKPIs(kpiData);
      
      // Actualizar gráficos
      this.updateCharts(salesData);
      
      // Actualizar tablas
      this.updateRecentTables(recentSales, recentServices);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      UI.showError('Error al cargar los datos del dashboard');
    } finally {
      UI.hideLoading();
    }
  }

  /**
   * Cargar datos de KPIs
   */
  async loadKPIData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Ventas del día
      const todaySales = await this.getTodaySales(today);
      
      // Clientes activos
      const activeClients = await api.get(API_ENDPOINTS.CLIENTES.LIST);
      
      // Productos con stock bajo
      const lowStockProducts = await this.getLowStockProducts();
      
      // Servicios pendientes
      const pendingServices = await this.getPendingServices();

      return {
        todaySales: todaySales.count,
        todaySalesAmount: todaySales.amount,
        activeClients: activeClients.length,
        lowStockProducts: lowStockProducts.length,
        pendingServices: pendingServices.length
      };
    } catch (error) {
      console.error('Error loading KPI data:', error);
      return {
        todaySales: 0,
        todaySalesAmount: 0,
        activeClients: 0,
        lowStockProducts: 0,
        pendingServices: 0
      };
    }
  }

  /**
   * Obtener ventas del día
   */
  async getTodaySales(date) {
    try {
      const ventas = await api.get(API_ENDPOINTS.VENTAS.LIST);
      const todaySales = ventas.filter(venta => 
        venta.fecha_venta.startsWith(date)
      );
      
      const total = todaySales.reduce((sum, venta) => sum + parseFloat(venta.total_venta), 0);
      
      return {
        count: todaySales.length,
        amount: total
      };
    } catch (error) {
      console.error('Error getting today sales:', error);
      return { count: 0, amount: 0 };
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts() {
    try {
      const inventario = await api.get(API_ENDPOINTS.INVENTARIO.LIST);
      const lowStockThreshold = 10; // Configurable
      
      return inventario.filter(item => item.cantidad < lowStockThreshold);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  /**
   * Obtener servicios pendientes
   */
  async getPendingServices() {
    try {
      const servicios = await api.get(API_ENDPOINTS.SERVICIOS.LIST);
      return servicios.filter(servicio => 
        servicio.estado === 'En Reparación' || servicio.estado === 'Para Retirar'
      );
    } catch (error) {
      console.error('Error getting pending services:', error);
      return [];
    }
  }

  /**
   * Cargar datos de ventas para gráficos
   */
  async loadSalesData() {
    try {
      const ventas = await api.get(API_ENDPOINTS.VENTAS.LIST);
      const last7Days = this.getLast7Days();
      
      // Ventas últimos 7 días
      const last7DaysSales = last7Days.map(date => {
        const daySales = ventas.filter(venta => venta.fecha_venta.startsWith(date));
        const total = daySales.reduce((sum, venta) => sum + parseFloat(venta.total_venta), 0);
        return total;
      });

      // Productos más vendidos
      const topProducts = this.getTopProducts(ventas);

      return {
        last7DaysSales,
        topProducts
      };
    } catch (error) {
      console.error('Error loading sales data:', error);
      return {
        last7DaysSales: [0, 0, 0, 0, 0, 0, 0],
        topProducts: []
      };
    }
  }

  /**
   * Obtener productos más vendidos
   */
  getTopProducts(ventas) {
    const productCounts = {};
    
    ventas.forEach(venta => {
      if (venta.detalles) {
        venta.detalles.forEach(detalle => {
          const productName = detalle.producto?.nombre_producto || 'Producto desconocido';
          productCounts[productName] = (productCounts[productName] || 0) + detalle.cantidad;
        });
      }
    });

    return Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Cargar ventas recientes
   */
  async loadRecentSales() {
    try {
      const ventas = await api.get(API_ENDPOINTS.VENTAS.LIST);
      return ventas.slice(0, 5);
    } catch (error) {
      console.error('Error loading recent sales:', error);
      return [];
    }
  }

  /**
   * Cargar servicios recientes
   */
  async loadRecentServices() {
    try {
      const servicios = await api.get(API_ENDPOINTS.SERVICIOS.LIST);
      return servicios.slice(0, 5);
    } catch (error) {
      console.error('Error loading recent services:', error);
      return [];
    }
  }

  /**
   * Actualizar KPIs en el dashboard
   */
  updateKPIs(kpiData) {
    // Ventas del día
    const totalVentasElement = document.getElementById('totalVentas');
    if (totalVentasElement) {
      this.animateNumber(totalVentasElement, kpiData.todaySales);
    }

    // Clientes activos
    const totalClientesElement = document.getElementById('totalClientes');
    if (totalClientesElement) {
      this.animateNumber(totalClientesElement, kpiData.activeClients);
    }

    // Stock bajo
    const stockBajoElement = document.getElementById('stockBajo');
    if (stockBajoElement) {
      this.animateNumber(stockBajoElement, kpiData.lowStockProducts);
    }

    // Servicios pendientes
    const serviciosPendientesElement = document.getElementById('serviciosPendientes');
    if (serviciosPendientesElement) {
      this.animateNumber(serviciosPendientesElement, kpiData.pendingServices);
    }
  }

  /**
   * Actualizar gráficos
   */
  updateCharts(salesData) {
    // Actualizar gráfico de ventas
    if (this.salesChart) {
      this.salesChart.data.datasets[0].data = salesData.last7DaysSales;
      this.salesChart.update();
    }

    // Actualizar gráfico de productos
    if (this.topProductsChart) {
      const topProducts = salesData.topProducts;
      this.topProductsChart.data.labels = topProducts.map(p => p.name);
      this.topProductsChart.data.datasets[0].data = topProducts.map(p => p.count);
      this.topProductsChart.update();
    }
  }

  /**
   * Actualizar tablas recientes
   */
  updateRecentTables(recentSales, recentServices) {
    // Actualizar tabla de ventas recientes
    const salesTableBody = document.querySelector('#recentSalesTable tbody');
    if (salesTableBody) {
      if (recentSales.length === 0) {
        salesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay ventas recientes</td></tr>';
      } else {
        salesTableBody.innerHTML = recentSales.map(venta => `
          <tr>
            <td>${venta.numero_boleta}</td>
            <td>${venta.cliente?.nombre_apellido || 'N/A'}</td>
            <td>${UI.formatCurrency(venta.total_venta)}</td>
            <td>${UI.createStatusBadge('Completada', 'success')}</td>
          </tr>
        `).join('');
      }
    }

    // Actualizar tabla de servicios recientes
    const servicesTableBody = document.querySelector('#recentServicesTable tbody');
    if (servicesTableBody) {
      if (recentServices.length === 0) {
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay servicios recientes</td></tr>';
      } else {
        servicesTableBody.innerHTML = recentServices.map(servicio => `
          <tr>
            <td>${servicio.numero_servicio}</td>
            <td>${servicio.cliente?.nombre_apellido || 'N/A'}</td>
            <td>${this.getServiceStatusBadge(servicio.estado)}</td>
            <td>${UI.formatShortDate(servicio.fecha_inicio)}</td>
          </tr>
        `).join('');
      }
    }
  }

  /**
   * Obtener badge de estado de servicio
   */
  getServiceStatusBadge(status) {
    const statusConfig = {
      'En Reparación': { color: 'warning', icon: 'tools' },
      'Para Retirar': { color: 'info', icon: 'clock' },
      'Entregado': { color: 'success', icon: 'check' }
    };

    const config = statusConfig[status] || { color: 'secondary', icon: 'question' };
    return `<span class="badge bg-${config.color}">
      <i class="fas fa-${config.icon} me-1"></i>${status}
    </span>`;
  }

  /**
   * Animar número de KPI
   */
  animateNumber(element, target, duration = 1000) {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const updateNumber = () => {
      current += increment;
      
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        element.textContent = target;
      } else {
        element.textContent = Math.round(current);
        requestAnimationFrame(updateNumber);
      }
    };

    updateNumber();
  }

  /**
   * Obtener últimos 7 días
   */
  getLast7Days() {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  }

  /**
   * Iniciar auto refresh
   */
  startAutoRefresh() {
    // Refrescar cada 5 minutos
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }

  /**
   * Detener auto refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Refrescar manualmente
   */
  async refresh() {
    await this.loadDashboardData();
  }

  /**
   * Limpiar recursos
   */
  destroy() {
    this.stopAutoRefresh();
    
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
    }
  }
}

// Exportar para uso global
window.DashboardPage = DashboardPage;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si estamos en la página de dashboard
  if (window.location.pathname.includes('dashboard.html')) {
    window.dashboardPage = new DashboardPage();
  }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardPage;
}