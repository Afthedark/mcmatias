## Plan de Corrección de Zona Horaria

Para solucionar el problema de que los gráficos muestran la hora incorrecta (no local de Bolivia), realizaré los siguientes cambios:

### 1. Configuración Global (`settings.py`)
- Estableceré la zona horaria predeterminada del proyecto a `'America/La_Paz'` (GMT-4).
- Eliminaré la configuración redundante que sobrescribía la zona horaria a 'UTC'.

### 2. Backend - Reportes (`api/views_reports.py`)
Modificaré las consultas de extracción de hora para que utilicen explícitamente la zona horaria configurada, garantizando que la base de datos realice la conversión correcta antes de agrupar los datos.

- **Reporte de Ventas (`ReporteVentasDashboardView`)**:
  - Actualizaré `ExtractHour('fecha_venta')` para incluir `tzinfo=timezone.get_current_timezone()`.

- **Reporte de Servicios (`ReporteServiciosDashboardView`)**:
  - Actualizaré `ExtractHour('fecha_inicio')` para incluir `tzinfo=timezone.get_current_timezone()`.

Esto asegurará que tanto las ventas como los servicios muestren las horas correctas en los gráficos de distribución horaria, respetando la hora local de Bolivia.