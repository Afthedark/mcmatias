from rest_framework import viewsets, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import filters
from rest_framework.decorators import action
from django.utils import timezone
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
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_producto', 'codigo_barras', 'descripcion']

class InventarioViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada sucursal solo ve su propio inventario
    Super Admin (1) ve todo el inventario
    """
    queryset = Inventario.objects.all()  # Base queryset for DRF router
    serializer_class = InventarioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['id_producto__nombre_producto', 'id_producto__codigo_barras']
    
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
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_boleta', 'id_cliente__nombre_apellido', 'id_cliente__cedula_identidad']
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return Venta.objects.all().order_by('-pk')
        # Otros solo ven ventas de su sucursal
        return Venta.objects.filter(id_sucursal=user.id_sucursal).order_by('-pk')
    
    def perform_create(self, serializer):
        """Auto-asignar sucursal y usuario del request"""
        user = self.request.user
        if user.id_rol.numero_rol == 1:
            # Super Admin puede especificar sucursal, pero siempre se asigna el usuario
            serializer.save(id_usuario=user)
        else:
            # Otros: forzar su sucursal y usuario
            serializer.save(id_sucursal=user.id_sucursal, id_usuario=user)
    
    @action(detail=True, methods=['patch'])
    def anular(self, request, pk=None):
        """
        Anula una venta y restaura el inventario.
        PATCH /api/ventas/{id}/anular/
        Body: { "motivo_anulacion": "razón..." }
        """
        venta = self.get_object()
        
        # Validar que no esté ya anulada
        if venta.estado == 'Anulada':
            return Response(
                {'error': 'Esta venta ya fue anulada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener motivo
        motivo = request.data.get('motivo_anulacion', '')
        if not motivo:
            return Response(
                {'error': 'Debe proporcionar un motivo de anulación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Restaurar inventario
        detalles = DetalleVenta.objects.filter(id_venta=venta)
        for detalle in detalles:
            inventario = Inventario.objects.filter(
                id_producto=detalle.id_producto,
                id_sucursal=venta.id_sucursal
            ).first()
            if inventario:
                inventario.cantidad += detalle.cantidad
                inventario.save()
        
        # Anular venta
        venta.estado = 'Anulada'
        venta.motivo_anulacion = motivo
        venta.fecha_anulacion = timezone.now()
        venta.save()
        
        return Response(VentaSerializer(venta).data)

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all().order_by('pk')
    serializer_class = DetalleVentaSerializer
    
    def get_queryset(self):
        """Permite filtrar por id_venta: /api/detalle_ventas/?id_venta=1"""
        queryset = super().get_queryset()
        id_venta = self.request.query_params.get('id_venta', None)
        if id_venta:
            queryset = queryset.filter(id_venta=id_venta)
        return queryset
    
    def perform_create(self, serializer):
        """
        Al crear un detalle de venta:
        1. Obtiene la sucursal de la venta
        2. Valida que exista stock suficiente en esa sucursal
        3. Descuenta del inventario automáticamente
        """
        # Obtener datos del request
        id_venta = serializer.validated_data.get('id_venta')
        id_producto = serializer.validated_data.get('id_producto')
        cantidad = serializer.validated_data.get('cantidad')
        
        # Obtener la sucursal de la venta
        sucursal = id_venta.id_sucursal
        
        # Buscar inventario de este producto en esta sucursal
        inventario = Inventario.objects.filter(
            id_producto=id_producto,
            id_sucursal=sucursal
        ).first()
        
        # Validar existencia de inventario
        if not inventario:
            raise serializers.ValidationError({
                'id_producto': f'El producto "{id_producto.nombre_producto}" no existe en el inventario de la sucursal "{sucursal.nombre}".'
            })
        
        # Validar stock suficiente
        if inventario.cantidad < cantidad:
            raise serializers.ValidationError({
                'cantidad': f'Stock insuficiente para "{id_producto.nombre_producto}". Disponible: {inventario.cantidad}, Solicitado: {cantidad}'
            })
        
        # Guardar el detalle
        serializer.save()
        
        # Descontar del inventario
        inventario.cantidad -= cantidad
        inventario.save()

class ServicioTecnicoViewSet(viewsets.ModelViewSet):
    """
    🔒 AISLADO: Cada sucursal solo ve sus propios servicios técnicos
    Super Admin (1) ve todos los servicios
    """
    queryset = ServicioTecnico.objects.all()  # Base queryset for DRF router
    serializer_class = ServicioTecnicoSerializer
    # Búsqueda server-side
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_servicio', 'id_cliente__nombre_apellido', 'marca_dispositivo', 
                     'modelo_dispositivo', 'descripcion_problema']
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return ServicioTecnico.objects.all().order_by('-pk')
        # Otros solo ven servicios de su sucursal
        return ServicioTecnico.objects.filter(id_sucursal=user.id_sucursal).order_by('-pk')
    
    def perform_create(self, serializer):
        """Auto-asignar sucursal y usuario del request"""
        user = self.request.user
        if user.id_rol.numero_rol == 1:
            # Super Admin puede especificar sucursal, pero siempre se asigna el usuario
            serializer.save(id_usuario=user)
        else:
            # Otros: forzar su sucursal y usuario
            serializer.save(id_sucursal=user.id_sucursal, id_usuario=user)

    @action(detail=True, methods=['patch'])
    def anular(self, request, pk=None):
        """
        Anula un servicio técnico.
        PATCH /api/servicios_tecnicos/{id}/anular/
        Body: { "motivo_anulacion": "razón..." }
        Solo roles 1 (Super Admin) y 2 (Administrador) pueden anular.
        """
        user = request.user
        
        # RBAC: Solo roles 1 y 2 pueden anular
        if user.id_rol.numero_rol not in [1, 2]:
            return Response(
                {'error': 'No tiene permisos para anular servicios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        servicio = self.get_object()
        
        # Verificar que no esté ya anulado
        if servicio.estado == 'Anulado':
            return Response(
                {'error': 'Este servicio ya está anulado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Anular el servicio
        servicio.estado = 'Anulado'
        servicio.save()
        
        return Response({
            'message': 'Servicio anulado correctamente',
            'numero_servicio': servicio.numero_servicio
        })

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
