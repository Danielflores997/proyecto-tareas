'use strict';

const crypto = require('node:crypto');

/** Comparacion de claves en tiempo constante. */
function claveValida(esperada, recibida) {
  if (!esperada || typeof recibida !== 'string') return false;
  const a = Buffer.from(esperada);
  const b = Buffer.from(recibida);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Limitador de ventana fija en memoria (protege la cuota de Gemini). */
function crearLimitador({ maximo, ventanaMs = 60000, ahora = () => Date.now() }) {
  const contadores = new Map();
  return function permitir(clave) {
    const t = ahora();
    const actual = contadores.get(clave);
    if (!actual || t - actual.inicio >= ventanaMs) {
      contadores.set(clave, { inicio: t, cuenta: 1 });
      return { permitido: true, restantes: maximo - 1 };
    }
    actual.cuenta += 1;
    return { permitido: actual.cuenta <= maximo, restantes: Math.max(0, maximo - actual.cuenta) };
  };
}

module.exports = { claveValida, crearLimitador };
