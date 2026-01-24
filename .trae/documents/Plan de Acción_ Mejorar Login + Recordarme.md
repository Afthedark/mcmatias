## Aclaraciones
- **¿Se guardaría en localStorage?** Sí: el plan propone usar `localStorage` para que el correo y contraseña queden guardados aunque cierres el navegador. Alternativa: `sessionStorage` si quieres que se borre al cerrar la pestaña/navegador.
- **¿El backend se modificaría?** No. Es 100% frontend: solo cambios en [index.html](file:///d:/myProjects/mcmatias/frontend/index.html) (y opcionalmente helpers en [auth.js](file:///d:/myProjects/mcmatias/frontend/js/auth.js)).

## Contexto actual
- El submit del login y la UI viven en [index.html](file:///d:/myProjects/mcmatias/frontend/index.html#L31-L130).
- `login(email, password)` autentica contra `/token/`, guarda tokens en `localStorage` y redirige en [auth.js](file:///d:/myProjects/mcmatias/frontend/js/auth.js#L12-L39).

## Objetivo
- Agregar opción “Recordar correo y contraseña” en el login.
- Autocompletar esos campos cuando el usuario vuelva a abrir el login.

## Consideración de seguridad
- Guardar contraseñas en el navegador **no es seguro**. Se implementará como **opt-in** (desactivado por defecto) y con opción “Olvidar credenciales”.

## 1) UI (index.html)
- Añadir un checkbox debajo del campo contraseña:
  - “Recordar correo y contraseña en este equipo”.
- Añadir link/botón opcional:
  - “Olvidar credenciales guardadas”.

## 2) Persistencia (localStorage recomendado)
- Guardar credenciales en `localStorage` con claves separadas de los tokens:
  - `remember_login_enabled` ("true"/"false")
  - `remember_login_email`
  - `remember_login_password`
- Regla:
  - Checkbox ON + login exitoso → guardar.
  - Checkbox OFF → borrar cualquier credencial guardada.
  - Login fallido → no guardar (evita persistir contraseñas equivocadas).

## 3) Precarga al abrir el login
- En `DOMContentLoaded` de [index.html](file:///d:/myProjects/mcmatias/frontend/index.html):
  - Si `remember_login_enabled === "true"` → prellenar `#email` y `#password` y marcar checkbox.

## 4) Integración con el flujo existente
- Mantener `login(email, password)` como está (tokens + redirect) en [auth.js](file:///d:/myProjects/mcmatias/frontend/js/auth.js).
- Ajustar el handler `submit` en [index.html](file:///d:/myProjects/mcmatias/frontend/index.html#L90-L129):
  - Leer estado del checkbox.
  - Guardar/borrar credenciales antes o después de `await login(...)`.

## 5) Validación manual
- Checkbox OFF: login ok → recargar → campos vacíos.
- Checkbox ON: login ok → recargar → campos precargados.
- “Olvidar credenciales”: limpia y deja campos vacíos.

## 6) Alternativa (si prefieres no persistir al cerrar navegador)
- Reemplazar `localStorage` por `sessionStorage` para credenciales, manteniendo tokens como están.

Si aceptas este plan, procedo a implementarlo en frontend sin tocar backend.