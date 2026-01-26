# Plan de Acción: Actualizar Campos Marca y Modelo en Boleta

Para cumplir con el requerimiento de mostrar la **Marca** y el **Modelo** por separado en lugar de "Servicio" y "Descripción" en la Orden de Servicio (estado "En Reparación"), realizaré los siguientes cambios:

## 1. Modificación de Estructura HTML (`frontend/boleta_servicio.html`)

En la sección `#formatoOrdenServicio` (tanto en el talón izquierdo como en el cuerpo derecho):

*   **Campo "SERVICIO"**:
    *   Cambiar etiqueta de `SERVICIO:` a `MARCA:`.
    *   Cambiar la clase del valor de `servicio-id` a `dispositivo-marca`.
*   **Campo "DESCRIPCIÓN"**:
    *   Cambiar etiqueta de `DESCRIPCIÓN:` a `MODELO:`.
    *   Cambiar la clase del valor de `dispositivo-desc` (o `dispositivo-full`) a `dispositivo-modelo`.

## 2. Actualización de Lógica JS (`frontend/js/boleta_servicio.js`)

En la función `llenarBoletaPanoramica`:

*   Agregar lógica para inyectar los datos específicos:
    *   `.dispositivo-marca` ← `servicio.marca_dispositivo`
    *   `.dispositivo-modelo` ← `servicio.modelo_dispositivo`
*   Mantener la lógica existente de `dispositivo-full` (Marca + Modelo) solo para la "Nota de Entrega" (estado Entregado), que no se solicitó modificar.

## Resultado Esperado
La boleta de "Orden de Servicio" mostrará claramente:
*   **MARCA:** [Marca del backend]
*   **MODELO:** [Modelo del backend]

En lugar de mostrar la Categoría del servicio y la descripción combinada.

¿Procedo con estos cambios?
