'use strict';

const { HttpError } = require('./errors');
const { claveValida, crearLimitador } = require('./seguridad');
const { validarTarea, validarEquipo, analizarTarea, resumirEquipo } = require('./analisis');

/**
 * Tabla de rutas: la usan Express (app.js) y las pruebas que comprueban que
 * todas estan documentadas en OpenAPI.
 */
const RUTAS = [
  { metodo: 'get', ruta: '/health', handler: 'health', protegida: false },
  { metodo: 'post', ruta: '/api/v1/tareas/analisis', handler: 'analizarTarea', protegida: true },
  { metodo: 'post', ruta: '/api/v1/equipo/resumen', handler: 'resumirEquipo', protegida: true },
];

/**
 * Los handlers no dependen de Express: reciben { body, headers } y devuelven
 * { status, body }. Asi se prueban sin levantar un servidor.
 */
function createHandlers({ config, ia }) {
  const limitador = crearLimitador({ maximo: config.rateLimitPerMinute });

  function autorizar(req) {
    if (!config.serviceApiKey) {
      throw new HttpError(503, 'SERVICIO_NO_CONFIGURADO', 'SERVICE_API_KEY no esta configurada en el servidor.');
    }
    if (!claveValida(config.serviceApiKey, req.headers && req.headers['x-api-key'])) {
      throw new HttpError(401, 'NO_AUTORIZADO', 'Falta la cabecera X-API-Key o es incorrecta.');
    }
    const { permitido } = limitador(config.serviceApiKey);
    if (!permitido) {
      throw new HttpError(429, 'DEMASIADAS_SOLICITUDES', 'Se excedio el limite de solicitudes por minuto.');
    }
  }

  const protegido = (fn) => async (req) => {
    autorizar(req);
    return fn(req);
  };

  return {
    health: async () => ({
      status: 200,
      body: {
        estado: 'ok',
        servicio: 'microservicio-ia-gestor-tareas',
        modelo: ia.model,
        iaConfigurada: Boolean(config.geminiApiKey),
      },
    }),

    analizarTarea: protegido(async (req) => {
      const { errores, valor } = validarTarea(req.body);
      if (errores.length) {
        throw new HttpError(400, 'SOLICITUD_INVALIDA', 'El cuerpo de la solicitud no es valido.', errores);
      }
      const analisis = await analizarTarea(valor, ia);
      return { status: 200, body: { ...analisis, modelo: ia.model } };
    }),

    resumirEquipo: protegido(async (req) => {
      const { errores, valor } = validarEquipo(req.body);
      if (errores.length) {
        throw new HttpError(400, 'SOLICITUD_INVALIDA', 'El cuerpo de la solicitud no es valido.', errores);
      }
      const resumen = await resumirEquipo(valor, ia);
      return { status: 200, body: { ...resumen, modelo: ia.model } };
    }),
  };
}

/** Convierte cualquier error en la respuesta JSON estandar. */
function errorARespuesta(error) {
  if (error instanceof HttpError) {
    const cuerpo = { error: { codigo: error.codigo, mensaje: error.message } };
    if (error.detalles) cuerpo.error.detalles = error.detalles;
    return { status: error.status, body: cuerpo };
  }
  if (error && (error.type === 'entity.parse.failed' || error instanceof SyntaxError)) {
    return { status: 400, body: { error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo no es JSON valido.' } } };
  }
  if (error && error.type === 'entity.too.large') {
    return { status: 413, body: { error: { codigo: 'CUERPO_DEMASIADO_GRANDE', mensaje: 'El cuerpo supera el tamano permitido.' } } };
  }
  return { status: 500, body: { error: { codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servidor.' } } };
}

module.exports = { RUTAS, createHandlers, errorARespuesta };
