# Plan de Acción: Implementación de Adelanto de Pago

Este plan detalla los pasos para incorporar el registro opcional de adelantos y el cálculo de saldos en el módulo de Servicios Técnicos, manteniendo la integridad del control de acceso (RBAC).

## 1. Backend (API y Base de Datos)
### Modificación del Modelo `ServicioTecnico`
- **Archivo:** `backend/api/models.py`
- **Acción:** Agregar campos:
  - `adelanto`: Decimal (default 0, nullable/blank).
  - `saldo`: Decimal (default 0, nullable/blank).
- **Lógica:** El `saldo` se calculará automáticamente como `costo_estimado - adelanto`.

### ⚠️ Tarea del Usuario (Migraciones)
- **Acción:** Una vez modificados los modelos, usted deberá ejecutar en su terminal:
  1. `python manage.py makemigrations`
  2. `python manage.py migrate`

### Actualización de Serializers y Vistas
- **Archivo:** `backend/api/serializers.py`
  - Incluir `adelanto` y `saldo` en `ServicioTecnicoSerializer`.
- **Archivo:** `backend/api/views.py`
  - Asegurar que al crear/actualizar, si viene un `adelanto`, se recalcule el `saldo`.
  - Validar que `adelanto` no supere el `costo_estimado` (si este existe).

## 2. Frontend (Interfaz de Usuario)
### Formulario de Registro/Edición
- **Archivo:** `frontend/servicios_tecnicos.html`
  - Agregar input "Adelanto (Bs)" en la sección "Detalles del Servicio" (Paso 3).
  - El campo será **opcional**.
- **Archivo:** `frontend/js/pages/servicios_tecnicos.js`
  - Actualizar función `actualizarResumen()` para calcular `Saldo` en tiempo real.
  - Mostrar `Adelanto` y `Saldo` en el panel lateral de resumen.
  - Incluir el campo `adelanto` en el `FormData` enviado en `guardarServicio()`.

### Visualización de Detalles
- **Archivo:** `frontend/servicios_tecnicos.html` (Modal Detalle)
  - Agregar filas para "Adelanto" y "Saldo Pendiente" en la tabla de información financiera.
- **Archivo:** `frontend/js/pages/servicios_tecnicos.js`
  - Mapear los nuevos datos en la función `verDetalle()`.

## 3. Impresión (Boletas y Tickets)
### Plantillas de Impresión
- **Archivo:** `frontend/boleta_servicio.html`
  - **Formato Ticket:** Agregar líneas para "A cuenta/Adelanto" y "Saldo".
  - **Formato A4:** Agregar campos en la sección de totales.
- **Archivo:** `frontend/js/boleta_servicio.js`
  - Inyectar los valores de `adelanto` y `saldo` en el momento de la generación.

## 4. Verificación de Permisos (RBAC)
- **Impacto:** Nulo en la estructura de roles.
- **Confirmación:**
  - **Super Admin / Admin Sucursal / Téc. + Cajero:** Podrán registrar adelantos al crear/editar servicios.
  - **Técnico (Rol 3):** Podrá ver la información de adelanto/saldo en sus servicios asignados (lectura), pero solo editará si se mantiene la lógica actual de permisos de edición.
  - **Cajero (Rol 4):** Sigue sin acceso al módulo.

## 5. Ejecución
¿Desea proceder con la implementación de los cambios en el código siguiendo este orden?