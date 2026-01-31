# Plan de Acción: Optimización de Boleta de Venta 21x9cm

Este plan detalla las correcciones de nombres en las firmas y mejoras visuales para profesionalizar la boleta.

## 1. Estructura de Firmas y Mejoras (HTML)
*   **Archivo:** [boleta_ventas.html](file:///d:/myProjects/mcmatias/frontend/boleta_ventas.html)
*   Modificar el pie de página para incluir los nombres debajo de las líneas de firma:
    *   Vendedor: `<div id="nombreVendedorFirma" class="nombre-firma"></div>`
    *   Cliente: `<div id="nombreClienteFirma" class="nombre-firma"></div>`
*   Añadir un bloque de "Notas/Garantía" en la parte inferior.

## 2. Estilización Profesional (CSS)
*   **Archivo:** [boleta_ventas_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_ventas_print.css)
*   **Encabezados:** Añadir fondo gris suave (`#f2f2f2`) a `thead th`.
*   **Firmas:** Centrar los nombres bajo las líneas y reducir ligeramente su fuente.
*   **Detalle:** Aumentar el espaciado entre productos para evitar que se vean amontonados.

## 3. Lógica de Datos (JavaScript)
*   **Archivo:** [boleta_ventas.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_ventas.js)
*   Actualizar `llenarBoletaPanoramica` para inyectar:
    *   `venta.nombre_usuario` en la firma de entrega.
    *   `venta.nombre_cliente` en la firma de recepción.

## 4. Verificación
*   Validar que los nombres coincidan con la venta seleccionada.
*   Confirmar que el diseño oficial se vea más estructurado y profesional.
