## Objetivo
- Dejar el backend consistente con Bolivia usando `TIME_ZONE = 'America/La_Paz'` y mantener `USE_TZ = True` (DB en UTC, presentación en hora local).

## Diagnóstico actual (riesgos reales)
- En [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py#L115-L124) `TIME_ZONE` está duplicado y hoy termina efectivo en `UTC`.
- Hay lugares que usan hora/fecha en UTC o naive:
  - Correlativos por año usan `datetime.now().year` (naive) en [models.py](file:///d:/myProjects/mcmatias/backend/api/models.py#L226-L246) y [models.py](file:///d:/myProjects/mcmatias/backend/api/models.py#L307-L328).
  - Reportes usan `timezone.now().date()` (fecha en UTC) + `make_aware()` en [views_reports.py](file:///d:/myProjects/mcmatias/backend/api/views_reports.py#L23-L42), lo que puede “mover” el día cerca de medianoche Bolivia.
  - Reportes formatean datetimes con `strftime()` sin `localtime()` (riesgo de mostrar horas en UTC) en [views_reports.py](file:///d:/myProjects/mcmatias/backend/api/views_reports.py).

## Cambios de configuración (mínimos y seguros)
- En [settings.py](file:///d:/myProjects/mcmatias/backend/config/settings.py) dejar **una sola** línea:
  - `TIME_ZONE = 'America/La_Paz'`
  - Eliminar la asignación duplicada a `UTC`.
  - Mantener `USE_TZ = True`.
- Verificar que `tzdata` está instalado (ya está en [requirements.txt](file:///d:/myProjects/mcmatias/backend/requirements.txt#L26)).

## Consistencia de fechas/horas en el código (para evitar “off-by-one day”)
- Reportes:
  - Cambiar defaults basados en “hoy” de `timezone.now().date()` a `timezone.localdate()`.
  - Para imprimir en PDF/Excel, convertir antes de formatear: `timezone.localtime(dt).strftime(...)`.
  - Para nombres de archivos, usar `timezone.localdate()` o `timezone.localtime(timezone.now())` antes de `strftime`.
- Correlativos (boletas/servicios):
  - Reemplazar `datetime.now().year` por `timezone.localdate().year` para que el “año” siga Bolivia (especialmente en cambio de año).

## Agregaciones por día/hora (MySQL)
- Revisar que las métricas que usan `TruncDate/ExtractHour` en [views_reports.py](file:///d:/myProjects/mcmatias/backend/api/views_reports.py#L69-L76) y [views_reports.py](file:///d:/myProjects/mcmatias/backend/api/views_reports.py#L124-L141) reflejen Bolivia.
- Estrategia segura:
  - Mantener almacenamiento en UTC.
  - Intentar aplicar tz en las expresiones (si el backend lo soporta) y, si MySQL no tiene tablas de zona horaria cargadas, documentar o ajustar a conversión en aplicación.

## Verificación (antes y después)
- Ejecutar checks de Django (`manage.py check`) y levantar el servidor localmente.
- Probar manualmente 3 casos:
  - Crear venta y verificar timestamps/boleta.
  - Generar reporte “hoy” alrededor de cambio de día (simulando con datos de distintas horas).
  - Exportar PDF/Excel y confirmar horas/fechas en hora Bolivia.
- (Opcional pero recomendado) Añadir 2–3 tests unitarios:
  - “hoy” en reportes usa `localdate()`.
  - correlativo toma el año desde zona local.

## Despliegue y rollback
- No hay migraciones de esquema.
- Rollback simple: revertir `TIME_ZONE` y los cambios de `localdate/localtime` si se detecta inconsistencia; como la DB sigue en UTC, no se “rompen” datos por aplicar el cambio.
