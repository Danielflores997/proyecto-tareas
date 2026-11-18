# Microservicio IA – Gestor de Tareas

Microservicio Node.js (Express) que analiza tareas con IA generativa (Google Gemini). Lo consume el backend Django. Su documentación interactiva (Swagger UI) es pública.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Estado del servicio y si la IA está configurada |
| POST | `/api/v1/tareas/analisis` | `X-API-Key` | Resumen, prioridad, subtareas y riesgos de una tarea |
| POST | `/api/v1/equipo/resumen` | `X-API-Key` | Estadísticas, resumen y recomendaciones para una lista de tareas |
| GET | `/api-docs` | No | Swagger UI |
| GET | `/openapi.json` | No | Especificación OpenAPI 3.0 |

Errores: siempre `{"error": {"codigo": "...", "mensaje": "...", "detalles": [...]}}`. Códigos HTTP: 400 (entrada inválida), 401 (clave), 429 (límite de solicitudes o cuota de Gemini), 502 (Gemini falló), 503 (servicio o IA sin configurar), 504 (Gemini no respondió a tiempo).

## Ejecutar

```bash
cd microservicio-ia
npm install
cp .env.example .env        # completa SERVICE_API_KEY y GEMINI_API_KEY
export $(grep -v '^#' .env | xargs)   # o define las variables en tu terminal
npm start                   # http://localhost:3000/api-docs
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/v1/tareas/analisis \
  -H "Content-Type: application/json" -H "X-API-Key: $SERVICE_API_KEY" \
  -d '{"titulo":"Preparar la sustentación","descripcion":"Armar la presentación y ensayar la demo","responsable":"Diego","estado":"proceso"}'
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SERVICE_API_KEY` | Sí | Clave compartida con Django (cabecera `X-API-Key`). Sin ella, los endpoints responden 503 |
| `GEMINI_API_KEY` | Sí (para IA) | API key de Google AI Studio |
| `GEMINI_MODEL` | No | Por defecto `gemini-2.5-flash`. Si Google retira el modelo, cámbialo aquí sin tocar el código |
| `GEMINI_TIMEOUT_MS` | No | Por defecto 25000 |
| `RATE_LIMIT_PER_MINUTE` | No | Por defecto 30 |
| `PORT` | No | Por defecto 3000 (Render usa 10000) |
| `PUBLIC_URL` | No | URL pública que aparece en Swagger |

## Pruebas

```bash
npm test
```

36 pruebas con `node:test`, sin red ni API key (Gemini se simula). Incluyen una que garantiza que **toda ruta registrada está documentada en OpenAPI** y viceversa. Para regenerar `docs/openapi.json`: `npm run openapi`.

## Estructura

```text
src/
├── server.js     # arranque
├── app.js        # Express: rutas, Swagger, errores
├── handlers.js   # lógica de cada endpoint (sin depender de Express) + tabla de rutas
├── analisis.js   # validación, prompts, normalización de la respuesta de la IA
├── gemini.js     # cliente REST de Gemini
├── seguridad.js  # comparación de claves y limitador
├── openapi.js    # especificación OpenAPI
├── config.js     # variables de entorno
└── errors.js
tests/            # pruebas
```

## Seguridad

- Clave de servicio comparada en tiempo constante; si no está configurada el servicio **falla cerrado**.
- La clave de Gemini viaja en una cabecera (`x-goog-api-key`), nunca en la URL.
- El contenido de las tareas se delimita en el prompt y se trata como datos; la respuesta de la IA se valida y normaliza antes de devolverla.
- Contenedor ejecutado como usuario no root. Los secretos solo en variables de entorno.
