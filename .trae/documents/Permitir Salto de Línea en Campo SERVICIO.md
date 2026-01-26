# Plan de Acción: Permitir Salto de Línea en Campo "SERVICIO"

Para evitar que el texto del servicio (ej. "Mantenimiento Preventivo...") se corte, habilitaremos el ajuste de línea automático tanto en el talón como en el cuerpo de la boleta.

## 1. Modificación en `boleta_servicio.html`

### A. Sección Talón (Izquierda)
*   **Ubicación**: `<div class="field">...SERVICIO...</div>`
*   **Cambio**: Agregar la clase `field-multiline`.
*   **Resultado**: El texto podrá ocupar hasta 2 líneas automáticamente en el talón.

### B. Sección Cuerpo (Derecha)
*   **Ubicación**: `<div class="linea">...SERVICIO...</div>`
*   **Cambio**: Agregar la clase `line-multiline`.
*   **Resultado**: El texto podrá ocupar hasta 2 líneas en la sección principal.

## 2. Verificación de Estilos (`css/boleta_servicio_print.css`)
*   Ya existen las clases `.field-multiline` y `.line-multiline` configuradas para permitir saltos de línea y limitar a un máximo de 2 líneas (para no desbordar el papel de 9cm de alto). No se requiere editar el CSS, solo aplicar las clases en el HTML.

## Resultado Esperado
El nombre largo del servicio se mostrará completo (o hasta 2 líneas) en lugar de cortarse con puntos suspensivos ("...").

¿Procedo con estos cambios en el HTML?
