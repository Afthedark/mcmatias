# Plan de Acción: Motivo de Anulación en Servicios Técnicos

Este plan detalla los pasos para implementar un campo de "Motivo de Anulación" en el módulo de Servicios Técnicos, integrando el flujo de captura de datos similar al de Ventas.

## 1. Cambios en el Backend (API)

### **Modelo de Datos**
*   **Archivo:** [models.py](file:///d:/myProjects/mcmatias/backend/api/models.py)
*   Agregar los campos `motivo_anulacion` (TextField, null=True, blank=True) y `fecha_anulacion` (DateTimeField, null=True, blank=True) a la clase `ServicioTecnico`.

### **IMPORTANTE: Gestión de Base de Datos**
*   **Acción del Usuario:** Una vez realizados los cambios en el código, **el usuario ejecutará manualmente** los comandos en la terminal:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

### **Serialización**
*   **Archivo:** [serializers.py](file:///d:/myProjects/mcmatias/backend/api/serializers.py)
*   Incluir `motivo_anulacion` y `fecha_anulacion` en la lista de campos de `ServicioTecnicoSerializer`.

### **Lógica de Negocio**
*   **Archivo:** [views.py](file:///d:/myProjects/mcmatias/backend/api/views.py)
*   Actualizar el método `anular` en `ServicioTecnicoViewSet` para recibir el motivo desde el frontend y registrar la fecha actual de anulación.

## 2. Cambios en el Frontend (Interfaz de Usuario)

### **Interfaz (HTML)**
*   **Archivo:** [servicios_tecnicos.html](file:///d:/myProjects/mcmatias/frontend/servicios_tecnicos.html)
*   Modificar el modal `anularServicioModal` para agregar un campo de texto (`textarea`) con id `motivoAnulacionServicio`.

### **Lógica (JavaScript)**
*   **Archivo:** [servicios_tecnicos.js](file:///d:/myProjects/mcmatias/frontend/js/pages/servicios_tecnicos.js)
*   Actualizar la función `confirmarAnulacion()` para capturar el valor de `motivoAnulacionServicio` y enviarlo en la petición `apiPatch`.
*   Actualizar la función `verDetalle()` para mostrar el motivo de anulación y la fecha cuando se consulta un servicio con estado "Anulado".
