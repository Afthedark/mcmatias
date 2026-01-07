# 🐍 Base de Datos Django REST - Estructura Limpia

## 📄 Archivo Creado
✅ **`database_django.sql`** - Script SQL optimizado para Django REST

## 🎯 ¿Qué contiene?

### **10 Tablas Estructuradas**
- **`roles`** - Roles de usuario (cajero, técnico, administrador)
- **`sucursales`** - Sucursales del negocio
- **`categorías`** - Categorías para productos/servicios
- **`usuarios`** - Usuarios con contraseña hasheada
- **`clientes`** - Clientes del negocio
- **`productos`** - Productos con precios y categorías
- **`inventario`** - Control de stock por sucursal
- **`ventas`** - Ventas generales
- **`detalle_venta`** - Detalles de cada venta
- **`servicios_tecnicos`** - Servicios técnicos con fotos

### **Características Django-Friendly**
- ✅ **Primary keys** con auto_increment (compatible con Django)
- ✅ **Claves foráneas** configuradas con CASCADE/RESTRICT
- ✅ **Índices optimizados** para consultas REST eficientes
- ✅ **ENUM fields** para choices de Django
- ✅ **Timestamps** automáticos con created_at/updated_at
- ✅ **UTF-8** charset para soporte de caracteres especiales
- ✅ **Sin datos** - estructura limpia para Django models

### **Para Django REST Framework**
- ✅ **Relaciones definidas** para ForeignKey Django
- ✅ **Índices únicos** para validaciones Django
- ✅ **Tipos de datos** compatibles con Django ORM
- ✅ **Constraints** para integridad referencial

## 🚀 Importación Rápida

```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE tienda_multicentro_matias;"

# Importar estructura limpia
mysql -u root -p tienda_multicentro_matias < database_django.sql
```

## 🐍 Ejemplo de Model Django

```python
# models.py
from django.db import models

class Role(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'roles'

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre_apellido = models.CharField(max_length=100)
    correo_electronico = models.CharField(max_length=100, unique=True)
    contraseña = models.CharField(max_length=255)
    rol = models.ForeignKey(Role, on_delete=models.RESTRICT, db_column='id_rol')
    sucursal = models.ForeignKey('Sucursal', on_delete=models.RESTRICT, db_column='id_sucursal')
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'usuarios'
    
    def __str__(self):
        return self.nombre_apellido
```

## 🔥 Ventajas para tu Backend Personalizado

### **1. Control Total**
- Estructura conocida sin migraciones Django complejas
- Puedes optimizar índices manualmente
- Debugging SQL directo si necesitas

### **2. Rendimiento Superior**
- Índices ya configurados para consultas frecuentes
- Sin overhead de Django ORM si prefieres SQL puro
- Base de datos optimizada para REST endpoints

### **3. Flexibilidad Máxima**
- Endpoints personalizados con SQL o Django ORM
- Puedes usar ambos approaches según necesidad
- Estructura compatible con cualquier framework Python

## 🎯 Flujo de Desarrollo

### **Backend Django + Axios Frontend**
```python
# views.py (Django REST)
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json

@require_http_methods(["POST"])
def login_view(request):
    data = json.loads(request.body)
    email = data.get('correo_electronico')
    password = data.get('contraseña')
    
    # Lógica de autenticación personalizada
    # Usar SQL directo o Django ORM según prefieras
    return JsonResponse({
        'token': 'jwt_token_here',
        'usuario': {
            'id_usuario': 1,
            'nombre_apellido': 'Admin User',
            'rol': 'administrador',
            'sucursal': 'Casa Matriz'
        }
    })
```

```javascript
// Frontend (axios)
const response = await api.post('/login/', {
    correo_electronico: email,
    contraseña: password
});

const { token, usuario } = response.data;
Storage.set('token', token);
Storage.set('user', usuario);
```

## 📚 Consultas Útiles

```sql
-- Verificar estructura
SHOW TABLES;

-- Ver índices de una tabla
SHOW INDEX FROM usuarios;

-- Ver relaciones
SELECT 
    TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'tienda_multicentro_matias' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

**🎉 ¡Listo para Django REST!** Base de datos limpia, estructurada y optimizada para tu backend personalizado con endpoints REST y frontend con axios.