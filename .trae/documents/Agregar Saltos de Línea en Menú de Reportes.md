## Plan de Corrección Visual: Saltos de Línea en Sidebar

### 1. Modificar `SIDEBAR_CONFIG`
**Archivo**: `d:\myProjects\mcmatias\frontend\js\components.js`

Voy a agregar etiquetas HTML `<br>` para forzar el salto de línea en los ítems del menú, tal como solicitó el usuario y como ya se utiliza en otros elementos (ej. 'Categorías<br>Servicios Técnicos').

**Cambios propuestos:**
- **De**: `text: 'Reporte Servicios Tecnicos'`
- **A**: `text: 'Reportes<br>Servicios Técnicos'`
  *(Nota: corregiré también la tilde en 'Técnicos' para mejor ortografía)*

- **De**: `text: 'Reporte Ventas'`
- **A**: `text: 'Reportes<br>Ventas'`
  *(Para mantener consistencia visual con el otro ítem)*

Esto hará que "Reportes" quede en la primera línea y el detalle ("Servicios Técnicos" o "Ventas") en la segunda, mejorando la legibilidad y evitando el truncamiento horizontal.

### 2. Verificación
- Confirmar que los cambios se reflejen en el archivo JS.
- El sistema de renderizado del sidebar (`components.js`) ya soporta HTML en el campo `text`, por lo que el `<br>` funcionará correctamente.