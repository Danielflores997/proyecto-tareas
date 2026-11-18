'use strict';

const { HttpError } = require('./errors');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Errores del servidor de Google que suelen ser temporales (p. ej. 503 "alta demanda").
const ESTADOS_REINTENTABLES = [500, 503];

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Cliente minimo de la API REST de Google Gemini (generateContent).
 * Recibe `fetchImpl` y `sleepImpl` para poder simularlos en las pruebas.
 *
 * Resiliencia:
 *  - Si Google responde 500/503 reintenta hasta `retries` veces con espera creciente.
 *  - Si sigue fallando (o el modelo devuelve 404 por haber sido retirado) y existe
 *    `fallbackModel`, repite el proceso con ese modelo de respaldo.
 */
function createGeminiClient({
  apiKey,
  model,
  fallbackModel = '',
  retries = 2,
  retryDelayMs = 800,
  timeoutMs = 25000,
  fetchImpl = globalThis.fetch,
  sleepImpl = esperar,
}) {
  async function pedir(modelo, cuerpo) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetchImpl(`${BASE_URL}/${encodeURIComponent(modelo)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: cuerpo,
        signal: controller.signal,
      });
    } catch (error) {
      if (error && error.name === 'AbortError') {
        throw new HttpError(504, 'IA_TIEMPO_AGOTADO', 'Gemini no respondio a tiempo.');
      }
      throw new HttpError(502, 'IA_NO_DISPONIBLE', 'No fue posible contactar a Gemini.');
    } finally {
      clearTimeout(timer);
    }
  }

  /** Pide a un modelo reintentando los errores temporales del servidor. */
  async function pedirConReintentos(modelo, cuerpo) {
    let respuesta;
    for (let intento = 0; intento <= retries; intento += 1) {
      respuesta = await pedir(modelo, cuerpo);
      if (!ESTADOS_REINTENTABLES.includes(respuesta.status)) return respuesta;
      if (intento < retries) await sleepImpl(retryDelayMs * (intento + 1));
    }
    return respuesta;
  }

  async function generateJson({ prompt, schema, temperature = 0.4 }) {
    if (!apiKey) {
      throw new HttpError(503, 'IA_NO_CONFIGURADA', 'La clave GEMINI_API_KEY no esta configurada.');
    }

    const cuerpo = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    let respuesta = await pedirConReintentos(model, cuerpo);
    const fallaModelo = ESTADOS_REINTENTABLES.includes(respuesta.status) || respuesta.status === 404;
    if (fallaModelo && fallbackModel && fallbackModel !== model) {
      respuesta = await pedirConReintentos(fallbackModel, cuerpo);
    }

    if (respuesta.status === 429) {
      throw new HttpError(429, 'IA_LIMITE_EXCEDIDO', 'Se excedio la cuota de la API de Gemini. Intenta de nuevo en un minuto.');
    }
    if (!respuesta.ok) {
      throw new HttpError(502, 'IA_ERROR', `Gemini respondio con el estado ${respuesta.status}.`);
    }

    let datos;
    try {
      datos = await respuesta.json();
    } catch (error) {
      throw new HttpError(502, 'IA_RESPUESTA_INVALIDA', 'La respuesta de Gemini no es JSON valido.');
    }

    const partes = datos && datos.candidates && datos.candidates[0] && datos.candidates[0].content
      && datos.candidates[0].content.parts;
    const texto = Array.isArray(partes) ? partes.map((p) => p.text || '').join('').trim() : '';
    if (!texto) {
      throw new HttpError(502, 'IA_RESPUESTA_VACIA', 'Gemini no devolvio contenido (puede haber sido bloqueado por seguridad).');
    }

    try {
      return JSON.parse(texto);
    } catch (error) {
      throw new HttpError(502, 'IA_RESPUESTA_INVALIDA', 'Gemini no devolvio JSON valido.');
    }
  }

  return { generateJson, model };
}

module.exports = { createGeminiClient, BASE_URL };
