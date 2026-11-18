'use strict';

/** IA falsa: devuelve lo que se le indique y guarda las llamadas. */
function iaFalsa(respuesta, { falla } = {}) {
  const llamadas = [];
  return {
    model: 'modelo-de-prueba',
    llamadas,
    async generateJson(args) {
      llamadas.push(args);
      if (falla) throw falla;
      return typeof respuesta === 'function' ? respuesta(args) : respuesta;
    },
  };
}

const CONFIG = {
  serviceApiKey: 'clave-de-prueba',
  geminiApiKey: 'gemini-de-prueba',
  rateLimitPerMinute: 30,
  publicUrl: '',
};

const AUTH = { 'x-api-key': 'clave-de-prueba' };

module.exports = { iaFalsa, CONFIG, AUTH };
