# Plan de Acción: Implementación de Formatos de Impresión 21.5cm x 9cm (Recepción y Entrega)

Implementaremos dos nuevos formatos de impresión optimizados para el tamaño de papel específico de **21.5cm de ancho x 9cm de alto**, cubriendo el ciclo completo del servicio técnico: **Orden de Recepción** y **Nota de Entrega**.

## 1. Nuevas Plantillas HTML (`frontend/boleta_servicio.html`)
Se agregarán dos estructuras ocultas diseñadas para el formato panorámico solicitado:

### A. Orden de Servicio (Recepción) - *Imagen 1*
- **Uso**: Al recibir el equipo para reparación.
- **Talón Izquierdo (30%)**: Resumen vertical compacto (N° Orden, Sucursal, Cliente, Falla, Fechas, Totales).
- **Cuerpo Derecho (70%)**:
  - Título central: "ORDEN DE SERVICIO TÉCNICO".
  - Datos de empresa y sucursal a la derecha.
  - Bloques de: Fecha, Cliente, Equipo, Falla, Diagnóstico, Solución.
  - Resumen financiero: Total, A Cuenta, Saldo.

### B. Nota de Entrega / Informe Técnico - *Imagen 2*
- **Uso**: Cuando el equipo es entregado al cliente (Estado: "Entregado").
- **Talón Izquierdo (30%)**:
  - Título: "NOTA DE ENTREGA".
  - **Texto de Conformidad**: "En calidad de cliente, estoy conforme con el servicio... He verificado la funcionalidad de mi equipo...".
  - Espacio para Firma y Nombre Completo del cliente.
- **Cuerpo Derecho (70%)**:
  - Título central: "INFORME TÉCNICO".
  - Fechas de Recepción y Terminación.
  - Detalle de Equipo, Diagnóstico y Solución.
  - Responsable Técnico y firma del cliente en el pie de página.

## 2. Estilos de Impresión Precisos (`frontend/css/boleta_servicio_print.css`)
Reglas CSS para asegurar que la impresión sea exacta en el papel de 21.5cm x 9cm.

- **Configuración de Página**:
  ```css
  @page {
      size: 21.5cm 9cm; /* Tamaño exacto solicitado */
      margin: 0;
  }
  ```
- **Layout Horizontal**: Uso de Flexbox para dividir el talón (izquierdo) y el cuerpo (derecho).
- **Tipografía y Espaciado**: Ajuste de fuentes (7pt a 10pt) y paddings mínimos para maximizar el uso del espacio de 9cm de altura.

## 3. Lógica de Impresión (`frontend/js/boleta_servicio.js`)
Actualización del sistema de impresión para manejar el nuevo tamaño.

- **Selector de Formato**: Agregar la opción **"Formato 21.5x9cm"** al modal de impresión.
- **Detección Automática**:
  - Si el estado es **"Entregado"**, se mostrará la **Nota de Entrega**.
  - En cualquier otro estado, se mostrará la **Orden de Servicio**.
- **Formateo de Datos**: Función `llenarBoletaPanoramica(servicio, tipo)` para mapear los datos del backend a las nuevas plantillas.

## 4. Ejecución
1.  **HTML**: Insertar las estructuras de las dos boletas en `boleta_servicio.html`.
2.  **CSS**: Agregar estilos para el contenedor de 21.5cm x 9cm y reglas `@page`.
3.  **JS**: Programar el llenado de datos y la apertura de la ventana de impresión con el tamaño correcto.
4.  **Pruebas**: Verificar que la impresión calce exactamente en las dimensiones indicadas.
