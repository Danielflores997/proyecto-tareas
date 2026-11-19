"""Cliente HTTP del microservicio Node.js de IA.

Django nunca habla con Gemini: solo con el microservicio, que guarda la clave de IA.
Usa unicamente la libreria estandar (urllib).
"""
import json
import socket
from urllib import error, request

from django.conf import settings

LIMITE_DESCRIPCION = 2000  # mismo limite que valida el microservicio
LIMITE_TAREAS_RESUMEN = 50


class ServicioIAError(Exception):
    """Error al usar el microservicio de IA. El mensaje es apto para mostrarse al usuario."""


def _mensaje_http(exc):
    """Extrae un mensaje util de una respuesta de error del microservicio."""
    if exc.code == 401:
        return 'El microservicio de IA rechazó la clave de API (revisa NODE_SERVICE_API_KEY).'
    try:
        error_json = json.loads(exc.read().decode('utf-8')).get('error', {})
        mensaje = error_json.get('mensaje')
        detalles = error_json.get('detalles') or []
        if mensaje:
            return f"El servicio de IA respondió: {mensaje} {' '.join(detalles)}".strip()
    except (ValueError, UnicodeDecodeError, AttributeError):
        pass
    return f'El microservicio de IA respondió con el estado {exc.code}.'


def _post(ruta, payload):
    if not (settings.NODE_SERVICE_URL and settings.NODE_SERVICE_API_KEY):
        raise ServicioIAError(
            'El microservicio de IA no está configurado '
            '(faltan NODE_SERVICE_URL o NODE_SERVICE_API_KEY).'
        )
    peticion = request.Request(
        f'{settings.NODE_SERVICE_URL}{ruta}',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': settings.NODE_SERVICE_API_KEY,
        },
        method='POST',
    )
    try:
        with request.urlopen(peticion, timeout=settings.NODE_SERVICE_TIMEOUT) as respuesta:
            return json.loads(respuesta.read().decode('utf-8'))
    except error.HTTPError as exc:  # subclase de URLError: debe ir primero
        raise ServicioIAError(_mensaje_http(exc)) from exc
    except (error.URLError, socket.timeout, TimeoutError, ConnectionError) as exc:
        raise ServicioIAError(
            'No se pudo contactar el microservicio de IA. Si está en un plan gratuito '
            'puede estar iniciando; intenta de nuevo en un minuto.'
        ) from exc
    except (ValueError, UnicodeDecodeError) as exc:
        raise ServicioIAError('El microservicio de IA devolvió una respuesta no válida.') from exc


def tarea_a_payload(tarea):
    return {
        'titulo': tarea.titulo,
        'descripcion': tarea.descripcion[:LIMITE_DESCRIPCION],
        'responsable': tarea.responsable,
        'estado': tarea.estado,
    }


def analizar_tarea(tarea):
    """POST /api/v1/tareas/analisis -> resumen, prioridad, subtareas y riesgos."""
    return _post('/api/v1/tareas/analisis', tarea_a_payload(tarea))


def resumir_equipo(tareas):
    """POST /api/v1/equipo/resumen -> estadisticas, resumen y recomendaciones."""
    payload = {
        'tareas': [
            {'titulo': t.titulo, 'responsable': t.responsable, 'estado': t.estado}
            for t in list(tareas)[:LIMITE_TAREAS_RESUMEN]
        ]
    }
    return _post('/api/v1/equipo/resumen', payload)
