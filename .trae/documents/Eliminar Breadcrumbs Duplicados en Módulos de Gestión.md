### **Eliminación de Breadcrumbs Duplicados**

He detectado que los módulos de **Ventas**, **Servicio Técnico** y **Clientes** tienen breadcrumbs (Inicio / ...) definidos tanto en el HTML como en el componente de cabecera dinámico (`js/components.js`), lo que causa la repetición visual.

#### **1. Limpieza de HTML**
- **Archivos**: 
    - [servicios_tecnicos.html](file:///d:/myProjects/mcmatias/frontend/servicios_tecnicos.html)
    - [ventas.html](file:///d:/myProjects/mcmatias/frontend/ventas.html)
    - [clientes.html](file:///d:/myProjects/mcmatias/frontend/clientes.html)
- **Acción**: Eliminar el bloque `<nav aria-label="breadcrumb">` dentro de la clase `.page-header`. 
- **Resultado**: Se mantendrá el título principal de la página (H1) con su icono, pero se eliminará la línea repetida de navegación, dejando solo la que aparece en la barra superior (Header).

#### **2. Estandarización**
- Verificaré si otros archivos HTML tienen este mismo bloque redundante para asegurar que todo el sistema sea consistente con el nuevo diseño de cabecera dinámico.

¿Procedo con la eliminación de estos elementos duplicados?