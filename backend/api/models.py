from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# 1. Tabla de Roles
class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True)
    numero_rol = models.IntegerField(unique=True, null=True, blank=True)

    class Meta:
        db_table = 'roles'
        managed = True

    def __str__(self):
        return self.nombre_rol

# 2. Tabla de Sucursales
class Sucursal(models.Model):
    id_sucursal = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    direccion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'sucursales'
        managed = True

    def __str__(self):
        return self.nombre

# 3. Tabla de Categorías
class Categoria(models.Model):
    TIPO_CHOICES = [
        ('producto', 'Producto'),
        ('servicio', 'Servicio'),
    ]
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'categorias'
        unique_together = (('nombre_categoria', 'tipo'),)
        managed = True

    def __str__(self):
        return f"{self.nombre_categoria} ({self.tipo})"

# Manager para Usuario
class UsuarioManager(BaseUserManager):
    def create_user(self, correo_electronico, nombre_apellido, id_rol, id_sucursal, password=None):
        if not correo_electronico:
            raise ValueError('El usuario debe tener un correo electrónico')
        
        correo_electronico = self.normalize_email(correo_electronico)
        user = self.model(
            correo_electronico=correo_electronico,
            nombre_apellido=nombre_apellido,
            id_rol=id_rol,
            id_sucursal=id_sucursal
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo_electronico, nombre_apellido, password=None, **extra_fields):
        """
        Crea un superusuario. Auto-asigna:
        - Rol: Super Administrador (numero_rol=1)
        - Sucursal: Primera disponible
        
        Esto permite usar `python manage.py createsuperuser` de forma interactiva.
        """
        # Obtener o crear rol Super Administrador
        try:
            from api.models import Rol, Sucursal
            rol_super = Rol.objects.get(numero_rol=1)
        except Rol.DoesNotExist:
            raise ValueError(
                'No existe el rol Super Administrador (numero_rol=1). '
                'Ejecuta primero: python manage.py migrate'
            )
        
        # Obtener primera sucursal disponible
        try:
            sucursal = Sucursal.objects.filter(activo=True).first()
            if not sucursal:
                sucursal = Sucursal.objects.first()
            if not sucursal:
                raise Sucursal.DoesNotExist
        except Sucursal.DoesNotExist:
            raise ValueError(
                'No existe ninguna sucursal. '
                'Ejecuta primero: python manage.py migrate'
            )
        
        # Crear superusuario
        user = self.create_user(
            correo_electronico=correo_electronico,
            nombre_apellido=nombre_apellido,
            id_rol=rol_super,
            id_sucursal=sucursal,
            password=password
        )
        user.is_superuser = True
        user.is_staff = True  # Django requirement for admin
        user.save(using=self._db)
        return user


# 4. Tabla de Usuarios
class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    nombre_apellido = models.CharField(max_length=100)
    correo_electronico = models.EmailField(max_length=100, unique=True)
    # contraseña is handled by AbstractBaseUser as 'password'
    
    # FKs
    # Note: SQL says NOT NULL.
    # We use models.ForeignKey. 
    id_rol = models.ForeignKey(Rol, on_delete=models.RESTRICT, db_column='id_rol') 
    id_sucursal = models.ForeignKey(Sucursal, on_delete=models.RESTRICT, db_column='id_sucursal')
    
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Django Admin requirement
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'correo_electronico'
    REQUIRED_FIELDS = ['nombre_apellido'] # 'id_rol', 'id_sucursal' might be needed but CLI helper makes it hard.

    class Meta:
        db_table = 'usuarios'
        managed = True

    def __str__(self):
        return self.correo_electronico

# 5. Tabla de Clientes
class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nombre_apellido = models.CharField(max_length=100)
    cedula_identidad = models.CharField(max_length=20, blank=True, null=True)
    celular = models.CharField(max_length=20, blank=True, null=True)
    correo_electronico = models.CharField(max_length=100, blank=True, null=True) 
    direccion = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'clientes'
        managed = True

    def __str__(self):
        return self.nombre_apellido

# 6. Tabla de Productos
class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    nombre_producto = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    codigo_barras = models.CharField(max_length=100, unique=True, blank=True, null=True)
    id_categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, db_column='id_categoria')
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    foto_producto = models.ImageField(upload_to='uploads/images/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'productos'
        managed = True

    def __str__(self):
        return self.nombre_producto

# 7. Tabla de Inventario
class Inventario(models.Model):
    id_inventario = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_producto')
    id_sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE, db_column='id_sucursal')
    cantidad = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventario'
        unique_together = (('id_producto', 'id_sucursal'),)
        managed = True

