# Plan de Acción: Simplificación de Boleta de Venta

Este plan detalla los ajustes para eliminar elementos innecesarios y limpiar el diseño de la boleta de venta.

## 1. Limpieza de Estructura (HTML)
*   **Archivo:** [boleta_ventas.html](file:///d:/myProjects/mcmatias/frontend/boleta_ventas.html)
*   **Eliminar QR:** Quitar el contenedor `<div class="qr-placeholder">` y su contenido.
*   **Eliminar Celular:** Quitar la línea de "CELULAR" tanto en la cabecera como en el cuerpo de la boleta.
*   **Ajustar Firmas:** Quitar las etiquetas `<div class="firma-linea"></div>` para eliminar la línea horizontal sobre los nombres.

## 2. Ajuste de Lógica (JavaScript)
*   **Archivo:** [boleta_ventas.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_ventas.js)
*   Eliminar la lógica que busca y llena el campo de celular del cliente en la boleta panorámica.

## 3. Refinamiento Visual (CSS)
*   **Archivo:** [boleta_ventas_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_ventas_print.css)
*   Eliminar las clases relacionadas con el QR (`.qr-placeholder`, `.qr-box`, etc.).
*   Ajustar el espaciado de las firmas para que los nombres y los títulos ("ENTREGADO POR", "RECIBÍ CONFORME") se vean bien sin la línea divisoria.

## 4. Verificación
*   Confirmar que la boleta se vea limpia, sin el cuadro de QR, sin el dato del celular y con las firmas sin líneas superiores.
