'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createGeminiClient, BASE_URL } = require('../src/gemini');

const respuesta = (status, cuerpo) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => {
    if (cuerpo instanceof Error) throw cuerpo;
    return cuerpo;
  },
});
const conTexto = (texto) => ({ candidates: [{ content: { parts: [{ text: texto }] } }] });
const cliente = (fetchImpl, extra = {}) =>
  createGeminiClient({ apiKey: 'k', model: 'gemini-3.5-flash', timeoutMs: 200, retryDelayMs: 0, fetchImpl, ...extra });
const args = { prompt: 'hola', schema: { type: 'OBJECT' } };

test('envia la solicitud REST correcta a Gemini', async () => {
  let visto;
  const ia = cliente(async (url, opciones) => {
    visto = { url, opciones };
    return respuesta(200, conTexto('{"resumen":"ok"}'));
  });
  const r = await ia.generateJson(args);
  assert.deepEqual(r, { resumen: 'ok' });
  assert.equal(visto.url, `${BASE_URL}/gemini-3.5-flash:generateContent`);
  assert.equal(visto.opciones.method, 'POST');
  assert.equal(visto.opciones.headers['x-goog-api-key'], 'k');
  const cuerpo = JSON.parse(visto.opciones.body);
  assert.equal(cuerpo.contents[0].parts[0].text, 'hola');
  assert.equal(cuerpo.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(cuerpo.generationConfig.responseSchema, { type: 'OBJECT' });
});

test('la clave de API va en una cabecera y nunca en la URL', async () => {
  let url;
  await cliente(async (u) => { url = u; return respuesta(200, conTexto('{}')); }).generateJson(args);
  assert.ok(!url.includes('key='));
});

test('sin GEMINI_API_KEY responde 503 sin llamar a la red', async () => {
  let llamado = false;
  const ia = cliente(async () => { llamado = true; }, { apiKey: '' });
  await assert.rejects(ia.generateJson(args), (e) => e.status === 503 && e.codigo === 'IA_NO_CONFIGURADA');
  assert.equal(llamado, false);
});

test('traduce 429 de Gemini a IA_LIMITE_EXCEDIDO', async () => {
  const ia = cliente(async () => respuesta(429, {}));
  await assert.rejects(ia.generateJson(args), (e) => e.status === 429 && e.codigo === 'IA_LIMITE_EXCEDIDO');
});

test('traduce otros errores HTTP a 502 IA_ERROR', async () => {
  const ia = cliente(async () => respuesta(500, {}));
  await assert.rejects(ia.generateJson(args), (e) => e.status === 502 && e.codigo === 'IA_ERROR');
});

test('un fallo de red es 502 IA_NO_DISPONIBLE', async () => {
  const ia = cliente(async () => { throw new TypeError('fetch failed'); });
  await assert.rejects(ia.generateJson(args), (e) => e.status === 502 && e.codigo === 'IA_NO_DISPONIBLE');
});

test('el tiempo agotado es 504 IA_TIEMPO_AGOTADO', async () => {
  const ia = cliente((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { const e = new Error('abortado'); e.name = 'AbortError'; reject(e); });
  }), { timeoutMs: 20 });
  await assert.rejects(ia.generateJson(args), (e) => e.status === 504 && e.codigo === 'IA_TIEMPO_AGOTADO');
});

test('respuesta sin candidatos (bloqueada) es 502 IA_RESPUESTA_VACIA', async () => {
  const ia = cliente(async () => respuesta(200, { candidates: [] }));
  await assert.rejects(ia.generateJson(args), (e) => e.codigo === 'IA_RESPUESTA_VACIA');
});

test('texto que no es JSON es 502 IA_RESPUESTA_INVALIDA', async () => {
  const ia = cliente(async () => respuesta(200, conTexto('esto no es json')));
  await assert.rejects(ia.generateJson(args), (e) => e.codigo === 'IA_RESPUESTA_INVALIDA');
});

test('cuerpo HTTP no parseable es 502 IA_RESPUESTA_INVALIDA', async () => {
  const ia = cliente(async () => respuesta(200, new SyntaxError('mal')));
  await assert.rejects(ia.generateJson(args), (e) => e.codigo === 'IA_RESPUESTA_INVALIDA');
});

test('reintenta ante un 503 temporal y termina con exito', async () => {
  let llamadas = 0;
  const ia = cliente(async () => {
    llamadas += 1;
    return llamadas < 3 ? respuesta(503, {}) : respuesta(200, conTexto('{"ok":true}'));
  });
  assert.deepEqual(await ia.generateJson(args), { ok: true });
  assert.equal(llamadas, 3);
});

test('si el 503 persiste agota los reintentos (3 intentos) y responde 502', async () => {
  let llamadas = 0;
  const ia = cliente(async () => { llamadas += 1; return respuesta(503, {}); });
  await assert.rejects(ia.generateJson(args), (e) => e.status === 502 && e.codigo === 'IA_ERROR');
  assert.equal(llamadas, 3);
});

test('la espera entre reintentos crece (backoff)', async () => {
  const esperas = [];
  const ia = cliente(async () => respuesta(503, {}), { retryDelayMs: 100, sleepImpl: async (ms) => { esperas.push(ms); } });
  await assert.rejects(ia.generateJson(args));
  assert.deepEqual(esperas, [100, 200]);
});

test('no reintenta errores del cliente (400) ni de cuota (429)', async () => {
  for (const estado of [400, 429]) {
    let llamadas = 0;
    const ia = cliente(async () => { llamadas += 1; return respuesta(estado, {}); });
    await assert.rejects(ia.generateJson(args));
    assert.equal(llamadas, 1, `estado ${estado}`);
  }
});

test('usa el modelo de respaldo cuando el principal sigue saturado', async () => {
  const urls = [];
  const ia = cliente(async (url) => {
    urls.push(url);
    return url.includes('/respaldo:') ? respuesta(200, conTexto('{"via":"respaldo"}')) : respuesta(503, {});
  }, { fallbackModel: 'respaldo' });
  assert.deepEqual(await ia.generateJson(args), { via: 'respaldo' });
  assert.equal(urls.length, 4);
});

test('usa el modelo de respaldo cuando el principal fue retirado (404)', async () => {
  const urls = [];
  const ia = cliente(async (url) => {
    urls.push(url);
    return url.includes('/respaldo:') ? respuesta(200, conTexto('{"via":"respaldo"}')) : respuesta(404, {});
  }, { fallbackModel: 'respaldo' });
  assert.deepEqual(await ia.generateJson(args), { via: 'respaldo' });
  assert.equal(urls.length, 2);
});

test('sin modelo de respaldo, un 404 no se reintenta y responde 502', async () => {
  let llamadas = 0;
  const ia = cliente(async () => { llamadas += 1; return respuesta(404, {}); });
  await assert.rejects(ia.generateJson(args), (e) => e.status === 502 && e.codigo === 'IA_ERROR');
  assert.equal(llamadas, 1);
});
