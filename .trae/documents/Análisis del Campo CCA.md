# Plan de Acción: Mejorar Visualización de Estados con Bootstrap Icons

Para mejorar la interfaz visual del módulo de Servicios Técnicos, reemplazaremos los indicadores de texto/unicode actuales por iconos profesionales de la librería Bootstrap Icons en las vistas de lista y detalle.

## 1. Actualización de Iconos y Estilos
Modificaré la función `getEstadoBadge` en `frontend/js/pages/servicios_tecnicos.js` para asignar un icono específico a cada estado:

| Estado | Icono Bootstrap | Color | Significado Visual |
| :--- | :--- | :--- | :--- |
| **En Reparación** | `bi-tools` | Primary (Azul) | Trabajo en curso |
| **Para Retirar** | `bi-exclamation-circle-fill` | Warning (Amarillo) | Acción requerida (Cliente debe recoger) |
| **Entregado** | `bi-check-circle-fill` | Success (Verde) | Proceso finalizado exitosamente |
| **Anulado** | `bi-x-circle-fill` | Danger (Rojo) | Servicio cancelado |

## 2. Cambios en Código (`servicios_tecnicos.js`)
*   **Función `getEstadoBadge`**: Reemplazar los caracteres unicode (🔵, 🟡, 🟢, ❌) por etiquetas `<i>` con las clases correspondientes (ej: `<i class="bi bi-tools me-1"></i>`).
*   Se agregará la clase `me-1` (margin-end-1) para dar espacio entre el icono y el texto.

## 3. Consideración sobre el Desplegable (Select)
*   El campo de selección (`<select>`) mantendrá los indicadores unicode actuales, ya que el estándar HTML no permite insertar iconos SVG/HTML dentro de las opciones de un desplegable nativo. La mejora visual principal se reflejará en la **Tabla de Servicios** y en el **Modal de Detalles**.

¿Procedo con la implementación de estos iconos?
