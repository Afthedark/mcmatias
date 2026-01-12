from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import filters
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
    """
    🌍 GLOBAL: Todas las sucursales comparten las mismas categorías
    """
    queryset = Categoria.objects.all().order_by('pk')
    serializer_class = CategoriaSerializer
    # Búsqueda por nombre y tipo
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_categoria', 'tipo']
    
    def get_queryset(self):
        """
        Opcionalmente filtra por tipo usando el parámetro ?tipo=producto o ?tipo=servicio
        """
        queryset = super().get_queryset()
        tipo = self.request.query_params.get('tipo', None)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada usuario solo ve compañeros de su sucursal
    Super Admin (1) ve todos los usuarios
    """
    queryset = Usuario.objects.all()  # Base queryset for DRF router
    serializer_class = UsuarioSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return Usuario.objects.all().order_by('pk')
        # Otros solo ven usuarios de su sucursal
        return Usuario.objects.filter(id_sucursal=user.id_sucursal).order_by('pk')

class ClienteViewSet(viewsets.ModelViewSet):
    """
    🌍 GLOBAL: Todos los clientes son compartidos entre sucursales
    """
    queryset = Cliente.objects.all().order_by('pk')
    serializer_class = ClienteSerializer
    # Búsqueda por nombre, CI, celular y email
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_apellido', 'cedula_identidad', 'celular', 'correo_electronico']

class ProductoViewSet(viewsets.ModelViewSet):
    """
    🌍 GLOBAL: El catálogo de productos es compartido
    """
    queryset = Producto.objects.all().order_by('pk')
    serializer_class = ProductoSerializer

class InventarioViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada sucursal solo ve su propio inventario
    Super Admin (1) ve todo el inventario
    """
    queryset = Inventario.objects.all()  # Base queryset for DRF router
    serializer_class = InventarioSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return Inventario.objects.all().order_by('pk')
        # Otros solo ven inventario de su sucursal
        return Inventario.objects.filter(id_sucursal=user.id_sucursal).order_by('pk')
    
    def perform_create(self, serializer):
        """Auto-asignar sucursal si no es Super Admin"""
        user = self.request.user
        if user.id_rol.numero_rol == 1:
            # Super Admin puede especificar sucursal o usar la suya
            serializer.save()
        else:
            # Otros: forzar su sucursal
            serializer.save(id_sucursal=user.id_sucursal)

class VentaViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada sucursal solo ve sus propias ventas
    Super Admin (1) ve todas las ventas
    """
    queryset = Venta.objects.all()  # Base queryset for DRF router
    serializer_class = VentaSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return Venta.objects.all().order_by('pk')
        # Otros solo ven ventas de su sucursal
        return Venta.objects.filter(id_sucursal=user.id_sucursal).order_by('pk')
    
    def perform_create(self, serializer):
        """Auto-asignar sucursal del usuario"""
        user = self.request.user
        if user.id_rol.numero_rol == 1:
            # Super Admin puede especificar o usar su sucursal
            serializer.save()
        else:
            # Otros: forzar su sucursal
            serializer.save(id_sucursal=user.id_sucursal)

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all().order_by('pk')
    serializer_class = DetalleVentaSerializer

class ServicioTecnicoViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada sucursal solo ve sus propios servicios técnicos
    Super Admin (1) ve todos los servicios
    """
    queryset = ServicioTecnico.objects.all()  # Base queryset for DRF router
    serializer_class = ServicioTecnicoSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return ServicioTecnico.objects.all().order_by('pk')
        # Otros solo ven servicios de su sucursal
        return ServicioTecnico.objects.filter(id_sucursal=user.id_sucursal).order_by('pk')
    
    def perform_create(self, serializer):
        """Auto-asignar sucursal del usuario"""
        user = self.request.user
        if user.id_rol.numero_rol == 1:
            # Super Admin puede especificar sucursal
            serializer.save()
        else:
            # Otros: forzar su sucursal
            serializer.save(id_sucursal=user.id_sucursal)

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
