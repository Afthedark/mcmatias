**Plan: Configuración Dual y Proxy Netlify**

Implementaré los cambios en el frontend manteniendo la flexibilidad para desarrollo local.

**Pasos:**
1. **Crear archivo `_redirects`**: En la raíz del frontend para el despliegue en Netlify.
2. **Actualizar `api.js`**: 
   - Agregar la URL del proxy `/api` como activa.
   - Mantener la URL local `http://127.0.0.1:8000/api` comentada para pruebas locales.

¿Estás de acuerdo con este plan?