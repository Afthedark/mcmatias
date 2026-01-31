# Plan de Acción: Corrección de Boleta y Actualización de Interfaz

Este plan contempla la corrección técnica del formato de impresión y la actualización de los textos informativos para el usuario.

## 1. Ajuste de Dimensiones y Orientación (CSS)
*   **Archivo:** [boleta_servicio_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_servicio_print.css)
*   **Ajuste de Medidas:** Cambiar el ancho de `.boleta-panoramica` de `21.5cm` a **`21cm`** para que encaje perfectamente en el estándar A4.
*   **Forzar Vertical:** Actualizar la regla `@page panoramica` a `size: A4 portrait;`. Esto eliminará el problema de que la impresora intente girar la hoja a horizontal.

## 2. Actualización del Modal de Selección (JS)
*   **Archivo:** [boleta_servicio.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_servicio.js)
*   **Cambio de Textos:** En la función `mostrarSelectorFormato`, actualizaré el contenido del modal:
    *   Título: **"Imprimir Orden de Servicio"**
    *   Subtítulo: **"Generar documento en formato oficial"**
    *   Descripción del botón: Cambiar "21.5cm x 9cm" por **"21cm x 9cm"**.

## 3. Limpieza de Reglas de Impresión
*   Organizar las directivas `@media print` para asegurar que no haya interferencias entre el formato Ticket y el formato Panorámico, garantizando que el diseño siempre se posicione en la parte superior de la hoja.

## 4. Verificación Final
*   Se validará que al abrir el modal aparezcan los textos correctos.
*   Se confirmará que la vista previa de impresión muestre la hoja en vertical con la boleta ocupando solo el tercio superior (21x9cm).
