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
    """
    🔒 AISLADO: Cada usuario solo ve su sucursal asignada
    Super Admin (1) ve todas las sucursales
    """
    queryset = Sucursal.objects.all().order_by('pk')
    serializer_class = SucursalSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Super Admin ve todo
        if user.id_rol.numero_rol == 1:
            return Sucursal.objects.all().order_by('pk')
        # Otros solo ven su sucursal
        return Sucursal.objects.filter(pk=user.id_sucursal.pk).order_by('pk')

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
        Filtra categorías activas por defecto.
        - ?tipo=producto o ?tipo=servicio: filtra por tipo
        - ?incluir_inactivas=true: incluye categorías inactivas
        """
        queryset = super().get_queryset()
        
        # Filtrar solo activas por defecto
        incluir_inactivas = self.request.query_params.get('incluir_inactivas', 'false').lower() == 'true'
        if not incluir_inactivas:
            queryset = queryset.filter(activo=True)
        
        # Filtrar por tipo (producto/servicio)
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: marca la categoría como inactiva sin validaciones.
        """
        categoria = self.get_object()
        
        # Soft delete directo
        categoria.activo = False
        categoria.save()
        
        return Response({'mensaje': 'Categoría desactivada correctamente'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def reactivar(self, request, pk=None):
        """
        Reactivar una categoría inactiva
        """
        categoria = self.get_object()
        
        if categoria.activo:
            return Response(
                {'error': 'La categoría ya está activa'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        categoria.activo = True
        categoria.save()
        
        return Response({'mensaje': 'Categoría reactivada correctamente'}, status=status.HTTP_200_OK)

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
    Implementa soft delete (borrado lógico)
    """
    queryset = Cliente.objects.all().order_by('pk')
    serializer_class = ClienteSerializer
    # Búsqueda por nombre, CI, celular y email
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_apellido', 'cedula_identidad', 'celular', 'correo_electronico']
    
    def get_queryset(self):
        """
        Por defecto, solo muestra clientes activos.
        Usa ?incluir_inactivos=true para ver todos.
        """
        queryset = Cliente.objects.all().order_by('pk')
        
        # Filtrar solo activos por defecto
        incluir_inactivos = self.request.query_params.get('incluir_inactivos', 'false')
        if incluir_inactivos.lower() != 'true':
            queryset = queryset.filter(activo=True)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Sobrescribe DELETE para hacer soft delete (marcar como inactivo).
        """
        cliente = self.get_object()
        cliente.activo = False
        cliente.save()
        
        return Response(
            {'message': f'Cliente "{cliente.nombre_apellido}" marcado como inactivo'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['patch'])
    def reactivar(self, request, pk=None):
        """
        Endpoint custom para reactivar un cliente inactivo.
        PATCH /api/clientes/{id}/reactivar/
        """
        cliente = self.get_object()
        
        if cliente.activo:
            return Response(
                {'message': 'El cliente ya está activo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cliente.activo = True
        cliente.save()
        
        return Response(
            {'message': f'Cliente "{cliente.nombre_apellido}" reactivado correctamente'},
            status=status.HTTP_200_OK
        )

class ProductoViewSet(viewsets.ModelViewSet):
    """
    🌍 GLOBAL: El catálogo de productos es compartido
    """
    queryset = Producto.objects.all().order_by('pk')
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_producto', 'codigo_barras', 'descripcion']
    
    def get_queryset(self):
        """
        Filtra productos activos por defecto.
        - ?incluir_inactivos=true: incluye productos inactivos
        """
        queryset = super().get_queryset()
        
        incluir_inactivos = self.request.query_params.get('incluir_inactivos', 'false').lower() == 'true'
        if not incluir_inactivos:
            queryset = queryset.filter(activo=True)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete con validación de inventario.
        Solo permite eliminar si el stock es 0 en TODAS las sucursales.
        Al eliminar: borra inventario físicamente + soft delete producto.
        """
        producto = self.get_object()
        
        # Verificar stock en todas las sucursales
        inventarios = Inventario.objects.filter(id_producto=producto)
        
        stock_total = sum([inv.cantidad for inv in inventarios])
        
        if stock_total > 0:
            # Construir detalles por sucursal
            detalles_por_sucursal = []
            for inv in inventarios:
                if inv.cantidad > 0:
                    detalles_por_sucursal.append({
                        'sucursal': inv.id_sucursal.nombre,
                        'stock': inv.cantidad
                    })
            
            return Response({
                'error': f'No se puede eliminar el producto "{producto.nombre_producto}"',
                'razon': 'El producto aún tiene stock en inventario',
                'stock_total': stock_total,
                'detalle_sucursales': detalles_por_sucursal,
                'sugerencia': 'Reduce el stock a 0 en todas las sucursales antes de eliminar'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Eliminar registros de inventario físicamente (stock ya es 0)
        inventarios.delete()
        
        # Soft delete del producto
        producto.activo = False
        producto.save()
        
        return Response({
            'mensaje': 'Producto eliminado correctamente'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def reactivar(self, request, pk=None):
        """
        Reactivar un producto inactivo.
        PATCH /api/productos/{id}/reactivar/
        """
        producto = self.get_object()
        
        if producto.activo:
            return Response(
                {'error': 'El producto ya está activo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        producto.activo = True
        producto.save()
        
        return Response({
            'mensaje': 'Producto reactivado correctamente'
        }, status=status.HTTP_200_OK)

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
        Roles permitidos: 1 (Super Admin), 2 (Admin), 3 (Técnico), 5 (Técnico y Cajero)
        """
        user = request.user
        
        # RBAC: Roles permitidos: 1 (Super Admin), 2 (Admin), 3 (Técnico), 5 (Técnico y Cajero)
        # Rol 4 (Cajero) NO puede anular
        if user.id_rol.numero_rol not in [1, 2, 3, 5]:
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
