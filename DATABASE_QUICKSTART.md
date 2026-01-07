# 🎯 Guía Rápida: Base de Datos para Django REST

## 📂 Archivos Creados
✅ `database_django.sql` - Script SQL limpio para Django  
✅ `DATABASE_README.md` - Documentación general

## 🚀 Uso para Django REST

### 1. Crea la Base de Datos
```sql
CREATE DATABASE tienda_multicentro_matias;
USE tienda_multicentro_matias;
```

### 2. Importa la Estructura Limpia
```bash
mysql -u root -p tienda_multicentro_matias < database_django.sql
```

### 3. ¡Listo para Django! Ya tienes:
- ✅ **10 tablas** estructuradas
- ✅ **Relaciones foráneas** configuradas
- ✅ **Índices optimizados** para rendimiento
- ✅ **UTF-8** soporte completo
- ✅ **Limpio** - sin datos, sin triggers, sin vistas

## 🎪 ¿Qué contiene?
- **10 Tablas** principales (roles, usuarios, productos, etc.)
- **Relaciones completas** con claves foráneas
- **Índices optimizados** para consultas Django REST
- **Validaciones** ENUM y NOT NULL
- **Auto-incrementos** en primary keys

## 🐍 Configuración Django

### settings.py:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'tienda_multicentro_matias',
        'USER': 'root',
        'PASSWORD': 'tu_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### models.py (ejemplo):
```python
class Role(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'roles'
```

## 🔥 Ventajas para Django REST
- ✅ **Sin migraciones complejas** - estructura lista
- ✅ **Control total** de la base de datos
- ✅ **Endpoints personalizados** fáciles de crear
- ✅ **Rendimiento superior** con índices optimizados
- ✅ **Debugging fácil** - puedes usar SQL directamente
- ✅ **Independencia total** de Django ORM

## 🎯 Para Empezar con Django REST

1. **Importa** la base de datos con `database_django.sql`
2. **Crea** tus modelos Django basados en las tablas
3. **Desarrolla** endpoints REST personalizados
4. **Usa** los índices existentes para consultas eficientes

---

**🚀 ¡Perfecto para Django REST!** Base de datos limpia y estructurada, lista para tus endpoints personalizados con axios desde el frontend.