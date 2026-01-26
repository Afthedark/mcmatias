## Plan de Cambio de Marca en Sidebar

### 1. Modificar `renderSidebar`
**Archivo**: `d:\myProjects\mcmatias\frontend\js\components.js`

Voy a actualizar el título de la marca en el sidebar para que refleje el nuevo nombre y formato solicitado.

**Cambio propuesto:**
- **De**: `<h3>MCMatias</h3>`
- **A**: `<h3>MULTICENTRO<br>MATIAS</h3>`

El uso de `<br>` permitirá el salto de línea visual, mostrando "MULTICENTRO" arriba y "MATIAS" abajo, tal como se solicitó.

### 2. Verificación
- Confirmar que el cambio se refleje en el HTML generado por la función `renderSidebar`.
- No se requieren cambios de CSS ya que el contenedor del título (`.sidebar-brand h3`) debería adaptarse al contenido de múltiples líneas automáticamente.