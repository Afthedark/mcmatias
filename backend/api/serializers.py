from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Rol, Sucursal, Categoria, Usuario, Cliente, Producto, 
    Inventario, Venta, DetalleVenta, ServicioTecnico
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that validates user is active before issuing token.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Verificar que el usuario esté activo
        if not self.user.activo:
            raise serializers.ValidationError(
                {'detail': 'Esta cuenta ha sido desactivada. Contacte al administrador.'}
            )
        
        return data

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    numero_rol = serializers.IntegerField(source='id_rol.numero_rol', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombre_apellido', 'correo_electronico', 'password',
                  'id_rol', 'numero_rol', 'id_sucursal', 'activo', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(source='id_categoria.nombre_categoria', read_only=True)
    activo = serializers.BooleanField(default=True, required=False)
    
    # FIX: Convertir cadenas vacías a None para evitar error de unicidad en DB
    def validate_codigo_barras(self, value):
        return value if value else None

    class Meta:
        model = Producto
        fields = ['id_producto', 'nombre_producto', 'descripcion', 'codigo_barras', 
                  'id_categoria', 'nombre_categoria', 'precio', 'foto_producto', 'activo']

class InventarioSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source='id_producto.nombre_producto', read_only=True)
    nombre_sucursal = serializers.CharField(source='id_sucursal.nombre', read_only=True)

    class Meta:
        model = Inventario
        fields = ['id_inventario', 'id_producto', 'nombre_producto', 'id_sucursal', 'nombre_sucursal', 'cantidad']

class VentaSerializer(serializers.ModelSerializer):
    nombre_cliente = serializers.CharField(source='id_cliente.nombre_apellido', read_only=True)
    nombre_usuario = serializers.CharField(source='id_usuario.nombre_apellido', read_only=True)
    nombre_sucursal = serializers.CharField(source='id_sucursal.nombre', read_only=True)
    direccion_sucursal = serializers.CharField(source='id_sucursal.direccion', read_only=True)
    cel1_sucursal = serializers.CharField(source='id_sucursal.numero_cel1', read_only=True)
    cel2_sucursal = serializers.CharField(source='id_sucursal.numero_cel2', read_only=True)
    
    class Meta:
        model = Venta
        fields = ['id_venta', 'numero_boleta', 'id_cliente', 'nombre_cliente',
                  'id_usuario', 'nombre_usuario', 'id_sucursal', 'nombre_sucursal', 
                  'direccion_sucursal', 'cel1_sucursal', 'cel2_sucursal',
                  'fecha_venta', 'total_venta', 'tipo_pago',
                  'estado', 'motivo_anulacion', 'fecha_anulacion']
        read_only_fields = ['numero_boleta', 'id_usuario', 'id_sucursal',
                           'estado', 'motivo_anulacion', 'fecha_anulacion']

class DetalleVentaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source='id_producto.nombre_producto', read_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = ['id_detalle_venta', 'id_venta', 'id_producto', 'nombre_producto', 
                  'cantidad', 'precio_venta']

class ServicioTecnicoSerializer(serializers.ModelSerializer):
    # Campos enriquecidos (read-only)
    nombre_cliente = serializers.CharField(source='id_cliente.nombre_apellido', read_only=True)
    celular_cliente = serializers.CharField(source='id_cliente.celular', read_only=True)
    nombre_usuario = serializers.CharField(source='id_usuario.nombre_apellido', read_only=True)
    nombre_sucursal = serializers.CharField(source='id_sucursal.nombre', read_only=True)
    direccion_sucursal = serializers.CharField(source='id_sucursal.direccion', read_only=True)
    cel1_sucursal = serializers.CharField(source='id_sucursal.numero_cel1', read_only=True)
    cel2_sucursal = serializers.CharField(source='id_sucursal.numero_cel2', read_only=True)
    nombre_categoria = serializers.CharField(source='id_categoria.nombre_categoria', read_only=True)
    nombre_tecnico_asignado = serializers.CharField(source='id_tecnico_asignado.nombre_apellido', read_only=True)
    
    class Meta:
        model = ServicioTecnico
        fields = [
            'id_servicio', 'numero_servicio', 
            'id_cliente', 'nombre_cliente', 'celular_cliente',
            'id_usuario', 'nombre_usuario',
            'id_sucursal', 'nombre_sucursal', 'direccion_sucursal', 'cel1_sucursal', 'cel2_sucursal',
            'id_categoria', 'nombre_categoria',
            'marca_dispositivo', 'modelo_dispositivo',
            'descripcion_problema', 'costo_estimado',
            'estado', 'fecha_inicio', 'fecha_entrega',
            'id_tecnico_asignado', 'nombre_tecnico_asignado',
            'foto_1', 'foto_2', 'foto_3',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['numero_servicio', 'id_usuario', 'id_sucursal', 'fecha_entrega', 'created_at', 'updated_at']

class UserProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Campos extra de información (solo lectura)
    nombre_rol = serializers.CharField(source='id_rol.nombre_rol', read_only=True)
    numero_rol = serializers.IntegerField(source='id_rol.numero_rol', read_only=True)
    nombre_sucursal = serializers.CharField(source='id_sucursal.nombre', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id_usuario', 'nombre_apellido', 'correo_electronico', 'password', 'confirm_password',
            'id_rol', 'nombre_rol', 'numero_rol', 
            'id_sucursal', 'nombre_sucursal'
        ]
        read_only_fields = ['id_usuario', 'nombre_rol', 'numero_rol', 'nombre_sucursal', 'id_rol', 'id_sucursal']

    def validate(self, data):
        password = data.get('password', '').strip()
        confirm_password = data.get('confirm_password', '').strip()
        
        # Si se proporcionó contraseña, validar que coincidan
        if password or confirm_password:
            if password != confirm_password:
                raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
            if len(password) < 4:
                raise serializers.ValidationError({"password": "La contraseña debe tener al menos 4 caracteres."})
        
        return data

    def update(self, instance, validated_data):
        # Remover confirm_password ya que no es campo del modelo
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)

        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Si se proporcionó contraseña, hashearla
        if password and password.strip():
            instance.set_password(password)

        instance.save()
        return instance

