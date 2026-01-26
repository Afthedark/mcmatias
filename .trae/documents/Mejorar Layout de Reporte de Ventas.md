## Plan de Ajuste de Layout - Reporte de Ventas

El objetivo es evitar que el contenido se vea "estirado" en pantallas grandes.

### 1. Ajustar el Contenedor Principal (`reportes_ventas.html`)
Cambiaré el contenedor que envuelve el contenido principal.
*   **Actual:** `<div class="container-fluid p-0">` (ocupa 100% sin margen)
*   **Nuevo:** `<div class="container-fluid px-4">` para dar márgenes laterales, o incluso `<div class="container-xxl">` para limitar el ancho máximo en pantallas muy grandes. Probaré con **`container-fluid px-4`** y añadiré un `max-width` en el estilo del contenedor si es necesario, o simplemente confiaré en el grid de Bootstrap con márgenes.

### 2. Revisar la Distribución de Gráficos
*   El gráfico de "Métodos de Pago" (Dona) en `col-lg-4` puede verse muy grande si el ancho total es enorme.
*   Aseguraré que las filas de gráficos tengan un espaciado adecuado (`g-4` para gaps consistentes).

### 3. Ejecución
Modificaré `d:\myProjects\mcmatias\frontend\reportes_ventas.html` para aplicar estos cambios de clases CSS.
