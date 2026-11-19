# Guion Video 2 — máximo 8 minutos (objetivo: 7:30)

Equipo: Daniel, Vanessa, Diego. Grabar con la sesión cerrada, una tarea de ejemplo ya creada y la URL de Render **abierta 2 minutos antes** (el plan gratis duerme tras 15 min).

| Tiempo | Quién | Qué se muestra |
|---|---|---|
| 0:00–0:30 | Daniel | Introducción |
| 0:30–3:30 | Daniel | Demo funcional (registro, login, CRUD, roles, admin) |
| 3:30–5:30 | Vanessa | Explicación técnica (modelos, BD, Dockerfile) |
| 5:30–7:00 | Diego | Despliegue (Render, GitHub) |
| 7:00–7:30 | Diego | Cierre |

## 0:00 – Introducción (Daniel)
"Somos Daniel Flores, Vanessa Madrigal y Diego Borbón. Presentamos la Entrega 2 de nuestro Gestor de Tareas, hecho con Django: ya tiene registro, login, roles, CRUD de tareas, Django Admin, un contenedor Docker y está publicado en Render."

## 0:30 – Demo funcional (Daniel) — 3 min
Usar la URL pública de Render.
1. **Registro (0:45):** abrir `/registro/`, crear el usuario `demo_miembro`. Decir: "Al registrarse queda en el grupo Miembro y la sesión se inicia sola."
2. **Logout / Login (0:30):** cerrar sesión y volver a entrar.
3. **CRUD como Miembro (1:00):** crear una tarea, abrir el detalle, editarla (cambiar estado a *En proceso*). Mostrar que **no aparece** el enlace "Eliminar".
4. **Rol Administrador (0:30):** entrar con un usuario del grupo Administrador, abrir la tarea y eliminarla (pide confirmación).
5. **Django Admin (0:15):** abrir `/admin/` con el superusuario; mostrar tareas, usuarios y grupos.

## 3:30 – Explicación técnica (Vanessa) — 2 min
1. **Modelo (`tareas/models.py`, 0:40):** "Un solo modelo, `Tarea`: título, descripción, responsable y estado, con tres opciones: pendiente, en proceso y completada."
2. **Base de datos (`settings.py`, 0:40):** "Si existe la variable `DATABASE_URL`, Django usa PostgreSQL; si no, usa SQLite. Local usamos SQLite; en Render, PostgreSQL."
3. **Dockerfile (0:40):** "Parte de `python:3.13-slim`, instala `requirements.txt`, copia el código y corre `collectstatic`. Al arrancar aplica migraciones, crea los roles con `crear_roles` y lanza Gunicorn. `docker-compose.yml` lo ejecuta en local en el puerto 8000 con un volumen para SQLite."

## 5:30 – Despliegue (Diego) — 1:30
1. GitHub: rama `deploy-render` con `render.yaml` y `Dockerfile` (0:30).
2. Panel de Render: servicio web **Deployed** y PostgreSQL **Available** (0:30). No mostrar variables de entorno ni `DATABASE_URL`.
3. Abrir la URL pública (0:30). "Render lee `render.yaml`, construye la imagen con nuestro Dockerfile y crea la base PostgreSQL. Es un despliegue inicial en plan gratuito: el servicio se suspende por inactividad y la base gratuita dura 30 días."

## 7:00 – Cierre (Diego)
"Entregamos el núcleo funcional: autenticación, roles, CRUD, Django Admin, Docker y despliegue inicial. En la Entrega 3 añadiremos las funcionalidades pendientes del backlog. Gracias."
