from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Crea los roles Miembro y Administrador con sus permisos'

    def handle(self, *args, **options):
        permisos_miembro = ['view_tarea', 'add_tarea', 'change_tarea']
        permisos_admin = permisos_miembro + ['delete_tarea']

        grupo_miembro, _ = Group.objects.get_or_create(name='Miembro')
        grupo_admin, _ = Group.objects.get_or_create(name='Administrador')

        grupo_miembro.permissions.set(
            Permission.objects.filter(
                codename__in=permisos_miembro, content_type__app_label='tareas'
            )
        )
        grupo_admin.permissions.set(
            Permission.objects.filter(
                codename__in=permisos_admin, content_type__app_label='tareas'
            )
        )
        self.stdout.write(self.style.SUCCESS('Roles creados o actualizados.'))