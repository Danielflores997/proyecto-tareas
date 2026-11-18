import io
import json
from unittest import mock
from urllib import error

from django.contrib.auth.models import Group, User
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse

from . import ia_client
from .ia_client import ServicioIAError
from .models import Tarea

CLAVE = 'ClaveSegura#2026'
ANALISIS = {
    'resumen': 'Preparar la entrega final del proyecto.',
    'prioridad': 'alta',
    'subtareas': ['Revisar el SRS', 'Ensayar la demo'],
    'riesgos': ['Poco tiempo'],
    'modelo': 'gemini-test',
}
RESUMEN = {
    'estadisticas': {
        'total': 2,
        'porEstado': {'pendiente': 1, 'proceso': 0, 'completada': 1},
        'porResponsable': {'Ana': 2},
        'porcentajeCompletado': 50,
    },
    'resumen': 'El equipo avanza a buen ritmo.',
    'recomendaciones': ['Cerrar lo pendiente'],
    'modelo': 'gemini-test',
}
AJUSTES_NODE = dict(
    NODE_SERVICE_URL='http://ia-test:3000',
    NODE_SERVICE_API_KEY='clave-compartida',
    NODE_SERVICE_TIMEOUT=5,
)


class RespuestaFalsa:
    """Imita la respuesta de urllib.request.urlopen (usable con `with`)."""

    def __init__(self, cuerpo):
        self._bytes = json.dumps(cuerpo).encode('utf-8')

    def read(self):
        return self._bytes

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def error_http(codigo, cuerpo=None):
    datos = json.dumps(cuerpo).encode('utf-8') if cuerpo is not None else b'no es json'
    return error.HTTPError('http://ia-test:3000/x', codigo, 'Error', {}, io.BytesIO(datos))


@override_settings(**AJUSTES_NODE)
class ClienteIATests(SimpleTestCase):
    def tarea(self):
        return Tarea(titulo='Entrega', descripcion='D' * 2500, responsable='Ana', estado='proceso')

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_analizar_envia_url_cabecera_y_cuerpo_correctos(self, urlopen):
        urlopen.return_value = RespuestaFalsa(ANALISIS)
        resultado = ia_client.analizar_tarea(self.tarea())

        self.assertEqual(resultado['prioridad'], 'alta')
        peticion = urlopen.call_args.args[0]
        self.assertEqual(peticion.full_url, 'http://ia-test:3000/api/v1/tareas/analisis')
        self.assertEqual(peticion.get_method(), 'POST')
        self.assertEqual(peticion.get_header('X-api-key'), 'clave-compartida')
        self.assertEqual(urlopen.call_args.kwargs['timeout'], 5)
        cuerpo = json.loads(peticion.data)
        self.assertEqual(cuerpo['titulo'], 'Entrega')
        self.assertEqual(cuerpo['estado'], 'proceso')
        self.assertEqual(len(cuerpo['descripcion']), ia_client.LIMITE_DESCRIPCION)

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_resumir_equipo_envia_lista_de_tareas(self, urlopen):
        urlopen.return_value = RespuestaFalsa(RESUMEN)
        tareas = [Tarea(titulo=f'T{i}', descripcion='d', responsable='Ana') for i in range(60)]
        ia_client.resumir_equipo(tareas)

        peticion = urlopen.call_args.args[0]
        self.assertTrue(peticion.full_url.endswith('/api/v1/equipo/resumen'))
        enviadas = json.loads(peticion.data)['tareas']
        self.assertEqual(len(enviadas), ia_client.LIMITE_TAREAS_RESUMEN)
        self.assertEqual(set(enviadas[0]), {'titulo', 'responsable', 'estado'})

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_error_401_explica_que_la_clave_es_incorrecta(self, urlopen):
        urlopen.side_effect = error_http(401, {'error': {'codigo': 'NO_AUTORIZADO', 'mensaje': 'x'}})
        with self.assertRaisesMessage(ServicioIAError, 'NODE_SERVICE_API_KEY'):
            ia_client.analizar_tarea(self.tarea())

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_error_del_microservicio_incluye_mensaje_y_detalles(self, urlopen):
        urlopen.side_effect = error_http(400, {'error': {'mensaje': 'Solicitud inválida.', 'detalles': ['titulo es obligatorio.']}})
        with self.assertRaises(ServicioIAError) as ctx:
            ia_client.analizar_tarea(self.tarea())
        self.assertIn('Solicitud inválida.', str(ctx.exception))
        self.assertIn('titulo es obligatorio.', str(ctx.exception))

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_error_http_con_cuerpo_no_json_usa_el_estado(self, urlopen):
        urlopen.side_effect = error_http(502)
        with self.assertRaisesMessage(ServicioIAError, '502'):
            ia_client.analizar_tarea(self.tarea())

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_servicio_caido_o_timeout_se_traduce_a_mensaje_amable(self, urlopen):
        for fallo in (error.URLError('sin conexion'), TimeoutError(), ConnectionRefusedError()):
            urlopen.side_effect = fallo
            with self.assertRaisesMessage(ServicioIAError, 'No se pudo contactar'):
                ia_client.analizar_tarea(self.tarea())

    @mock.patch('tareas.ia_client.request.urlopen')
    def test_respuesta_que_no_es_json_se_reporta(self, urlopen):
        malo = RespuestaFalsa({})
        malo._bytes = b'<html>no json</html>'
        urlopen.return_value = malo
        with self.assertRaisesMessage(ServicioIAError, 'no válida'):
            ia_client.analizar_tarea(self.tarea())

    @override_settings(NODE_SERVICE_API_KEY='')
    @mock.patch('tareas.ia_client.request.urlopen')
    def test_sin_clave_configurada_no_hace_ninguna_llamada(self, urlopen):
        with self.assertRaisesMessage(ServicioIAError, 'no está configurado'):
            ia_client.analizar_tarea(self.tarea())
        urlopen.assert_not_called()


