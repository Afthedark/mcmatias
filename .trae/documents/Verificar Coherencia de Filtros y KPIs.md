## Plan de Unificación Visual - Reporte de Ventas

Aunque la funcionalidad es correcta, el diseño actual es inconsistente con las mejoras realizadas en "Servicios Técnicos". Este plan propone actualizar las tarjetas de Ventas para igualar el nuevo estándar visual.

### 1. Actualizar HTML (`reportes_ventas.html`)
Reemplazar las tarjetas actuales (diseño simple `col-lg-3`) por el diseño detallado (`col-md-6`) implementado en Servicios Técnicos.

*   **Tarjeta 1 (Azul/Primary):** "Total Vendido"
    *   Mostrar monto grande formateado.
    *   Incluir icono de billete/dinero.
*   **Tarjeta 2 (Verde/Success):** "Transacciones Exitosas"
    *   Mostrar conteo grande.
    *   Incluir icono de recibo/ticket.

### 2. Verificar JS (`reportes_ventas.js`)
Asegurar que la función `renderKpis` siga apuntando correctamente a los IDs (o actualizarlos si es necesario para mejorar la semántica).

### 3. Resultado Esperado
Ambos reportes (Ventas y Servicios) tendrán una cabecera de KPIs visualmente idéntica, mejorando la experiencia de usuario y la coherencia de la interfaz.
