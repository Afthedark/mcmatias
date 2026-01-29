**Plan: Corrección Segura de Redirección (Race Condition)**

Implementaré una solución quirúrgica para evitar que el sistema te expulse a `unauthorized.html` antes de que cargue tu rol.

**Pasos Técnicos:**
1. **En `auth.js`**: Descargar el perfil inmediatamente tras un login exitoso (con manejo de errores para que no bloquee).
2. **En `api.js`**: Hacer que el redireccionamiento por error 403 sea menos agresivo durante el inicio de la aplicación.
3. **En `roles_vistas.js`**: Añadir una validación para evitar redirecciones si los datos del usuario aún están en proceso de carga inicial.

Este plan garantiza que el frontend sea más estable sin alterar ninguna funcionalidad existente.

¿Procedo con los cambios?