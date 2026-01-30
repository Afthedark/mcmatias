### **Implementación de Modo Oscuro Nativo (Bootstrap 5)**

Aprovecharemos las capacidades nativas de Bootstrap 5.3+ para implementar un selector de temas (Claro/Oscuro) con persistencia.

#### **1. Configuración de Variables CSS**
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Acción**: 
    - Definiré un bloque `[data-bs-theme="dark"]` para sobrescribir las variables de color personalizadas (fondos, textos, sombras) cuando el modo oscuro esté activo.
    - El fondo "confortable" pasará de un blanco perla a un **azul noche profundo / gris carbón** premium.

#### **2. Selector de Tema en el Header**
- **Archivo**: [components.js](file:///d:/myProjects/mcmatias/frontend/js/components.js)
- **Acción**: 
    - Añadiré un botón de alternancia (toggle) en el Header, junto al menú de usuario, con iconos dinámicos (Sol/Luna).
    - Implementaré la lógica para cambiar el atributo `data-bs-theme` en el elemento `<html>`.

#### **3. Persistencia con LocalStorage**
- **Acción**: 
    - El sistema recordará la preferencia del usuario (claro u oscuro) incluso después de cerrar el navegador.
    - Se aplicará el tema automáticamente al cargar cualquier página del sistema.

#### **4. Adaptación de Componentes**
- Me aseguraré de que las tarjetas (cards), tablas, sidebar y el cargador (spinner) se adapten perfectamente al nuevo esquema de colores oscuros, manteniendo la estética tech premium.

¿Deseas que proceda con la implementación del modo oscuro ahora mismo?