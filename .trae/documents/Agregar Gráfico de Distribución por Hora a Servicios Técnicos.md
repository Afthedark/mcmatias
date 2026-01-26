## Plan de Implementación

### 1. Backend - Modificar ReporteServiciosDashboardView
- **Archivo**: `d:\myProjects\mcmatias\backend\api\views_reports.py`
- **Cambios**: Agregar lógica para obtener distribución de servicios por hora
- **Nueva funcionalidad**: 
  - Usar `ExtractHour` de Django para agrupar servicios por hora
  - Crear datos para 24 horas (0-23) con valores 0 para horas sin datos
  - Retornar nuevo objeto `grafico_hora` en la respuesta JSON

### 2. Frontend HTML - Agregar nuevo contenedor de gráfico
- **Archivo**: `d:\myProjects\mcmatias\frontend\reportes_servicios.html`
- **Cambios**: 
  - Agregar nuevo card Bootstrap para el gráfico de distribución por hora
  - Incluir canvas con id="chartHora"
  - Posicionar en el layout existente (debajo de los gráficos actuales)

### 3. Frontend JavaScript - Implementar renderizado del gráfico
- **Archivo**: `d:\myProjects\mcmatias\frontend\js\pages\reportes_servicios.js`
- **Cambios**:
  - Agregar nuevo bloque de código para renderizar `chartHora`
  - Usar tipo 'line' para mostrar la distribución temporal
  - Configurar colores y opciones consistentes con el diseño existente
  - Incluir validación de datos existentes

### 4. Verificación y Testing
- Verificar que el gráfico se renderice correctamente
- Validar que los datos se carguen sin errores
- Comprobar la responsividad del nuevo elemento
- Asegurar compatibilidad con filtros de fecha y sucursal

La implementación seguirá los patrones existentes del código, manteniendo consistencia en estilos, estructura y funcionalidad.