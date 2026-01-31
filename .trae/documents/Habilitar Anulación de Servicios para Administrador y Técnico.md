# Plan de Implementación: Habilitar Anulación de Servicios para Admin y Técnico

Para permitir que los roles de **Administrador (2)** y **Técnico (3)** puedan anular servicios técnicos, realizaré cambios tanto en el backend (seguridad) como en el frontend (visibilidad).

## 1. Backend: Actualizar Permisos en la API
Actualmente, el servidor bloquea las solicitudes de anulación si el usuario tiene el rol de Técnico (3).

**Cambio en [views.py](file:///d:/myProjects/mcmatias/backend/api/views.py):**
*   Modificar el método `anular` dentro de `ServicioTecnicoViewSet`.
*   Actualizar la validación de roles para incluir el número **3** en la lista de permitidos.
*   Actualizar el comentario de documentación para reflejar los nuevos permisos.

## 2. Frontend: Actualizar Sistema de Permisos (RBAC)
La opción de anulación no aparece en la interfaz porque estos roles no tienen la acción `anular_servicios` asignada en su configuración de permisos.

**Cambio en [roles_vistas.js](file:///d:/myProjects/mcmatias/frontend/js/roles_vistas.js):**
*   **Rol 2 (Administrador):** Agregar `'anular_servicios'` a su lista de `acciones`.
*   **Rol 3 (Técnico):** Agregar `'anular_servicios'` a su lista de `acciones`.

## 3. Verificación
*   Se verificará que al iniciar sesión con un usuario de rol Administrador o Técnico, el botón rojo de anulación (índice `x-circle`) sea visible en la tabla de servicios técnicos.
*   Se probará que la solicitud al backend funcione correctamente y el estado del servicio cambie a "Anulado".
