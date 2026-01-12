"""
Management command to setup initial data and superuser
Usage: python manage.py setup_initial_data
"""
from django.core.management.base import BaseCommand
from api.models import Rol, Sucursal, Usuario


class Command(BaseCommand):
    help = 'Crea datos iniciales (Roles, Sucursales) y opcionalmente un superusuario'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Crear también un superusuario con credenciales por defecto',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando setup de datos iniciales...'))

        # 1. Crear Roles
        roles_created = 0
        roles_data = [
            {"nombre_rol": "Super Administrador", "numero_rol": 1},
            {"nombre_rol": "Administrador", "numero_rol": 2},
            {"nombre_rol": "Técnico", "numero_rol": 3},
            {"nombre_rol": "Cajero", "numero_rol": 4},
            {"nombre_rol": "Técnico y Cajero", "numero_rol": 5},
        ]

        for rol_data in roles_data:
            _, created = Rol.objects.get_or_create(
                numero_rol=rol_data['numero_rol'],
                defaults={'nombre_rol': rol_data['nombre_rol']}
            )
            if created:
                roles_created += 1
                self.stdout.write(f"  ✅ Rol creado: {rol_data['nombre_rol']}")

        if roles_created == 0:
            self.stdout.write(self.style.WARNING('  ⚠️  Roles ya existían'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ {roles_created} roles creados'))

        # 2. Crear Sucursal principal
        sucursal, created = Sucursal.objects.get_or_create(
            nombre="Sucursal Central",
            defaults={
                'direccion': 'Oficina Matriz',
                'activo': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Sucursal Central creada'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  Sucursal Central ya existía'))

        # 3. Crear superusuario si se solicita
        if options['create_superuser']:
            rol_super = Rol.objects.get(numero_rol=1)
            
            if Usuario.objects.filter(correo_electronico='admin@mcmatias.com').exists():
                self.stdout.write(self.style.WARNING('⚠️  Superusuario admin@mcmatias.com ya existe'))
            else:
                Usuario.objects.create_superuser(
                    correo_electronico='admin@mcmatias.com',
                    nombre_apellido='Administrador del Sistema',
                    password='admin123',
                    id_rol=rol_super,
                    id_sucursal=sucursal
                )
                self.stdout.write(self.style.SUCCESS('✅ Superusuario creado:'))
                self.stdout.write('   Email: admin@mcmatias.com')
                self.stdout.write('   Password: admin123')
                self.stdout.write(self.style.WARNING('   ⚠️  CAMBIA LA CONTRASEÑA EN PRODUCCIÓN'))

        self.stdout.write(self.style.SUCCESS('\n✅ Setup completado exitosamente'))
