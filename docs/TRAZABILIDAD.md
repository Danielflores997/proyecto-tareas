# Matriz de trazabilidad — Entrega 3

Generada desde el SRS v3 (sección 3). Formato: RF → Caso de uso → Historia de usuario → Componente → Evidencia en video → Entrega → URL desplegada.

| RF | Caso de uso | HU | Componente | Evidencia prevista | Entrega | URL desplegada |
|---|---|---|---|---|---|---|
| RF-01 | CU-01 | HU-07 | RegistroForm / vista registro / registro.html | Video: registro | 2 | Django |
| RF-02 | CU-01 | HU-07 | vista registro + grupo Miembro | Video: registro y asignación | 2 | Django |
| RF-03 | CU-02 | HU-08 | LoginView / login.html | Video: login correcto e incorrecto | 2 | Django |
| RF-04 | CU-02 | HU-08 | LogoutView / formulario POST | Video: cerrar sesión | 2 | Django |
| RF-05 | CU-03 | HU-01 | lista_tareas / lista.html | Video: listado | 2 | Django |
| RF-06 | CU-03 | HU-03 | detalle_tarea / detalle.html | Video: detalle | 2 | Django |
| RF-07 | CU-04 | HU-02 | crear_tarea / TareaForm | Video: crear tarea | 2 | Django |
| RF-08 | CU-05 | HU-04 | editar_tarea / TareaForm | Video: editar tarea | 2 | Django |
| RF-09 | CU-06 | HU-05 | eliminar_tarea / delete_tarea | Video: Miembro denegado y Administrador elimina | 2 | Django |
| RF-10 | CU-07 | HU-06 | tareas/admin.py | Video: panel /admin/ | 2 | Django |
| RF-11 | CU-04 | HU-02 | Tarea en models.py / base de datos (SQLite o PostgreSQL) | Video: modelo y base de datos | 2 | Django |
| RNF-01 | — | — | login_required en las vistas de tareas | Video: acceso sin sesión redirige al login | 2 | Django |
| RNF-02 | — | — | permission_required / grupos Miembro y Administrador | Video: Miembro recibe 403 al eliminar | 2 | Django |
| RNF-03 | — | — | Token CSRF en formularios POST | Video: formularios de registro y login | 2 | Django |
| RNF-04 | — | — | settings.py (DATABASE_URL) / PostgreSQL en Render | Video: settings.py; panel Render: base Available | 2 | Django |
| RNF-06 | — | — | Dockerfile / docker-compose.yml / .dockerignore | Video: Dockerfile; docker compose en el equipo | 2 | Local / repositorio |
| RNF-07 | — | — | render.yaml / servicio gestor-tareas-uninpahu | Video: panel Render (Deployed) y URL pública | 2 | Django |
| RNF-08 | — | — | Variables de entorno en settings.py y render.yaml | Video: render.yaml (sin mostrar secretos) | 2 | Django |
| RF-12 | CU-08 | HU-09 | analizar_tarea_ia / ia_client.analizar_tarea / analisis_ia.html | Video 3: demostración real con IA | 3 | Django + Node.js |
| RF-13 | CU-09 | HU-10 | resumen_equipo_ia / ia_client.resumir_equipo / resumen_equipo_ia.html | Video 3: demostración real con IA | 3 | Django + Node.js |
| RF-14 | CU-08, CU-09 | HU-09, HU-11 | microservicio-ia/src/handlers.js y analisis.js | Video 3: Swagger, endpoints y "Try it out" | 3 | Node.js |
| RF-15 | CU-10 | HU-11 | microservicio-ia/src/openapi.js, /api-docs y docs/openapi.json | Video 3: presentación de Swagger | 3 | Node.js |
| RF-16 | CU-08, CU-09 | HU-09, HU-10 | tareas/ia_client.py y settings (NODE_SERVICE_*) | Video 3: comunicación Django → Node.js | 3 | Django + Node.js |
| RNF-09 | — | — | microservicio-ia/src/seguridad.js (X-API-Key) | Video 3: 401 sin Authorize en Swagger | 3 | Node.js |
| RNF-10 | — | — | Variables de entorno (GEMINI_API_KEY solo en el microservicio) | Video 3: .env.example y panel de Render sin secretos | 3 | Node.js |
| RNF-11 | — | — | microservicio-ia/src/gemini.js y tareas/ia_client.py | Video 3: mensaje de error amable | 3 | Django + Node.js |
| RNF-13 | — | — | docker-compose.yml (web e ia, healthcheck) | Video 3: Docker Compose, servicios y levantamiento | 3 | Local / repositorio |
| RNF-14 | — | — | microservicio-ia/tests y tareas/tests_ia.py | Video 3: npm test con 36 pruebas en verde | 3 | Local / repositorio |

URL Django: https://gestor-tareas-uninpahu.onrender.com  
URL microservicio y Swagger: `[PEGAR URL DEL MICROSERVICIO]` y `[PEGAR URL DEL MICROSERVICIO]/api-docs`
