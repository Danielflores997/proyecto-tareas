'use strict';

/** Especificacion OpenAPI 3.0 del microservicio (la sirve Swagger UI en /api-docs). */
function buildSpec({ publicUrl = '' } = {}) {
  const servers = [{ url: '/', description: 'Servidor actual' }];
  if (publicUrl) servers.push({ url: publicUrl, description: 'Despliegue publico' });

  const errorResp = (descripcion, ejemplo) => ({
    description: descripcion,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: ejemplo } },
  });

  return {
    openapi: '3.0.3',
    info: {
      title: 'Microservicio IA - Gestor de Tareas',
      version: '1.0.0',
      description:
        'Microservicio Node.js que analiza tareas con IA generativa (Google Gemini). ' +
        'Lo consume el backend Django del Gestor de Tareas. ' +
        'Los endpoints de /api/v1 requieren la cabecera `X-API-Key` (boton **Authorize**).',
    },
    servers,
    tags: [
      { name: 'Sistema', description: 'Estado del servicio' },
      { name: 'IA', description: 'Analisis de tareas con IA generativa' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Sistema'],
          operationId: 'obtenerEstado',
          summary: 'Estado del servicio',
          description: 'Endpoint publico para verificar que el servicio esta activo y si la IA esta configurada.',
          responses: {
            200: {
              description: 'Servicio activo',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Estado' } } },
            },
          },
        },
      },
      '/api/v1/tareas/analisis': {
        post: {
          tags: ['IA'],
          operationId: 'analizarTarea',
          summary: 'Analizar una tarea con IA',
          description: 'Genera un resumen, una prioridad sugerida, subtareas y riesgos para una tarea.',
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TareaEntrada' },
                example: {
                  titulo: 'Preparar la sustentacion final',
                  descripcion: 'Armar la presentacion y ensayar la demostracion en vivo del proyecto.',
                  responsable: 'Diego',
                  estado: 'proceso',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Analisis generado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalisisTarea' } } },
            },
            400: errorResp('Solicitud invalida', {
              error: { codigo: 'SOLICITUD_INVALIDA', mensaje: 'El cuerpo de la solicitud no es valido.', detalles: ['titulo es obligatorio.'] },
            }),
            401: errorResp('Clave de API ausente o incorrecta', {
              error: { codigo: 'NO_AUTORIZADO', mensaje: 'Falta la cabecera X-API-Key o es incorrecta.' },
            }),
            429: errorResp('Limite de solicitudes o cuota de Gemini excedidos', {
              error: { codigo: 'DEMASIADAS_SOLICITUDES', mensaje: 'Se excedio el limite de solicitudes por minuto.' },
            }),
            502: errorResp('Gemini devolvio un error o una respuesta invalida', {
              error: { codigo: 'IA_ERROR', mensaje: 'Gemini respondio con el estado 500.' },
            }),
            503: errorResp('IA o servicio sin configurar', {
              error: { codigo: 'IA_NO_CONFIGURADA', mensaje: 'La clave GEMINI_API_KEY no esta configurada.' },
            }),
          },
        },
      },
      '/api/v1/equipo/resumen': {
        post: {
          tags: ['IA'],
          operationId: 'resumirEquipo',
          summary: 'Resumir el estado del equipo con IA',
          description:
            'Recibe la lista de tareas, calcula estadisticas localmente y pide a la IA un resumen y recomendaciones.',
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EquipoEntrada' },
                example: {
                  tareas: [
                    { titulo: 'Disenar la base de datos', responsable: 'Vannesa', estado: 'completada' },
                    { titulo: 'Desplegar el microservicio', responsable: 'Diego', estado: 'proceso' },
                    { titulo: 'Grabar el video 3', responsable: 'Daniel', estado: 'pendiente' },
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Resumen generado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ResumenEquipo' } } },
            },
            400: errorResp('Solicitud invalida', {
              error: { codigo: 'SOLICITUD_INVALIDA', mensaje: 'El cuerpo de la solicitud no es valido.' },
            }),
            401: errorResp('Clave de API ausente o incorrecta', {
              error: { codigo: 'NO_AUTORIZADO', mensaje: 'Falta la cabecera X-API-Key o es incorrecta.' },
            }),
            429: errorResp('Limite de solicitudes o cuota de Gemini excedidos', {
              error: { codigo: 'IA_LIMITE_EXCEDIDO', mensaje: 'Se excedio la cuota de la API de Gemini.' },
            }),
            502: errorResp('Gemini devolvio un error o una respuesta invalida', {
              error: { codigo: 'IA_RESPUESTA_INVALIDA', mensaje: 'Gemini no devolvio JSON valido.' },
            }),
            503: errorResp('IA o servicio sin configurar', {
              error: { codigo: 'IA_NO_CONFIGURADA', mensaje: 'La clave GEMINI_API_KEY no esta configurada.' },
            }),
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Clave compartida con el backend Django.' },
      },
      schemas: {
        Estado: {
          type: 'object',
          properties: {
            estado: { type: 'string', example: 'ok' },
            servicio: { type: 'string', example: 'microservicio-ia-gestor-tareas' },
            modelo: { type: 'string', example: 'gemini-3.5-flash' },
            iaConfigurada: { type: 'boolean', example: true },
          },
          required: ['estado', 'servicio', 'modelo', 'iaConfigurada'],
        },
        EstadoTarea: { type: 'string', enum: ['pendiente', 'proceso', 'completada'] },
        TareaEntrada: {
          type: 'object',
          properties: {
            titulo: { type: 'string', maxLength: 100 },
            descripcion: { type: 'string', maxLength: 2000 },
            responsable: { type: 'string', maxLength: 50 },
            estado: { $ref: '#/components/schemas/EstadoTarea' },
          },
          required: ['titulo', 'descripcion'],
        },
        AnalisisTarea: {
          type: 'object',
          properties: {
            resumen: { type: 'string' },
            prioridad: { type: 'string', enum: ['alta', 'media', 'baja'] },
            subtareas: { type: 'array', items: { type: 'string' } },
            riesgos: { type: 'array', items: { type: 'string' } },
            modelo: { type: 'string', example: 'gemini-3.5-flash' },
          },
          required: ['resumen', 'prioridad', 'subtareas', 'riesgos', 'modelo'],
        },
        TareaResumen: {
          type: 'object',
          properties: {
            titulo: { type: 'string', maxLength: 100 },
            responsable: { type: 'string', maxLength: 50 },
            estado: { $ref: '#/components/schemas/EstadoTarea' },
          },
          required: ['titulo'],
        },
        EquipoEntrada: {
          type: 'object',
          properties: {
            tareas: { type: 'array', minItems: 1, maxItems: 50, items: { $ref: '#/components/schemas/TareaResumen' } },
          },
          required: ['tareas'],
        },
        Estadisticas: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            porEstado: {
              type: 'object',
              properties: {
                pendiente: { type: 'integer' },
                proceso: { type: 'integer' },
                completada: { type: 'integer' },
              },
            },
            porResponsable: { type: 'object', additionalProperties: { type: 'integer' } },
            porcentajeCompletado: { type: 'integer', minimum: 0, maximum: 100 },
          },
          required: ['total', 'porEstado', 'porResponsable', 'porcentajeCompletado'],
        },
        ResumenEquipo: {
          type: 'object',
          properties: {
            estadisticas: { $ref: '#/components/schemas/Estadisticas' },
            resumen: { type: 'string' },
            recomendaciones: { type: 'array', items: { type: 'string' } },
            modelo: { type: 'string', example: 'gemini-3.5-flash' },
          },
          required: ['estadisticas', 'resumen', 'recomendaciones', 'modelo'],
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                codigo: { type: 'string' },
                mensaje: { type: 'string' },
                detalles: { type: 'array', items: { type: 'string' } },
              },
              required: ['codigo', 'mensaje'],
            },
          },
          required: ['error'],
        },
      },
    },
  };
}

module.exports = { buildSpec };
