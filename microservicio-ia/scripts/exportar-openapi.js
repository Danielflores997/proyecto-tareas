'use strict';

// Genera docs/openapi.json (documento OpenAPI entregable) desde la misma fuente que usa Swagger UI.
const fs = require('node:fs');
const path = require('node:path');
const { buildSpec } = require('../src/openapi');

const destino = path.join(__dirname, '..', '..', 'docs', 'openapi.json');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(buildSpec({ publicUrl: process.env.PUBLIC_URL || '' }), null, 2) + '\n');
console.log('Escrito', destino);
