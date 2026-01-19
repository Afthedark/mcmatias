from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RolViewSet, SucursalViewSet, CategoriaViewSet, 
    UsuarioViewSet, ClienteViewSet, ProductoViewSet, InventarioViewSet, 
    VentaViewSet, DetalleVentaViewSet, ServicioTecnicoViewSet, UserProfileView
)
from .serializers import CustomTokenObtainPairSerializer

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


# Custom Token View that blocks inactive users
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('perfil/', UserProfileView.as_view(), name='user_profile'),
]
