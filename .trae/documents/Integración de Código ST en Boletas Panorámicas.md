# Plan de Acción: Integración de Código de Servicio en Boletas 21x9cm

Este plan detalla la integración del código completo del servicio (ej. `ST-2026-00011`) en las boletas panorámicas de forma discreta y profesional.

## 1. Estructura HTML
*   **Archivo:** [boleta_servicio.html](file:///d:/myProjects/mcmatias/frontend/boleta_servicio.html)
*   Agregar `<div class="codigo-st-discreto"></div>` al inicio de la sección `.cuerpo-derecho` tanto en el formato de Orden de Servicio como en el de Nota de Entrega.

## 2. Diseño y Posicionamiento (CSS)
*   **Archivo:** [boleta_servicio_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_servicio_print.css)
*   Crear la clase `.codigo-st-discreto` con:
    *   Posicionamiento absoluto para no alterar el flujo del diseño.
    *   Tamaño de fuente reducido (`6pt`) para discreción.
    *   Ubicación en la esquina superior izquierda del área derecha.

## 3. Lógica de Datos (JavaScript)
*   **Archivo:** [boleta_servicio.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_servicio.js)
*   Actualizar la función `llenarBoletaPanoramica` para inyectar el valor de `servicio.numero_servicio` en los nuevos elementos creados.

## 4. Verificación
*   Se validará que el código aparezca correctamente en todos los estados del servicio (En Reparación, Para Retirar, Entregado) sin romper la estética actual de la boleta.
