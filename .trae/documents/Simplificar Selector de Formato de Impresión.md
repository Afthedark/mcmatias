# Plan de Acción: Simplificar Selector de Formato de Impresión

Para cumplir con el requerimiento de ocultar las opciones "Ticket 80mm" y "Boleta A4" y mostrar únicamente el formato "21.5x9cm" de manera elegante, realizaremos los siguientes cambios:

## 1. Modificación de la Modal (`mostrarSelectorFormato`)

*   **Archivo**: `frontend/js/boleta_servicio.js`
*   **Cambio**: Reestructurar el HTML inyectado en la función `mostrarSelectorFormato`.
*   **Detalle**:
    *   Eliminar las columnas (`col-6`) que contienen los botones de "Ticket 80mm" y "Boleta A4".
    *   Mantener únicamente el botón de "Formato 21.5x9cm".
    *   Ajustar el diseño para que este único botón se vea centrado y destacado (posiblemente usando un contenedor `col-12` o `col-md-8 mx-auto` para un mejor aspecto visual).
    *   Actualizar el texto o icono si es necesario para que se vea más "elegante" y definitivo.

## 2. Resultado Esperado
Al hacer clic en "Imprimir", el usuario verá una modal limpia con una única opción clara para generar la boleta en formato panorámico, eliminando la confusión de formatos antiguos.

¿Procedo con la actualización de la modal?
