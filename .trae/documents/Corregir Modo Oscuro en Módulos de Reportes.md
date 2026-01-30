### **Corrección del Modo Oscuro en Reportes**

El problema se debe a que las páginas de reportes tienen clases de Bootstrap hardcodeadas (`bg-light` en el cuerpo y `bg-white` en los encabezados de las tarjetas) que bloquean la aplicación automática del tema oscuro.

#### **1. Limpieza de Clases en HTML**
- **Archivos**: 
    - [reportes_servicios.html](file:///d:/myProjects/mcmatias/frontend/reportes_servicios.html)
    - [reportes_ventas.html](file:///d:/myProjects/mcmatias/frontend/reportes_ventas.html)
    - Y otros módulos afectados como `productos.html`, `clientes.html`, etc.
- **Acciones**:
    - Eliminar `class="bg-light"` de la etiqueta `<body>`.
    - Eliminar `class="bg-white"` de todos los elementos `<div class="card-header">`.
    - Esto permitirá que las variables de tema definidas en `styles.css` (`var(--body-bg)` y `var(--card-bg)`) tomen el control correctamente.

#### **2. Estandarización en CSS**
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Acción**: Asegurar que los `.card-header` no tengan un fondo blanco por defecto y que hereden el color de fondo de la tarjeta o usen uno adaptativo para el modo oscuro.

#### **3. Revisión de Gráficos (Chart.js)**
- Verificaré si las etiquetas y cuadrículas de los gráficos necesitan ajustes de color para ser legibles en el modo oscuro, sincronizándolos con el tema actual.

¿Procedo con la limpieza de estas clases para activar el modo oscuro en estos módulos?