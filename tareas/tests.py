from django.contrib.auth.models import Group, User
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from .models import Tarea

CLAVE = 'ClaveSegura#2026'
DATOS_TAREA = {
    'titulo': 'Preparar informe',
    'descripcion': 'Reunir la informacion del proyecto',
    'responsable': 'Ana',
    'estado': 'pendiente',
}


class RolesBase(TestCase):
    """Crea los grupos y dos usuarios (Miembro y Administrador)."""

    @classmethod
    def setUpTestData(cls):
        call_command('crear_roles', verbosity=0)
        cls.miembro = User.objects.create_user('miembro', password=CLAVE)
        cls.miembro.groups.add(Group.objects.get(name='Miembro'))
        cls.admin_rol = User.objects.create_user('administrador', password=CLAVE)
        cls.admin_rol.groups.add(Group.objects.get(name='Administrador'))


class AutenticacionTests(TestCase):
    def test_lista_exige_login(self):
        response = self.client.get(reverse('lista_tareas'))
        self.assertRedirects(
            response, f"{reverse('login')}?next={reverse('lista_tareas')}"
        )

    def test_registro_crea_usuario_en_grupo_miembro_y_abre_sesion(self):
        # Funciona incluso si los roles aun no existen (se crean al vuelo).
        response = self.client.post(reverse('registro'), {
            'username': 'nuevo',
            'password1': CLAVE,
            'password2': CLAVE,
        })
        self.assertRedirects(response, reverse('lista_tareas'))
        usuario = User.objects.get(username='nuevo')
        self.assertTrue(usuario.groups.filter(name='Miembro').exists())

    def test_login_y_logout(self):
        User.objects.create_user('ana', password=CLAVE)
        response = self.client.post(reverse('login'), {
            'username': 'ana', 'password': CLAVE,
        })
        self.assertEqual(response.status_code, 302)
        self.assertIn('_auth_user_id', self.client.session)

        response = self.client.post(reverse('logout'))
        self.assertRedirects(response, reverse('login'))
        self.assertNotIn('_auth_user_id', self.client.session)


class PermisosPorRolTests(RolesBase):
    def test_miembro_crea_edita_y_consulta(self):
        self.client.login(username='miembro', password=CLAVE)
        response = self.client.post(reverse('crear_tarea'), DATOS_TAREA)
        self.assertRedirects(response, reverse('lista_tareas'))
        tarea = Tarea.objects.get(titulo='Preparar informe')

        response = self.client.get(reverse('detalle_tarea', args=[tarea.pk]))
        self.assertContains(response, 'Preparar informe')

        datos = dict(DATOS_TAREA, titulo='Informe final', estado='proceso')
        response = self.client.post(reverse('editar_tarea', args=[tarea.pk]), datos)
        self.assertRedirects(response, reverse('detalle_tarea', args=[tarea.pk]))
        tarea.refresh_from_db()
        self.assertEqual(tarea.titulo, 'Informe final')

    def test_miembro_no_puede_eliminar(self):
        tarea = Tarea.objects.create(**DATOS_TAREA)
        self.client.login(username='miembro', password=CLAVE)
        response = self.client.post(reverse('eliminar_tarea', args=[tarea.pk]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Tarea.objects.filter(pk=tarea.pk).exists())

    def test_administrador_puede_eliminar(self):
        tarea = Tarea.objects.create(**DATOS_TAREA)
        self.client.login(username='administrador', password=CLAVE)
        response = self.client.get(reverse('eliminar_tarea', args=[tarea.pk]))
        self.assertContains(response, '¿Seguro que deseas eliminar')
        response = self.client.post(reverse('eliminar_tarea', args=[tarea.pk]))
        self.assertRedirects(response, reverse('lista_tareas'))
        self.assertFalse(Tarea.objects.filter(pk=tarea.pk).exists())

    def test_usuario_sin_grupo_no_ve_tareas(self):
        User.objects.create_user('sin_rol', password=CLAVE)
        self.client.login(username='sin_rol', password=CLAVE)
        response = self.client.get(reverse('lista_tareas'))
        self.assertEqual(response.status_code, 403)