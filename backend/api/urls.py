from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RolViewSet, SucursalViewSet, CategoriaViewSet, 
    UsuarioViewSet, ClienteViewSet, ProductoViewSet, InventarioViewSet, 
    VentaViewSet, DetalleVentaViewSet, ServicioTecnicoViewSet
)

router = DefaultRouter()
router.register(r'roles', RolViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'inventario', InventarioViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'detalle_ventas', DetalleVentaViewSet)
router.register(r'servicios_tecnicos', ServicioTecnicoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
