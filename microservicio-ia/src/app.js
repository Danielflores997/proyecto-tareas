'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { RUTAS, createHandlers, errorARespuesta } = require('./handlers');
const { buildSpec } = require('./openapi');

/** Construye la aplicacion Express. `ia` es el cliente de Gemini (inyectable). */
function createApp({ config, ia }) {
  const app = express();
  const spec = buildSpec({ publicUrl: config.publicUrl });
  const handlers = createHandlers({ config, ia });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Documentacion publica
  app.get('/openapi.json', (req, res) => res.json(spec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'Microservicio IA - Swagger' }));
  app.get('/', (req, res) => res.redirect('/api-docs'));

  // Endpoints de negocio, generados desde la tabla RUTAS
  RUTAS.forEach(({ metodo, ruta, handler }) => {
    app[metodo](ruta, async (req, res, next) => {
      try {
        const { status, body } = await handlers[handler]({ body: req.body, headers: req.headers });
        res.status(status).json(body);
      } catch (error) {
        next(error);
      }
    });
  });

  app.use((req, res) => {
    res.status(404).json({ error: { codigo: 'NO_ENCONTRADO', mensaje: `Ruta ${req.method} ${req.path} no existe.` } });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const { status, body } = errorARespuesta(error);
    if (status >= 500) console.error('[error]', error && error.message);
    res.status(status).json(body);
  });

  return app;
}

module.exports = { createApp };