@override_settings(**AJUSTES_NODE)
class VistasIATests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('crear_roles', verbosity=0)
        cls.miembro = User.objects.create_user('miembro', password=CLAVE)
        cls.miembro.groups.add(Group.objects.get(name='Miembro'))
        User.objects.create_user('sin_rol', password=CLAVE)
        cls.tarea = Tarea.objects.create(
            titulo='Preparar demo', descripcion='Ensayar', responsable='Ana', estado='proceso'
        )

    def entrar(self, usuario='miembro'):
        self.client.login(username=usuario, password=CLAVE)

    def test_analisis_exige_login(self):
        url = reverse('analizar_tarea_ia', args=[self.tarea.pk])
        self.assertEqual(self.client.post(url).status_code, 302)

    def test_analisis_solo_acepta_post(self):
        self.entrar()
        self.assertEqual(self.client.get(reverse('analizar_tarea_ia', args=[self.tarea.pk])).status_code, 405)

    def test_usuario_sin_permiso_recibe_403(self):
        self.entrar('sin_rol')
        with mock.patch('tareas.views.ia_client.analizar_tarea') as analizar:
            respuesta = self.client.post(reverse('analizar_tarea_ia', args=[self.tarea.pk]))
        self.assertEqual(respuesta.status_code, 403)
        analizar.assert_not_called()

    def test_miembro_ve_el_analisis_de_la_ia(self):
        self.entrar()
        with mock.patch('tareas.views.ia_client.analizar_tarea', return_value=ANALISIS) as analizar:
            respuesta = self.client.post(reverse('analizar_tarea_ia', args=[self.tarea.pk]))
        self.assertEqual(respuesta.status_code, 200)
        self.assertContains(respuesta, 'Preparar la entrega final del proyecto.')
        self.assertContains(respuesta, 'Revisar el SRS')
        self.assertContains(respuesta, 'Poco tiempo')
        self.assertContains(respuesta, 'gemini-test')
        analizar.assert_called_once_with(self.tarea)

    def test_si_la_ia_falla_se_muestra_el_error_sin_romper_la_pagina(self):
        self.entrar()
        with mock.patch('tareas.views.ia_client.analizar_tarea', side_effect=ServicioIAError('Servicio caído.')):
            respuesta = self.client.post(reverse('analizar_tarea_ia', args=[self.tarea.pk]))
        self.assertEqual(respuesta.status_code, 200)
        self.assertContains(respuesta, 'No se pudo generar el análisis')
        self.assertContains(respuesta, 'Servicio caído.')

    def test_analisis_de_tarea_inexistente_da_404(self):
        self.entrar()
        self.assertEqual(self.client.post(reverse('analizar_tarea_ia', args=[9999])).status_code, 404)

    def test_la_salida_de_la_ia_se_escapa_en_html(self):
        self.entrar()
        peligroso = dict(ANALISIS, resumen='<script>alert(1)</script>')
        with mock.patch('tareas.views.ia_client.analizar_tarea', return_value=peligroso):
            respuesta = self.client.post(reverse('analizar_tarea_ia', args=[self.tarea.pk]))
        self.assertNotContains(respuesta, '<script>alert(1)</script>')
        self.assertContains(respuesta, '&lt;script&gt;')

    def test_resumen_del_equipo_muestra_estadisticas_y_recomendaciones(self):
        self.entrar()
        with mock.patch('tareas.views.ia_client.resumir_equipo', return_value=RESUMEN) as resumir:
            respuesta = self.client.post(reverse('resumen_equipo_ia'))
        self.assertEqual(respuesta.status_code, 200)
        self.assertContains(respuesta, 'El equipo avanza a buen ritmo.')
        self.assertContains(respuesta, 'Avance: 50%')
        self.assertContains(respuesta, 'Cerrar lo pendiente')
        self.assertEqual(list(resumir.call_args.args[0]), [self.tarea])

    def test_resumen_sin_tareas_no_llama_al_microservicio(self):
        Tarea.objects.all().delete()
        self.entrar()
        with mock.patch('tareas.views.ia_client.resumir_equipo') as resumir:
            respuesta = self.client.post(reverse('resumen_equipo_ia'))
        self.assertContains(respuesta, 'No hay tareas registradas para resumir.')
        resumir.assert_not_called()

    def test_resumen_muestra_el_error_de_la_ia(self):
        self.entrar()
        with mock.patch('tareas.views.ia_client.resumir_equipo', side_effect=ServicioIAError('Cuota agotada.')):
            respuesta = self.client.post(reverse('resumen_equipo_ia'))
        self.assertContains(respuesta, 'Cuota agotada.')

    def test_detalle_y_lista_ofrecen_los_botones_de_ia(self):
        self.entrar()
        detalle = self.client.get(reverse('detalle_tarea', args=[self.tarea.pk]))
        self.assertContains(detalle, 'Analizar con IA')
        self.assertContains(self.client.get(reverse('lista_tareas')), 'Resumen del equipo con IA')
