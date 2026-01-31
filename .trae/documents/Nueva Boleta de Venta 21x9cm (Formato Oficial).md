# Plan de Acción: Nueva Boleta de Venta 21x9cm (Formato Oficial)

Este plan detalla los pasos para implementar una nueva boleta de venta en formato panorámico (21x9cm) basada en el diseño de servicios técnicos, y simplificar el proceso de impresión ocultando los formatos antiguos.

## 1. Estructura de la Boleta (HTML)
*   **Archivo:** [boleta_ventas.html](file:///d:/myProjects/mcmatias/frontend/boleta_ventas.html)
*   Agregar un nuevo contenedor `<div id="boletaPanoramica" class="boleta-panoramica">`.
*   Implementar la estructura de **doble cuerpo** (talón de control y boleta principal) adaptada para ventas:
    *   Mostrar información de la sucursal, cliente y fecha.
    *   Incluir una **tabla de productos** compacta en el cuerpo derecho.
    *   Mostrar el total, método de pago y el código de venta (`VTA-XXXXX`) en negrita discreta.

## 2. Estilos de Impresión (CSS)
*   **Archivo:** [boleta_ventas_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_ventas_print.css)
*   Migrar las reglas de diseño panorámico desde el archivo de servicios técnicos:
    *   Dimensiones de `21cm x 9cm`.
    *   Configuración `@page panoramica { size: A4 portrait; margin: 0; }`.
    *   Estilos para el talón izquierdo y el cuerpo derecho con divisores negros.

## 3. Lógica de Impresión (JavaScript)
*   **Archivo:** [boleta_ventas.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_ventas.js)
*   **Simplificación del Modal:** Modificar `mostrarSelectorFormato` para que **solo** muestre el botón de "Formato Oficial (21cm x 9cm)", eliminando las opciones de Ticket y A4.
*   **Nueva Función de Llenado:** Implementar `llenarBoletaPanoramica(venta, doc)` para inyectar los datos de la venta y sus productos en el nuevo diseño.
*   **Control de Formato:** Actualizar `abrirVentanaImpresion` para que use el nuevo formato por defecto.

## 4. Verificación
*   Se validará que al presionar "Imprimir" en una venta, aparezca directamente la opción del Formato Oficial.
*   Se confirmará que la boleta se genere en una sola hoja vertical (A4) ocupando el tercio superior, con todos los productos listados correctamente.
