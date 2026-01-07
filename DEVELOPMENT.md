# Guía de Desarrollo Rápido

## Arquitectura Separada (Recomendada)

### 1. Iniciar Servidores

#### Backend (Terminal 1)
```bash
cd D:\myProjects\mcmatias
npm run dev
```
- Servidor corre en `http://localhost:3000`
- API disponible en `http://localhost:3000/api/`
- Base de datos se sincroniza automáticamente

#### Frontend (VS Code)
1. Abre `frontend/login.html` en VS Code
2. Haz clic derecho → "Open with Live Server"
3. Frontend corre en `http://127.0.0.1:5500/frontend/login.html`

### 2. Acceder a la Aplicación

- **Login**: `http://127.0.0.1:5500/frontend/login.html`
- **Dashboard**: `http://127.0.0.1:5500/frontend/dashboard.html`
- **API Testing**: `http://localhost:3000/api/auth/login`

### 3. Credenciales de Desarrollo

```
Email: admin@multicentromatias.com
Password: admin123
```

### 4. Flujo de Trabajo

1. **Desarrollo Frontend**:
   - Modifica archivos HTML/CSS/JS
   - Live Server recarga automáticamente
   - Sin necesidad de reiniciar backend

2. **Desarrollo Backend**:
   - Modifica archivos en `src/`
   - Nodemon recarga automáticamente
   - Solo afecta endpoints API

3. **Testing**:
   - Frontend y backend funcionan independientemente
   - CORS configurado para permitir Live Server
   - Debugging en consolas separadas

### 5. Problemas Comunes

#### "Cannot GET /login.html" desde localhost:3000
- **Solución**: Usa Live Server en puerto 5500, no backend para frontend

#### CORS errors
- **Solución**: Revisa que backend esté corriendo y CORS esté configurado

#### Login no funciona
- **Verifica**: Backend corriendo en puerto 3000
- **Verifica**: Credenciales correctas
- **Verifica**: API URL en `frontend/assets/js/core/api.js`

### 6. Archivos Importantes

- `src/app.js`: Configuración del servidor y CORS
- `frontend/assets/js/core/api.js`: Cliente HTTP y endpoints
- `frontend/assets/js/core/auth.js`: Gestión de autenticación
- `.env`: Variables de entorno y configuración

### 7. Estructura de Proyecto

```
mcmatias/
├── src/                    # Backend (API)
│   ├── controllers/        # Lógica de negocio
│   ├── models/            # Modelos de datos
│   ├── routes/            # Endpoints API
│   └── app.js             # Servidor principal
├── frontend/              # Frontend (HTML/CSS/JS)
│   ├── assets/js/core/    # Módulos JavaScript
│   ├── assets/css/        # Estilos
│   ├── login.html         # Página de login
│   └── dashboard.html     # Dashboard
└── package.json           # Dependencias y scripts
```

### 8. Scripts Útiles

```bash
npm run dev           # Iniciar backend con auto-reload
npm run dev:backend   # Alternativa para iniciar backend
npm run dev:frontend  # Recordatorio de Live Server
npm run seed          # Resetear base de datos (con cuidado)
```

### 9. Depuración

#### Backend
- Consola de Terminal donde corre `npm run dev`
- Logs de peticiones con Morgan
- Errores y debug en consola

#### Frontend
- Chrome DevTools (F12) en la página del navegador
- Network tab para ver peticiones API
- Console para errores JavaScript

#### Testing API
```bash
# Test login con curl
curl -X POST -H "Content-Type: application/json" \
  -d '{"correo_electronico":"admin@multicentromatias.com","contraseña":"admin123"}' \
  http://localhost:3000/api/auth/login
```

### 10. Siguiente Pasos

1. **Modificar frontend**: Edita archivos HTML/CSS/JS, Live Server recarga
2. **Modificar backend**: Edita archivos en `src/`, Nodemon recarga
3. **Testing**: Verifica cambios en ambos servidores
4. **Commit**: Guarda cambios con git cuando funcione todo

---
**Nota**: Esta configuración es óptima para desarrollo. Para producción, revisa `README.md` para despliegue en cPanel.