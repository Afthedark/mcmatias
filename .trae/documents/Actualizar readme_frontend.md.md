## Objetivo
Actualizar [readme_frontend.md](file:///d:/myProjects/mcmatias/frontend/readme_frontend.md) para reflejar los últimos cambios de despliegue y conexión con el backend (Netlify proxy, URLs duales, solución de imágenes y ajuste del flujo de login).

## Cambios Propuestos

## 1) Sección de Conexión con Backend (Local / Netlify)
- Actualizar la sección “Cambiar URL del Backend” para que refleje la configuración real actual en [api.js](file:///d:/myProjects/mcmatias/frontend/js/api.js):
  - **Local**: `http://127.0.0.1:8000/api`
  - **Producción Netlify**: `'/api'` (proxy)
  - **VPS directo**: `http://167.86.66.229:8000/api` (solo si el frontend NO está en HTTPS)
- Explicar brevemente el error **Mixed Content** y por qué en Netlify debe usarse el proxy.

## 2) Nueva Sección: Despliegue en Netlify (Proxy)
- Documentar el archivo [_redirects](file:///d:/myProjects/mcmatias/frontend/_redirects) y sus reglas:
  - `/api/*  http://167.86.66.229:8000/api/:splat  200!`
  - `/media/*  http://167.86.66.229/media/:splat  200!`
- Aclaración importante:
  - `/api` va al **puerto 8000** (Gunicorn / API)
  - `/media` va al **puerto 80** (Nginx) para servir archivos media (imágenes) de forma correcta

## 3) Sección de Imágenes (Media)
- Explicar que el backend suele devolver URLs absolutas de imágenes y el frontend las adapta.
- Documentar el comportamiento actualizado de [utils.js](file:///d:/myProjects/mcmatias/frontend/js/utils.js):
  - `getImageUrl()` detecta si `API_BASE_URL` es local (http) o Netlify (`/api`) y convierte URLs absolutas a rutas relativas `/media/...` para pasar por el proxy.

## 4) Sección de Autenticación / RBAC (Estabilidad Login)
- Añadir nota breve de los últimos ajustes para evitar “No Autorizado” en el primer login:
  - Pre-carga de perfil en [auth.js](file:///d:/myProjects/mcmatias/frontend/js/auth.js)
  - Redirección 403 menos agresiva en [api.js](file:///d:/myProjects/mcmatias/frontend/js/api.js)
  - Validación tolerante cuando `user_numero_rol` todavía no está en `localStorage` en [roles_vistas.js](file:///d:/myProjects/mcmatias/frontend/js/roles_vistas.js)

## 5) Limpieza de Formato
- Corregir encabezados que aparecen con caracteres “�” para que el README se vea limpio.

## Resultado Esperado
El README del frontend quedará alineado con el estado real del proyecto y documentará correctamente el flujo Local/Netlify, el proxy para API + imágenes y la estabilidad del login.