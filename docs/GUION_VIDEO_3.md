# Guion Video 3 — máximo 8 minutos (objetivo: 6:30)

Equipo: Daniel, Vannesa, Diego. Todos participan. Mostrar pantallas reales (aplicación, Swagger, repositorio, Render).

**Antes de grabar:** abrir las dos URL de Render 2 minutos antes y ejecutar una vez "Analizar con IA" (despierta el microservicio gratuito). Tener un usuario Miembro, uno Administrador y 3–4 tareas creadas. No mostrar claves (`GEMINI_API_KEY`, `SERVICE_API_KEY`, `DATABASE_URL`).

| Tiempo | Quién | Bloque |
|---|---|---|
| 0:00–0:30 | Daniel | Introducción |
| 0:30–1:30 | Diego | Swagger/OpenAPI |
| 1:30–2:30 | Vannesa | Comunicación Django → Node.js |
| 2:30–4:00 | Daniel | Integración con IA (demo real) |
| 4:00–5:00 | Vannesa | Docker Compose |
| 5:00–6:00 | Diego | Evidencia de Requisitos Implementados |
| 6:00–6:30 | Todos | Estado del proyecto |

## 0:00 – Introducción (Daniel)
"Presentamos la Entrega 3 del Gestor de Tareas. Además de Django, ahora tenemos un microservicio en Node.js que usa IA generativa de Google Gemini para analizar las tareas del equipo."

## 0:30 – Swagger/OpenAPI (Diego) — 1 min
1. Abrir `<URL del microservicio>/api-docs` **sin iniciar sesión** (es público).
2. Mostrar los tres endpoints, los esquemas (`TareaEntrada`, `AnalisisTarea`, `Error`) y las respuestas documentadas (200, 400, 401, 429, 502, 503).
3. `GET /health` → *Try it out* → Execute: mostrar `iaConfigurada: true`.
4. `POST /api/v1/tareas/analisis` sin Authorize → mostrar el **401**. Luego **Authorize** con la clave y ejecutar el ejemplo.

## 1:30 – Comunicación Django → Node.js (Vannesa) — 1 min
1. Abrir `tareas/ia_client.py`: URL desde `settings`, cabecera `X-API-Key`, tiempo de espera y `ServicioIAError`.
2. Abrir `settings.py` (las tres variables `NODE_SERVICE_*`) y mostrar el diagrama de secuencia (`docs/diagrama_secuencia_ia.png`).
3. Decir: "Django nunca habla con Gemini. Solo con el microservicio, que es quien guarda la clave de IA."

## 2:30 – Integración con IA, demo real (Daniel) — 1:30 min
1. En la aplicación, abrir una tarea y pulsar **Analizar con IA**. Leer el resumen, la prioridad y las subtareas.
2. Volver a la lista y pulsar **Resumen del equipo con IA**: estadísticas y recomendaciones.
3. Aclarar que son sugerencias y no cambian las tareas guardadas.

## 4:00 – Docker Compose (Vannesa) — 1 min
1. Abrir `docker-compose.yml`: servicios `web` e `ia`, healthcheck, `depends_on` y `NODE_SERVICE_URL=http://ia:3000`.
2. En la terminal: `docker compose up --build` y luego `docker compose ps` con ambos servicios **healthy**.
3. Mostrar `localhost:8000` y `localhost:3000/api-docs`.

## 5:00 – Evidencia de Requisitos Implementados (Diego) — 1 min
Abrir la sección 4 del SRS y la matriz: RF-12 a RF-16, RNF-09 a RNF-14. Ejecutar `npm test` (36 pruebas en verde) y mostrar en Render ambos servicios en **Deployed**.

## 6:00 – Estado del proyecto (Todos) — 30 s
"Terminado: Django con roles, microservicio con Swagger, IA, Compose y despliegue. Pendiente para ExpoUninpahu: sustentación en vivo, CRUD de usuarios y roles desde la aplicación, y endurecimiento para producción."
