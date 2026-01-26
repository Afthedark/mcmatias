## Plan de Implementación: Nuevas Tarjetas Financieras en Reporte de Servicios

### 1. Backend (`views_reports.py`)
Modificaré la clase `ReporteServiciosDashboardView` para calcular los nuevos KPIs financieros.

*   **Importaciones:** Agregar `Sum` y `Q` si faltan.
*   **KPI "Ingresos Realizados":**
    *   Filtrar servicios con estado `Entregado` O `Para Retirar`.
    *   Sumar `costo_estimado`.
    *   Contar registros.
*   **KPI "En Proceso":**
    *   Filtrar servicios con estado `En Reparación`.
    *   Sumar `costo_estimado`.
    *   Contar registros.
*   **Respuesta JSON:** Actualizar la estructura `kpis` con:
    *   `monto_realizado`
    *   `transacciones_realizado`
    *   `monto_pendiente`
    *   `transacciones_pendiente`

### 2. Frontend HTML (`reportes_servicios.html`)
Reemplazaré la fila actual de 3 tarjetas (`col-md-4`) por una fila con 2 tarjetas (`col-md-6`) más detalladas.

*   **Tarjeta 1 (Verde - Success):**
    *   Título: "Ingresos Realizados (Entregados + Para Retirar)"
    *   Cuerpo:
        *   Monto grande (ej. `Bs 1,500.00`)
        *   Subtítulo con conteo (ej. `15 Transacciones`)
*   **Tarjeta 2 (Amarillo - Warning):**
    *   Título: "En Proceso (En Reparación)"
    *   Cuerpo:
        *   Monto grande
        *   Subtítulo con conteo

### 3. Frontend JS (`js/pages/reportes_servicios.js`)
Actualizaré la función `renderKpis` para reflejar la nueva estructura de datos.

*   Usar `formatCurrency` para los montos.
*   Asignar los valores a los nuevos IDs del DOM.

### 4. Verificación
*   Confirmar que los cálculos coincidan con los datos de la base de datos.
*   Verificar que la visualización sea correcta y responsive.