# 8. Tabla de Ventas
class Venta(models.Model):
    METODO_PAGO_CHOICES = [
        ('Efectivo', 'Efectivo'),
        ('QR', 'QR'),
    ]
    ESTADO_CHOICES = [
        ('Completada', 'Completada'),
        ('Anulada', 'Anulada'),
    ]
    id_venta = models.AutoField(primary_key=True)
    numero_boleta = models.CharField(max_length=20, unique=True, blank=True, null=True)
    id_cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, db_column='id_cliente')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.RESTRICT, db_column='id_usuario')
    id_sucursal = models.ForeignKey(Sucursal, on_delete=models.RESTRICT, db_column='id_sucursal')
    fecha_venta = models.DateTimeField(auto_now_add=True)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, default='Efectivo')
    # Campos para anulación
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Completada')
    motivo_anulacion = models.TextField(blank=True, null=True)
    fecha_anulacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'ventas'
        managed = True

    def save(self, *args, **kwargs):
        """Auto-genera numero_boleta con formato VTA-YYYY-XXXXX"""
        if not self.numero_boleta:
            from datetime import datetime
            año_actual = datetime.now().year
            
            ultimo = Venta.objects.filter(
                numero_boleta__startswith=f'VTA-{año_actual}-'
            ).order_by('-numero_boleta').first()
            
            if ultimo:
                try:
                    num = int(ultimo.numero_boleta.split('-')[2])
                except (IndexError, ValueError):
                    num = 0
                self.numero_boleta = f"VTA-{año_actual}-{num + 1:05d}"
            else:
                self.numero_boleta = f"VTA-{año_actual}-00001"
        
        super().save(*args, **kwargs)

# 9. Tabla de Detalle de Ventas
class DetalleVenta(models.Model):
    id_detalle_venta = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey(Venta, on_delete=models.CASCADE, db_column='id_venta')
    id_producto = models.ForeignKey(Producto, on_delete=models.RESTRICT, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_venta'
        managed = True

# 10. Tabla de Servicios Técnicos
class ServicioTecnico(models.Model):
    ESTADO_CHOICES = [
        ('En Reparación', 'En Reparación'),
        ('Para Retirar', 'Para Retirar'),
        ('Entregado', 'Entregado'),
        ('Anulado', 'Anulado'),
    ]
    id_servicio = models.AutoField(primary_key=True)
    numero_servicio = models.CharField(max_length=20, unique=True, blank=True, null=True)
    id_cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT, db_column='id_cliente')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.RESTRICT, db_column='id_usuario')
    # Información del dispositivo
    marca_dispositivo = models.CharField(max_length=100, blank=True, null=True)
    modelo_dispositivo = models.CharField(max_length=100, blank=True, null=True)
    # Descripción y categoría del servicio
    descripcion_problema = models.TextField(blank=True, null=True)
    id_categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, db_column='id_categoria')
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    # Fechas y estado
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='En Reparación')
    # Relaciones
    id_sucursal = models.ForeignKey(Sucursal, on_delete=models.RESTRICT, db_column='id_sucursal')
    # Fotos del problema
    foto_1 = models.ImageField(upload_to='uploads/images/', blank=True, null=True)
    foto_2 = models.ImageField(upload_to='uploads/images/', blank=True, null=True)
    foto_3 = models.ImageField(upload_to='uploads/images/', blank=True, null=True)
    # Técnico asignado
    id_tecnico_asignado = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        db_column='id_tecnico_asignado',
        related_name='servicios_asignados'
    )
    # Fecha de entrega (auto-capturada al cambiar estado a 'Entregado')
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'servicios_tecnicos'
        managed = True

    def save(self, *args, **kwargs):
        """Auto-genera numero_servicio con formato ST-YYYY-XXXXX"""
        if not self.numero_servicio:
            from datetime import datetime
            año_actual = datetime.now().year
            
            # Buscar último servicio del año actual
            ultimo = ServicioTecnico.objects.filter(
                numero_servicio__startswith=f'ST-{año_actual}-'
            ).order_by('-numero_servicio').first()
            
            if ultimo:
                try:
                    num = int(ultimo.numero_servicio.split('-')[2])
                except (IndexError, ValueError):
                    num = 0
                self.numero_servicio = f"ST-{año_actual}-{num + 1:05d}"
            else:
                # Primer servicio del año
                self.numero_servicio = f"ST-{año_actual}-00001"
        
        super().save(*args, **kwargs)
