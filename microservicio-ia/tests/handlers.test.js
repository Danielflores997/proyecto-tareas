'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandlers, errorARespuesta } = require('../src/handlers');
const { HttpError } = require('../src/errors');
const { crearLimitador, claveValida } = require('../src/seguridad');
const { iaFalsa, CONFIG, AUTH } = require('./helpers');

const RESP_TAREA = { resumen: 'R', prioridad: 'alta', subtareas: ['a', 'b', 'c'], riesgos: ['x'] };
const TAREA = { titulo: 'Entregar proyecto', descripcion: 'Preparar la entrega final' };

test('health es publico y no expone secretos', async () => {
  const h = createHandlers({ config: CONFIG, ia: iaFalsa({}) });
  const r = await h.health();
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { estado: 'ok', servicio: 'microservicio-ia-gestor-tareas', modelo: 'modelo-de-prueba', iaConfigurada: true });
  assert.ok(!JSON.stringify(r.body).includes('clave-de-prueba'));
});

test('analisis sin X-API-Key responde 401', async () => {
  const h = createHandlers({ config: CONFIG, ia: iaFalsa(RESP_TAREA) });
  await assert.rejects(h.analizarTarea({ body: TAREA, headers: {} }), (e) => e.status === 401);
  await assert.rejects(h.analizarTarea({ body: TAREA, headers: { 'x-api-key': 'otra' } }), (e) => e.status === 401);
});

test('si el servidor no tiene SERVICE_API_KEY falla cerrado con 503', async () => {
  const h = createHandlers({ config: { ...CONFIG, serviceApiKey: '' }, ia: iaFalsa(RESP_TAREA) });
  await assert.rejects(h.analizarTarea({ body: TAREA, headers: { 'x-api-key': '' } }), (e) => e.status === 503);
});

test('analisis valido devuelve 200 con el modelo usado', async () => {
  const ia = iaFalsa(RESP_TAREA);
  const h = createHandlers({ config: CONFIG, ia });
  const r = await h.analizarTarea({ body: TAREA, headers: AUTH });
  assert.equal(r.status, 200);
  assert.equal(r.body.prioridad, 'alta');
  assert.equal(r.body.modelo, 'modelo-de-prueba');
  assert.equal(ia.llamadas.length, 1);
});

test('analisis con cuerpo invalido responde 400 con detalles y no llama a la IA', async () => {
  const ia = iaFalsa(RESP_TAREA);
  const h = createHandlers({ config: CONFIG, ia });
  await assert.rejects(h.analizarTarea({ body: { titulo: '' }, headers: AUTH }), (e) => e.status === 400 && e.detalles.length >= 1);
  assert.equal(ia.llamadas.length, 0);
});

test('los errores de la IA se propagan con su codigo', async () => {
  const ia = iaFalsa(null, { falla: new HttpError(429, 'IA_LIMITE_EXCEDIDO', 'cuota') });
  const h = createHandlers({ config: CONFIG, ia });
  await assert.rejects(h.analizarTarea({ body: TAREA, headers: AUTH }), (e) => e.codigo === 'IA_LIMITE_EXCEDIDO');
});

test('resumen del equipo devuelve estadisticas, resumen y recomendaciones', async () => {
  const ia = iaFalsa({ resumen: 'Avance medio', recomendaciones: ['Cerrar pendientes'] });
  const h = createHandlers({ config: CONFIG, ia });
  const r = await h.resumirEquipo({
    body: { tareas: [{ titulo: 'A', estado: 'completada' }, { titulo: 'B', estado: 'pendiente' }] },
    headers: AUTH,
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.estadisticas.total, 2);
  assert.equal(r.body.estadisticas.porcentajeCompletado, 50);
  assert.equal(r.body.resumen, 'Avance medio');
});

test('el limitador devuelve 429 al superar el maximo por minuto', async () => {
  const h = createHandlers({ config: { ...CONFIG, rateLimitPerMinute: 2 }, ia: iaFalsa(RESP_TAREA) });
  await h.analizarTarea({ body: TAREA, headers: AUTH });
  await h.analizarTarea({ body: TAREA, headers: AUTH });
  await assert.rejects(h.analizarTarea({ body: TAREA, headers: AUTH }), (e) => e.status === 429 && e.codigo === 'DEMASIADAS_SOLICITUDES');
});

test('crearLimitador reinicia la cuenta al terminar la ventana', () => {
  let t = 0;
  const permitir = crearLimitador({ maximo: 1, ventanaMs: 1000, ahora: () => t });
  assert.equal(permitir('k').permitido, true);
  assert.equal(permitir('k').permitido, false);
  t = 1500;
  assert.equal(permitir('k').permitido, true);
});

test('claveValida compara en tiempo constante y rechaza vacios', () => {
  assert.equal(claveValida('abc', 'abc'), true);
  assert.equal(claveValida('abc', 'abd'), false);
  assert.equal(claveValida('abc', 'abcd'), false);
  assert.equal(claveValida('', ''), false);
  assert.equal(claveValida('abc', undefined), false);
});

test('errorARespuesta da el formato JSON estandar sin filtrar detalles internos', () => {
  const r = errorARespuesta(new HttpError(400, 'X', 'msg', ['d']));
  assert.deepEqual(r, { status: 400, body: { error: { codigo: 'X', mensaje: 'msg', detalles: ['d'] } } });
  const interno = errorARespuesta(new Error('secreto interno'));
  assert.equal(interno.status, 500);
  assert.ok(!JSON.stringify(interno.body).includes('secreto'));
  assert.equal(errorARespuesta(Object.assign(new SyntaxError('x'), { type: 'entity.parse.failed' })).status, 400);
});
