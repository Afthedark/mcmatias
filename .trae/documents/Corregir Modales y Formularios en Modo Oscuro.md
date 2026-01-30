### **Corrección de Modales y Formularios en Modo Oscuro**

He identificado que los modales y campos de entrada (inputs) no se están adaptando correctamente al tema oscuro debido a la falta de estilos específicos que sobrescriban los valores predeterminados de Bootstrap.

#### **1. Estilización de Modales**
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Acciones**:
    - Forzar el fondo de `.modal-content` para que use `var(--card-bg)` en modo oscuro.
    - Cambiar los bordes de `.modal-header` y `.modal-footer` para que coincidan con `var(--border-color)`.
    - Asegurar que el botón de cerrar (`.btn-close`) sea blanco en modo oscuro para mejorar la visibilidad.

#### **2. Mejora de Contraste en Formularios**
- **Acciones**:
    - **Etiquetas Legibles**: Ajustar `.form-label` para que use `var(--text-main)`, eliminando el tono gris oscuro que dificulta la lectura en fondos oscuros.
    - **Inputs Tech Premium**: Rediseñar `.form-control` y `.form-select` en modo oscuro con:
        - Fondo oscuro translúcido o sólido (`rgba(255, 255, 255, 0.05)`).
        - Bordes sutiles que resalten al enfocar.
        - Color de texto claro y nítido.
    - **Campos Deshabilitados**: Ajustar el contraste de los campos `disabled` para que el texto siga siendo legible aunque el campo esté inactivo.

#### **3. Refinamiento de Dropdowns en Modales**
- Asegurar que los menús desplegables (como el buscador de categorías en los modales) hereden correctamente los colores del tema oscuro sin bordes o fondos blancos accidentales.

¿Procedo con estos ajustes para que los modales luzcan perfectos en modo oscuro?