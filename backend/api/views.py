from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import (
    Rol, Sucursal, Categoria, Usuario, Cliente, Producto, 
    Inventario, Venta, DetalleVenta, ServicioTecnico
)
from .serializers import (
    RolSerializer, SucursalSerializer, CategoriaSerializer, 
    UsuarioSerializer, ClienteSerializer, ProductoSerializer, 
    InventarioSerializer, VentaSerializer, DetalleVentaSerializer, 
    ServicioTecnicoSerializer, UserProfileSerializer
)

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all().order_by('pk')
    serializer_class = RolSerializer

class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all().order_by('pk')
    serializer_class = SucursalSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('pk')
    serializer_class = CategoriaSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('pk')
    serializer_class = UsuarioSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by('pk')
    serializer_class = ClienteSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('pk')
    serializer_class = ProductoSerializer

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all().order_by('pk')
    serializer_class = InventarioSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by('pk')
    serializer_class = VentaSerializer

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all().order_by('pk')
    serializer_class = DetalleVentaSerializer

class ServicioTecnicoViewSet(viewsets.ModelViewSet):
    queryset = ServicioTecnico.objects.all().order_by('pk')
    serializer_class = ServicioTecnicoSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener perfil del usuario autenticado"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Actualizar perfil del usuario autenticado"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
