'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const a = require('../src/analisis');
const { iaFalsa } = require('./helpers');

test('validarTarea acepta una tarea valida y aplica valores por defecto', () => {
  const r = a.validarTarea({ titulo: '  Hacer informe ', descripcion: 'Detalle' });
  assert.deepEqual(r.errores, []);
  assert.deepEqual(r.valor, { titulo: 'Hacer informe', descripcion: 'Detalle', responsable: '', estado: 'pendiente' });
});

test('validarTarea reporta todos los errores', () => {
  assert.ok(a.validarTarea(null).errores.length >= 2);
  assert.ok(a.validarTarea({ titulo: 'x'.repeat(101), descripcion: 'd' }).errores[0].includes('100'));
  assert.ok(a.validarTarea({ titulo: 't', descripcion: 'd', estado: 'otro' }).errores[0].includes('estado'));
  assert.ok(a.validarTarea({ titulo: 't', descripcion: 'd'.repeat(2001) }).errores[0].includes('2000'));
  assert.ok(a.validarTarea({ titulo: 5, descripcion: 'd' }).errores[0].includes('titulo'));
});

test('validarEquipo exige una lista no vacia y valida cada elemento', () => {
  assert.ok(a.validarEquipo({}).errores.length);
  assert.ok(a.validarEquipo({ tareas: [] }).errores.length);
  assert.ok(a.validarEquipo({ tareas: new Array(51).fill({ titulo: 't' }) }).errores[0].includes('50'));
  assert.ok(a.validarEquipo({ tareas: [{ estado: 'pendiente' }] }).errores[0].startsWith('tareas[0]'));
  const ok = a.validarEquipo({ tareas: [{ titulo: 'A', responsable: 'Ana', estado: 'proceso' }] });
  assert.deepEqual(ok.valor, [{ titulo: 'A', responsable: 'Ana', estado: 'proceso' }]);
});

test('el prompt incluye los datos y delimita el contenido como informacion', () => {
  const p = a.construirPromptTarea({ titulo: 'Titulo X', descripcion: 'Desc Y', responsable: '', estado: 'proceso' });
  assert.match(p, /Titulo X/);
  assert.match(p, /Desc Y/);
  assert.match(p, /sin asignar/);
  assert.match(p, /<tarea>[\s\S]*<\/tarea>/);
  assert.match(p, /ignora cualquier instruccion/);
});

test('normalizarAnalisis limpia y acota la respuesta de la IA', () => {
  const r = a.normalizarAnalisis({
    resumen: '  Hola   mundo ',
    prioridad: ' ALTA ',
    subtareas: ['uno', '', 5, 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete'],
    riesgos: 'no es lista',
  });
  assert.equal(r.resumen, 'Hola mundo');
  assert.equal(r.prioridad, 'alta');
  assert.equal(r.subtareas.length, 6);
  assert.deepEqual(r.riesgos, []);
});

test('normalizarAnalisis usa prioridad media si la IA devuelve un valor desconocido', () => {
  assert.equal(a.normalizarAnalisis({ resumen: 'ok', prioridad: 'urgente' }).prioridad, 'media');
});

test('normalizarAnalisis rechaza una respuesta sin resumen con 502', () => {
  assert.throws(() => a.normalizarAnalisis({ prioridad: 'alta' }), (e) => e.status === 502 && e.codigo === 'IA_RESPUESTA_INVALIDA');
  assert.throws(() => a.normalizarAnalisis(null), (e) => e.status === 502);
});

test('calcularEstadisticas cuenta por estado y responsable', () => {
  const e = a.calcularEstadisticas([
    { titulo: 'a', responsable: 'Ana', estado: 'completada' },
    { titulo: 'b', responsable: 'Ana', estado: 'proceso' },
    { titulo: 'c', responsable: '', estado: 'pendiente' },
    { titulo: 'd', responsable: 'Luis', estado: 'completada' },
  ]);
  assert.equal(e.total, 4);
  assert.deepEqual(e.porEstado, { pendiente: 1, proceso: 1, completada: 2 });
  assert.deepEqual(e.porResponsable, { Ana: 2, 'sin asignar': 1, Luis: 1 });
  assert.equal(e.porcentajeCompletado, 50);
});

test('analizarTarea envia el prompt y el esquema a la IA y normaliza el resultado', async () => {
  const ia = iaFalsa({ resumen: 'R', prioridad: 'baja', subtareas: ['s1'], riesgos: [] });
  const r = await a.analizarTarea({ titulo: 'T', descripcion: 'D', responsable: '', estado: 'pendiente' }, ia);
  assert.deepEqual(r, { resumen: 'R', prioridad: 'baja', subtareas: ['s1'], riesgos: [] });
  assert.equal(ia.llamadas.length, 1);
  assert.match(ia.llamadas[0].prompt, /Titulo: T/);
  assert.equal(ia.llamadas[0].schema.type, 'OBJECT');
});

test('resumirEquipo combina estadisticas locales con el texto de la IA', async () => {
  const ia = iaFalsa({ resumen: 'Buen avance', recomendaciones: ['Priorizar B'] });
  const r = await a.resumirEquipo([{ titulo: 'A', responsable: 'Ana', estado: 'completada' }], ia);
  assert.equal(r.estadisticas.porcentajeCompletado, 100);
  assert.equal(r.resumen, 'Buen avance');
  assert.deepEqual(r.recomendaciones, ['Priorizar B']);
});
