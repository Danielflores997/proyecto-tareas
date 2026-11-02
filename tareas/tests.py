from django.test import TestCase
from django.urls import reverse

from .models import Tarea


class TareaCrudTests(TestCase):
    def test_crear_leer_editar_y_eliminar_tarea(self):
        response = self.client.get(reverse('lista_tareas'))
        self.assertEqual(response.status_code, 200)

        response = self.client.post(reverse('crear_tarea'), {
            'titulo': 'Preparar informe',
            'descripcion': 'Reunir la informacion del proyecto',
            'responsable': 'Ana',
            'estado': 'pendiente',
        })
        self.assertRedirects(response, reverse('lista_tareas'))

        tarea = Tarea.objects.get(titulo='Preparar informe')
        response = self.client.get(reverse('detalle_tarea', args=[tarea.pk]))
        self.assertContains(response, 'Preparar informe')

        response = self.client.post(reverse('editar_tarea', args=[tarea.pk]), {
            'titulo': 'Preparar informe final',
            'descripcion': 'Informe revisado',
            'responsable': 'Ana',
            'estado': 'proceso',
        })
        self.assertRedirects(response, reverse('detalle_tarea', args=[tarea.pk]))
        tarea.refresh_from_db()
        self.assertEqual(tarea.titulo, 'Preparar informe final')

        response = self.client.get(reverse('eliminar_tarea', args=[tarea.pk]))
        self.assertContains(response, '¿Seguro que deseas eliminar')

        response = self.client.post(reverse('eliminar_tarea', args=[tarea.pk]))
        self.assertRedirects(response, reverse('lista_tareas'))
        self.assertFalse(Tarea.objects.filter(pk=tarea.pk).exists())