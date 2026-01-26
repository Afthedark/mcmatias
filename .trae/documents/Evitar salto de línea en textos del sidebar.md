## Objetivo
Evitar que el texto de los ítems del sidebar se parta en 2 líneas (salto de línea) para:
- “Graficos y Reportes de Servicios Tecnico”
- “Graficos y Reportes de Ventas”

## Diagnóstico
El sidebar renderiza el texto dentro de un `<span>` (flex). Hoy el contenedor tiene `white-space: nowrap`, pero el `<span>` no tiene reglas de recorte/ellipsis y en flex puede terminar envolviendo/rompiéndose visualmente.

## Plan de acción
### 1) Ajustar CSS del texto del sidebar
**Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css#L224-L272)
- Actualizar la regla de `.nav-link span` para que el texto sea siempre de 1 línea y, si no entra, se recorte con ellipsis.
- Reglas a aplicar en `.nav-link span`:
  - `flex: 1 1 auto;`
  - `min-width: 0;`
  - `white-space: nowrap;`
  - `overflow: hidden;`
  - `text-overflow: ellipsis;`

## Verificación
- Confirmar que el sidebar ya no haga salto de línea en esos dos ítems.
- Confirmar que no rompe el modo `sidebar-collapsed` (donde el `<span>` se oculta).