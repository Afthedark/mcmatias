from rest_framework import serializers
from .models import (
    Rol, Sucursal, Categoria, Usuario, Cliente, Producto, 
    Inventario, Venta, DetalleVenta, ServicioTecnico
)

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

    class Meta:
        model = Usuario
        fields = '__all__'

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
    class Meta:
        model = Producto
        fields = '__all__'

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = '__all__'

class ServicioTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicioTecnico
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombre_apellido', 'correo_electronico', 'password', 'confirm_password']
        read_only_fields = ['id_usuario']

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

