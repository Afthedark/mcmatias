# Aclaración y Plan de Acción: Fecha de Entrega en Boleta

## 1. Aclaración
Sí, el campo `fecha_entrega` ya se actualiza automáticamente en el backend cuando el estado cambia a "Entregado". Esto lo confirmé revisando el código del modelo (`backend/api/models.py`), donde existe la lógica:
```python
if self.estado == 'Entregado':
    if not self.fecha_entrega:
        self.fecha_entrega = timezone.now()
```
Sin embargo, **hay un problema visual en la impresión de la boleta**:
Aunque el backend tenga la fecha correcta, el frontend (`boleta_servicio.js`) está mostrando "Pendiente" o la fecha incorrecta en la boleta impresa si el estado es "Para Retirar" o si no se maneja correctamente la visualización.

## 2. Plan de Acción (Solo Frontend)

Para asegurar que la boleta muestre siempre la fecha correcta (o la actual si se está entregando en ese momento), realizaremos los siguientes ajustes en `frontend/js/boleta_servicio.js`:

### A. Ajustar Lógica de Visualización de Fecha
Modificar la función `llenarBoletaPanoramica` para que:
1.  Si el servicio **ya tiene** una `fecha_entrega` registrada (backend), use esa.
2.  Si el estado es **"Entregado"** pero por alguna razón no viene fecha (ej. latencia), use la **fecha/hora actual** del navegador como respaldo visual.
3.  Si el estado es **"Para Retirar"**, mostrar la fecha actual como "Fecha Estimada" o mantener "Pendiente" si no se ha concretado la entrega, pero permitiendo que visualmente se vea la fecha si se está imprimiendo la nota de entrega para firmar.

### B. Estandarización de Campos
Asegurar que tanto el campo "Fecha" (talón izquierdo) como "FECHA TERMINADO" (cuerpo derecho) usen la misma fuente de datos (`fechaEntregaEfectiva`).

**Nota:** No tocaremos el backend. Solo aseguraremos que el JS presente la fecha de manera inteligente al momento de imprimir.

¿Procedo con estos ajustes en el frontend?
