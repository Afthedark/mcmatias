# 🏪 MCMatias - Sistema de Gestión Integral

Sistema completo de gestión empresarial para control de inventario, ventas, clientes y servicios técnicos. Desarrollado con Django REST Framework (backend) y JavaScript Vanilla (frontend).

---

## 📋 Descripción

**MCMatias** es una solución integral diseñada para empresas que requieren gestionar múltiples sucursales, controlar inventarios, registrar ventas y administrar servicios técnicos. El sistema está construido con una arquitectura moderna y escalable que separa completamente el backend (API REST) del frontend (MPA - Multi-Page Application).

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **JWT (JSON Web Tokens)** para autenticación segura
- Gestión de perfiles de usuario con actualización de datos
- Protección de rutas y endpoints
- Tokens de acceso (60 min) y refresh (1 día)

### 📦 Gestión de Inventario
- Catálogo centralizado de productos
- Control de stock por sucursal
- Categorización de productos y servicios
- Soporte para imágenes de productos

### 💰 Punto de Venta
- Registro de ventas con detalle de productos
- Múltiples métodos de pago (Efectivo, QR)
- Generación de boletas
- Historial de transacciones

### 👥 Gestión de Clientes
- Base de datos de clientes
- Registro de información de contacto
- Historial de compras y servicios

### 🔧 Servicios Técnicos
- Órdenes de reparación y mantenimiento
- Seguimiento de estados (En Reparación, Para Retirar, Entregado)
- Registro fotográfico del problema
- Asignación por sucursal y técnico

### 🏢 Multi-Sucursal
- Gestión de múltiples puntos de venta
- Inventario independiente por sucursal
- Usuarios asignados a sucursales específicas

---

## 🛠 Tecnologías Utilizadas

### Backend
![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Django](https://img.shields.io/badge/Django-6.0-green?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.14+-red)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)

- **Python 3.10+**
- **Django 6.0** - Framework web
- **Django REST Framework** - API REST
- **SimpleJWT** - Autenticación JWT
- **MySQL / MariaDB** - Base de datos
- **Pillow** - Procesamiento de imágenes
- **drf-spectacular** - Documentación Swagger

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)

- **HTML5**
- **CSS3** (Diseño AdminLTE-like)
- **JavaScript ES6+** (Vanilla)
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconografía
- **Axios** - Cliente HTTP

---

## 📂 Estructura del Proyecto

```
mcmatias/
│
├── backend/                    # API REST con Django
│   ├── api/                    # Aplicación principal
│   │   ├── models.py           # Modelos de datos
│   │   ├── views.py            # Endpoints de la API
│   │   ├── serializers.py      # Serializadores
│   │   └── urls.py             # Rutas
│   ├── config/                 # Configuración Django
│   ├── instrucciones/          # Guías de setup y endpoints
│   ├── db_test/                # Scripts de prueba
│   └── requirements.txt        # Dependencias Python
│
└── frontend/                   # Interfaz MPA
    ├── *.html                  # Páginas HTML
    ├── css/                    # Estilos personalizados
    ├── js/
    │   ├── api.js              # Configuración Axios
    │   ├── auth.js             # Autenticación
    │   ├── components.js       # Header y Sidebar
    │   ├── profile.js          # Gestión de perfil
    │   ├── utils.js            # Utilidades
    │   └── pages/              # Lógica por página
    └── assets/                 # Recursos estáticos
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Python 3.10+
- MySQL 8.0+ o MariaDB
- Node.js (opcional, para herramientas de desarrollo)

### Backend

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/mcmatias.git
   cd mcmatias/backend
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar base de datos**
   - Crear archivo `.env` con tus credenciales:
   ```env
   SECRET_KEY=tu_clave_secreta_aqui
   DEBUG=True
   DB_NAME=mcmatias_db
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```

5. **Ejecutar migraciones**
   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario (opcional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Iniciar servidor**
   ```bash
   python manage.py runserver
   ```

### Frontend

1. **Abrir con Live Server**
   - Usa la extensión Live Server de VS Code
   - O sirve los archivos con cualquier servidor HTTP local

2. **Configurar URL del Backend** (si es necesario)
   - Edita `frontend/js/api.js` línea 7:
   ```javascript
   const API_BASE_URL = 'http://127.0.0.1:8000/api';
   ```

3. **Acceder a la aplicación**
   - Abre `http://localhost:5500/index.html` (o el puerto de tu servidor)
   - Inicia sesión con las credenciales creadas

---

## 📚 Documentación

- **[Backend README](backend/readme_backend.md)** - Guía completa del backend
- **[Frontend README](frontend/readme_frontend.md)** - Guía completa del frontend
- **[Endpoints API](backend/instrucciones/endpoints.md)** - Documentación de endpoints con ejemplos
- **[Llenado Manual de Datos](backend/db_test/llenar_datos_manual.md)** - Guía para poblar la BD

### Swagger UI
Una vez iniciado el servidor, accede a la documentación interactiva:
👉 [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)

---

## 🔑 Endpoints Principales

### Autenticación
- `POST /api/token/` - Obtener tokens JWT
- `POST /api/token/refresh/` - Refrescar token

### Perfil de Usuario
- `GET /api/perfil/` - Obtener perfil actual
- `PATCH /api/perfil/` - Actualizar perfil

### Gestión de Datos
- `/api/roles/` - Roles de usuario
- `/api/sucursales/` - Sucursales
- `/api/categorias/` - Categorías
- `/api/usuarios/` - Usuarios
- `/api/clientes/` - Clientes
- `/api/productos/` - Productos
- `/api/inventario/` - Inventario
- `/api/ventas/` - Ventas
- `/api/detalle_ventas/` - Detalle de ventas
- `/api/servicios_tecnicos/` - Servicios técnicos

---

## 🎯 Roadmap

- [x] Sistema de autenticación JWT
- [x] CRUD completo para todos los módulos
- [x] Gestión de perfil de usuario
- [x] Campo de método de pago en ventas
- [x] Paginación ordenada
- [ ] RBAC (Control de acceso basado en roles) en frontend
- [ ] Reportes y estadísticas avanzadas
- [ ] Exportación de datos (PDF, Excel)
- [ ] Dashboard con gráficos en tiempo real
- [ ] Notificaciones push
- [ ] App móvil (React Native / Flutter)

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 👨‍💻 Autor

**MCMatias Team**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: contacto@mcmatias.com

---

## 🙏 Agradecimientos

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Axios](https://axios-http.com/)
- [AdminLTE](https://adminlte.io/) (Inspiración del diseño)

---

<p align="center">⭐ Si este proyecto te fue útil, dale una estrella en GitHub ⭐</p>
