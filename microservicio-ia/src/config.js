'use strict';

/** Lee la configuracion desde variables de entorno (nada se escribe en el codigo). */
function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3000,
    serviceApiKey: env.SERVICE_API_KEY || '',
    geminiApiKey: env.GEMINI_API_KEY || '',
    geminiModel: env.GEMINI_MODEL || 'gemini-3.5-flash',
    geminiFallbackModel: env.GEMINI_FALLBACK_MODEL || '',
    geminiRetries: env.GEMINI_RETRIES === undefined || env.GEMINI_RETRIES === '' ? 2 : Math.max(0, Number(env.GEMINI_RETRIES) || 0),
    geminiTimeoutMs: Number(env.GEMINI_TIMEOUT_MS) || 25000,
    publicUrl: env.PUBLIC_URL || env.RENDER_EXTERNAL_URL || '',
    rateLimitPerMinute: Number(env.RATE_LIMIT_PER_MINUTE) || 30,
  };
}

module.exports = { loadConfig };
