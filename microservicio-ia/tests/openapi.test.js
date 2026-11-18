'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSpec } = require('../src/openapi');
const { RUTAS } = require('../src/handlers');

const spec = buildSpec({ publicUrl: 'https://ejemplo.onrender.com' });

function recorrer(obj, fn) {
  if (Array.isArray(obj)) return obj.forEach((x) => recorrer(x, fn));
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([k, v]) => { fn(k, v); recorrer(v, fn); });
  }
}

test('es OpenAPI 3.0 con titulo, version y servidores', () => {
  assert.match(spec.openapi, /^3\.0\./);
  assert.ok(spec.info.title && spec.info.version);
  assert.equal(spec.servers[0].url, '/');
  assert.equal(spec.servers[1].url, 'https://ejemplo.onrender.com');
});

test('todas las rutas registradas en Express estan documentadas (y viceversa)', () => {
  const documentadas = [];
  Object.entries(spec.paths).forEach(([ruta, ops]) => Object.keys(ops).forEach((m) => documentadas.push(`${m} ${ruta}`)));
  const registradas = RUTAS.map((r) => `${r.metodo} ${r.ruta}`);
  assert.deepEqual(documentadas.sort(), registradas.sort());
});

test('toda referencia $ref apunta a un componente existente', () => {
  const refs = [];
  recorrer(spec, (k, v) => { if (k === '$ref') refs.push(v); });
  assert.ok(refs.length > 5);
  refs.forEach((ref) => {
    const partes = ref.replace('#/', '').split('/');
    const destino = partes.reduce((acc, p) => acc && acc[p], spec);
    assert.ok(destino, `referencia rota: ${ref}`);
  });
});

test('operationId unico y rutas protegidas con ApiKeyAuth', () => {
  const ids = [];
  RUTAS.forEach(({ metodo, ruta, protegida }) => {
    const op = spec.paths[ruta][metodo];
    ids.push(op.operationId);
    assert.ok(op.responses['200'], `${ruta} sin respuesta 200`);
    assert.equal(Boolean(op.security && op.security.length), protegida, `seguridad inconsistente en ${ruta}`);
    if (protegida) assert.ok(op.responses['401'], `${ruta} sin 401 documentado`);
  });
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(spec.components.securitySchemes.ApiKeyAuth);
});

test('los ejemplos de entrada cumplen las validaciones reales', () => {
  const { validarTarea, validarEquipo } = require('../src/analisis');
  const ejTarea = spec.paths['/api/v1/tareas/analisis'].post.requestBody.content['application/json'].example;
  const ejEquipo = spec.paths['/api/v1/equipo/resumen'].post.requestBody.content['application/json'].example;
  assert.deepEqual(validarTarea(ejTarea).errores, []);
  assert.deepEqual(validarEquipo(ejEquipo).errores, []);
});
