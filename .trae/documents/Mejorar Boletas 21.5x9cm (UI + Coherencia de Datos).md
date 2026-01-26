# Mejorar Boletas 21.5x9cm (UI + Coherencia de Datos)

Objetivo: que **ambas boletas panorámicas** (Orden de Servicio y Nota de Entrega) se vean prolijas dentro de **21.5cm x 9cm**, sin cortes/solapes, y que los **datos sean consistentes** (mismos valores en talón y cuerpo, fechas coherentes, sin placeholders incorrectos).

## 1) Ajustes de Estructura (HTML)
Archivos: [boleta_servicio.html](file:///d:/myProjects/mcmatias/frontend/boleta_servicio.html)
- Reorganizar el encabezado del cuerpo derecho en una grilla/estructura fija para evitar que el bloque de empresa (derecha) se superponga con el título.
- Normalizar la ubicación de campos repetidos (número de orden, sucursal, cliente, totales) para que el talón y el cuerpo muestren el mismo dato y formato.
- Reemplazar textos “fijos” por placeholders controlados (por ejemplo, si no existe `fecha_entrega`, mostrar `Pendiente` de forma uniforme).

## 2) Ajustes de Estilos (CSS) para que “entre” en 21.5x9
Archivos: [boleta_servicio_print.css](file:///d:/myProjects/mcmatias/frontend/css/boleta_servicio_print.css)
- Corregir reglas de impresión para que el formato panorámico realmente se imprima:
  - Incluir `.boleta-panoramica` en la sección de `@media print` donde se controla `visibility` (ahora solo contempla ticket y A4).
- Hacer que el tamaño de página aplique correctamente al formato panorámico:
  - Usar “named pages” de CSS (`page: panoramica;` en el contenedor) para que `@page panoramica { size: 21.5cm 9cm; }` tenga efecto.
- Mejorar legibilidad y evitar cortes:
  - Reducir/normalizar márgenes internos.
  - Ajustar tipografías y line-height.
  - Permitir wrap en campos largos (Falla, Dirección) con límites (ej. 2 líneas) en lugar de `nowrap` + ellipsis para todo.
  - Definir anchos fijos y alineaciones consistentes para “TOTAL / A CUENTA / SALDO”.

## 3) Coherencia de Datos (JS): mapeo correcto y formateo
Archivos: [boleta_servicio.js](file:///d:/myProjects/mcmatias/frontend/js/boleta_servicio.js)
- Corregir el formateo de fechas/hora:
  - Evitar duplicaciones tipo `13:02 13:02` (ahora se concatena hora dos veces).
  - Estándar: `dd/mm/yyyy HH:mm` para recepción y entrega.
- Eliminar placeholders incoherentes:
  - Reemplazar `SERVICIO: 1` por un dato real: usar `id_categoria` (si existe) y/o `nombre_categoria` (según el diseño), en ambos (talón y cuerpo).
  - Unificar “Entregado en / Fecha terminado”: si hay `fecha_entrega` mostrarla; si no, `Pendiente`.
- Asegurar consistencia entre talón y cuerpo:
  - Mismo `cliente`, `celular`, `equipo`, `falla`, `total`, `adelanto`, `saldo`, `estado`.
  - Fallbacks uniformes (`-` o `Pendiente`) cuando falte un campo.

## 4) Validación Visual y de Impresión
- Generar boleta panorámica para:
  - Servicio en **En Reparación** (debe salir “Orden de Servicio”).
  - Servicio en **Entregado** (debe salir “Nota de Entrega”).
- Verificar:
  - Nada se corta fuera del área 21.5cm x 9cm.
  - No hay solapes entre encabezado y bloque de empresa.
  - Fechas y montos coinciden y son coherentes.
  - Impresión a PDF con tamaño personalizado 215mm x 90mm respeta márgenes.

## Resultado Esperado
- Boletas panorámicas con layout estable (talón + cuerpo), tipografía equilibrada y datos consistentes.
- Impresión confiable en papel **21.5x9cm** sin ajustes manuales por boleta.