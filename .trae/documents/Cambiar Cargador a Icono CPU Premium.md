### **Implementación del Cargador "CPU Heartbeat"**

Sustituiré la animación actual por un efecto de **latido de corazón** aplicado directamente al icono del procesador, eliminando cualquier rastro de anillos orbitales.

#### **1. Rediseño del Cargador en CSS**
- **Archivo**: [styles.css](file:///d:/myProjects/mcmatias/frontend/css/styles.css)
- **Concepto Visual**:
    - **Latido Tecnológico**: El icono **`bi-cpu-fill`** tendrá una animación de "doble latido" (thump-thump).
    - **Pulso de Energía**: Con cada latido, el icono aumentará ligeramente de tamaño y emitirá un resplandor neón azul intenso que se desvanece suavemente, como si el procesador estuviera "vivo" y bombeando datos.
    - **Simplicidad Premium**: Sin anillos ni elementos extra. Solo el procesador en el centro del overlay oscuro sutil con desenfoque.

#### **2. Actualización de Lógica en JavaScript**
- **Archivo**: [components.js](file:///d:/myProjects/mcmatias/frontend/js/components.js)
- **Cambio**: Modificaré la función `showNavigationLoader` para que inyecte únicamente el icono de la CPU con la nueva clase de animación.

¿Procedo con esta nueva versión del cargador pulsante?