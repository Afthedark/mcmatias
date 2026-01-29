**Plan: Configuración Dual de URL en api.js**

Actualizaré el archivo [api.js](file:///d:/myProjects/mcmatias/frontend/js/api.js) para incluir tanto la dirección local como la del VPS, permitiéndote cambiar entre ellas fácilmente mediante comentarios.

**Cambios propuestos:**

1.  **Definición de URLs**:
    - Mantener `http://127.0.0.1:8000/api` para desarrollo local.
    - Agregar `http://167.86.66.229:8000/api` para el entorno VPS.
2.  **Instrucciones**: Añadir comentarios claros para que sepas qué línea descomentar según el entorno en el que estés probando.

**Nuevo bloque de código en `api.js`:**

```javascript
// --- CONFIGURACIÓN DE URL ---
// Descomenta la URL que desees usar:

// 1. DESARROLLO LOCAL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 2. PRODUCCIÓN / VPS
// const API_BASE_URL = 'http://167.86.66.229:8000/api';
// ----------------------------
```

¿Estás de acuerdo con esta estructura para proceder con la edición del archivo?