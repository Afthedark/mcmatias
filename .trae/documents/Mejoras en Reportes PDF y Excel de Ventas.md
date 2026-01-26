## Plan de Implementación: Mejoras en Reportes PDF y Excel de Ventas

### 1. Reporte PDF (`ReporteVentasPDFView`)
**Archivo**: `d:\myProjects\mcmatias\backend\api\views_reports.py`

Voy a modificar la clase `ReporteVentasPDFView` para cumplir con los requerimientos:

- **Nueva Columna "Vendedor"**: Agregaré una columna que muestre el nombre del usuario que realizó la venta (`v.id_usuario.nombre_apellido`).
- **Lógica de Estado**: 
  - Si el estado es "Anulada" -> Mostrar "Anulado"
  - Si el estado es válido (cualquier otro) -> Mostrar "Completado" (en lugar de "OK")
- **Ajuste de Tabla**: Actualizaré los encabezados y las filas de datos para incluir la nueva columna.

**Cambios específicos:**
- Encabezados: `['#', 'Fecha', 'Boleta', 'Cliente', 'Vendedor', 'Estado', 'Monto (Bs)']`
- Datos: Agregar `v.id_usuario.nombre_apellido if v.id_usuario else 'S/N'` en la posición correcta.
- Estado: Lógica condicional actualizada.

### 2. Reporte Excel (`ReporteVentasExcelView`)
**Archivo**: `d:\myProjects\mcmatias\backend\api\views_reports.py`

Voy a modificar la clase `ReporteVentasExcelView`:

- **Renombrar Columna**: Cambiar el encabezado de 'Usuario' a 'Vendedor'.
- **Ubicación**: Mantener la posición actual, solo cambiando la etiqueta.

**Cambios específicos:**
- Headers: `['#', 'Fecha', 'Boleta', 'Cliente', 'Vendedor', 'Sucursal', 'Tipo Pago', 'Estado', 'Motivo Anulacion', 'Monto Total']`

### 3. Verificación
- Verificar que no haya errores de sintaxis en el archivo Python.
- Asegurar que las columnas coincidan con los datos en ambos reportes.
- Confirmar que la lógica de "Completado"/"Anulado" funcione correctamente.