### **Corrección de Tablas en Modo Oscuro (Bootstrap 5)**

He analizado las imágenes y el código actual. El problema se debe a que algunas filas mantienen fondos claros o el texto no tiene suficiente contraste sobre el fondo oscuro.

#### **1. Ajuste de Colores y Contraste**
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Acciones**:
    - **Texto Legible**: Forzar el color del texto a blanco suave (`#f1f5f9`) para todas las celdas (`td`) y encabezados (`th`) en modo oscuro.
    - **Fondo Consistente**: Asegurar que todas las filas (`tr`) tengan un fondo oscuro, eliminando cualquier fila blanca residual.
    - **Bordes Claros**: Ajustar el color de los bordes entre celdas (`border-color`) para que sean visibles pero sutiles en la oscuridad.

#### **2. Refinamiento de Interacción**
- **Zebra Striping**: Implementar un efecto de filas alternas (cebreado) muy sutil para facilitar la lectura de datos complejos.
- **Hover Premium**: Ajustar el efecto al pasar el mouse (`hover`) para que ilumine ligeramente la fila sin perder la legibilidad del texto.

#### **3. Compatibilidad con Bootstrap 5**
- Sobrescribir las variables específicas de Bootstrap (`--bs-table-bg`, `--bs-table-color`) para que se integren perfectamente con el tema "Tech Premium" del sistema.

¿Procedo con estas correcciones para que las tablas se vean perfectas en modo oscuro?