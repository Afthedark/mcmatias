# Plan de Acción: Toques Finales y Modernización de Boleta de Venta

Este plan añade los elementos estéticos finales para que la boleta de venta tenga un aspecto de "documento oficial" moderno.

## 1. Integración de Código QR (HTML)
*   **Archivo:** [boleta_ventas.html](file:///d:/myProjects/mcmatias/frontend/boleta_ventas.html)
*   Aprovechar el espacio vacío en la esquina superior izquierda (`.header-left`) para insertar un contenedor de código QR.

## 2. Estilización de Componentes (CSS)
*   **Archivo:** [boleta_ventas_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_ventas_print.css)
*   **Código QR:** Crear un recuadro con borde fino y un icono de QR central para simular la verificación electrónica.
*   **Refinamiento de Tabla:** Ajustar los bordes de la tabla de productos para que sean más sutiles y profesionales.

## 3. Lógica de Pie de Página (JavaScript)
*   **Archivo:** [boleta_ventas.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_ventas.js)
*   Asegurar que la fecha del pie de página (`.fecha-hoy`) se cargue siempre con la fecha y hora actual de la impresión.

## 4. Verificación Final
*   Confirmar que el diseño sea armonioso, que los nombres de vendedor y cliente aparezcan en sus lugares respectivos y que el nuevo código QR no interfiera con la lectura de los datos.
