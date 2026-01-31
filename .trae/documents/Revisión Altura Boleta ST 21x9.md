# Plan de Acción: Agregar Gráfico de Estado de Ventas

Este plan detalla los pasos para agregar un nuevo gráfico de Chart.js que muestre el estado de las ventas (Completadas vs Anuladas) en el módulo de Reportes de Ventas.

## 1. Cambios en el Backend (API)

* **Archivo:** [views\_reports.py](file:///d:/myProjects/mcmatias/backend/api/views_reports.py)

* Modificar `ReporteVentasDashboardView` para que el queryset base incluya todas las ventas (sin filtrar por `estado='Completada'` inicialmente).

* Crear un `queryset_valido` para mantener la lógica actual de los KPIs y gráficos existentes.

* Calcular la distribución de estados (`Completada` vs `Anulada`) utilizando el queryset base.

* Incluir el objeto `grafico_estados` en la respuesta JSON con las etiquetas y cantidades correspondientes.

## 2. Cambios en el Frontend (Interfaz)

* **Archivo:** [reportes\_ventas.html](file:///d:/myProjects/mcmatias/frontend/reportes_ventas.html)

* Modificar la fila del gráfico "Racha de Ventas - Top 10 Vendedores" (cambiar `col-12` por `col-lg-6`).

* Agregar una nueva columna `col-lg-6` al lado para el gráfico "Estado de Ventas".

* Insertar un nuevo `<canvas id="chartEstadoVentas"></canvas>` dentro de la nueva tarjeta.

## 3. Cambios en el Frontend (Lógica)

* **Archivo:** [reportes\_ventas.js](file:///d:/myProjects/mcmatias/frontend/js/pages/reportes_ventas.js)

* En la función `renderCharts`, agregar la lógica para inicializar y renderizar el nuevo gráfico `chartEstadoVentas`.

* Utilizar un gráfico de tipo **Doughnut** o **Pie** para mostrar la proporción de ventas completadas frente a las anuladas.

* Asignar colores distintivos (ej. verde para Completadas, rojo para Anuladas).

## 4. Verificación

* Cargar la página de Reportes de Ventas.

* Verificar que ambos gráficos aparezcan uno al lado del otro en pantallas grandes.

* Confirmar que los datos del nuevo gráfico reflejen correctamente el total de ventas filtradas por el rango de fechas seleccionado.

