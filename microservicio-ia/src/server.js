'use strict';

const { loadConfig } = require('./config');
const { createGeminiClient } = require('./gemini');
const { createApp } = require('./app');

const config = loadConfig();
const ia = createGeminiClient({
  apiKey: config.geminiApiKey,
  model: config.geminiModel,
  fallbackModel: config.geminiFallbackModel,
  retries: config.geminiRetries,
  timeoutMs: config.geminiTimeoutMs,
});

if (!config.serviceApiKey) console.warn('[aviso] SERVICE_API_KEY no esta definida: los endpoints /api/v1 responderan 503.');
if (!config.geminiApiKey) console.warn('[aviso] GEMINI_API_KEY no esta definida: la IA responderia 503.');

createApp({ config, ia }).listen(config.port, '0.0.0.0', () => {
  console.log(`Microservicio IA escuchando en el puerto ${config.port} (modelo ${config.geminiModel})`);
});
