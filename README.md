# Gestor de Tareas de Equipo

Aplicación web desarrollada con Django para registrar, consultar, editar y eliminar las tareas de un equipo de trabajo, con un **microservicio Node.js** que analiza las tareas con IA generativa (Google Gemini). Proyecto académico de la Fundación Universitaria para el Desarrollo Humano - UNINPAHU.

## Problema

Los equipos pequeños coordinan sus actividades por WhatsApp, correo, papel u hojas de cálculo. Las tareas se dispersan, no queda claro quién es el responsable y el líder no tiene una visión actualizada del avance.

## Solución

Un gestor web centralizado que permite:

- Registro, inicio y cierre de sesión de usuarios.
- Roles: **Miembro** (consultar, crear y editar) y **Administrador** (además, eliminar).
- Listar todas las tareas del equipo.
- Crear tareas con título, descripción, responsable y estado.
- Consultar el detalle de cada tarea.
- Editar la información y el estado.
- Eliminar con confirmación (solo Administrador).
- Administrar tareas, usuarios y grupos desde Django Admin.
- **Analizar una tarea con IA** (resumen, prioridad sugerida, subtareas y riesgos) y **resumir el estado del equipo con IA**.
- Microservicio Node.js con **Swagger/OpenAPI** público (`/api-docs`).

## Arquitectura

```text
Navegador ──► Django (vistas, ia_client.py) ──X-API-Key──► Microservicio Node.js ──► Google Gemini
                  │                                          (Express + Swagger)
                  └──► SQLite (local) / PostgreSQL (Render)
```

Django nunca llama a Gemini: la clave de IA vive solo en el microservicio. Ver [docs/diagrama_arquitectura.png](docs/diagrama_arquitectura.png) y [docs/diagrama_secuencia_ia.png](docs/diagrama_secuencia_ia.png).

## Tecnologías

| Tecnología | Versión |
|---|---|
| Python | 3.12 o superior (imagen Docker: 3.13) |
| Django | 6.1 |
| SQLite | Desarrollo local |
| PostgreSQL | Producción (Render) |
| Docker / Docker Compose | Contenedores (Django + microservicio) |
| Node.js / Express | 22 / 4 (microservicio de IA) |
| Google Gemini API | `gemini-3.5-flash` (configurable) |
| OpenAPI / Swagger UI | 3.0.3 |
| Gunicorn + WhiteNoise | Servidor y archivos estáticos |
| Render | Despliegue (`render.yaml`) |
| HTML | Motor de plantillas de Django |
| Git / GitHub | Control de versiones |

## Documentación

| Documento | Enlace |
|---|---|
| Especificación de requisitos (SRS) | [docs/SRS.md](docs/SRS.md) |
| Diagramas UML | [docs/UML.md](docs/UML.md) |
| Backlog inicial | [docs/BACKLOG.md](docs/BACKLOG.md) |
| Guía de GitHub | [docs/GITHUB.md](docs/GITHUB.md) |
| Guion del video | [docs/GUION_VIDEO.md](docs/GUION_VIDEO.md) |
| Diagrama de secuencia | [docs/DIAGRAMA_SECUENCIA.md](docs/DIAGRAMA_SECUENCIA.md) |
| Matriz de trazabilidad | [docs/TRAZABILIDAD.md](docs/TRAZABILIDAD.md) |
| Guion Video 2 | [docs/GUION_VIDEO_2.md](docs/GUION_VIDEO_2.md) |
| Comandos de Docker | [docs/COMANDOS_DOCKER.md](docs/COMANDOS_DOCKER.md) |
| Despliegue en Render | [README_RENDER.md](README_RENDER.md) |
| Microservicio Node.js | [microservicio-ia/README.md](microservicio-ia/README.md) |
| Especificación OpenAPI | [docs/openapi.json](docs/openapi.json) |
| Guion Video 3 | [docs/GUION_VIDEO_3.md](docs/GUION_VIDEO_3.md) |

## Estructura del proyecto

```text
proyecto_tareas/
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml        # Django + microservicio
├── render.yaml               # Blueprint de Render (2 servicios + PostgreSQL)
├── .env.example
├── microservicio-ia/         # Node.js: Express, Swagger, Gemini, pruebas
├── proyecto_tareas/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tareas/
│   ├── models.py
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── ia_client.py          # cliente HTTP del microservicio
│   ├── tests.py
│   ├── tests_ia.py
│   ├── management/commands/crear_roles.py
│   ├── migrations/
│   └── templates/tareas/
└── docs/
```

## Requisitos previos

- Python 3.12 o superior.
- Git.
- (Opcional) Docker Desktop.
- Navegador web moderno.

## Instalación

```bash
git clone https://github.com/Danielflores997/proyecto-tareas.git
cd proyecto-tareas
git checkout deploy-render

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py crear_roles
python manage.py runserver
```

Abrir http://127.0.0.1:8000/ y registrarse en `/registro/`.

## Con Docker

```bash
cp .env.example .env        # completa GEMINI_API_KEY (https://aistudio.google.com/apikey)
docker compose up --build
docker compose ps           # web e ia deben aparecer en estado healthy
```

- Aplicación Django: http://localhost:8000
- Swagger del microservicio: http://localhost:3000/api-docs

Más comandos en [docs/COMANDOS_DOCKER.md](docs/COMANDOS_DOCKER.md).

### Sin Docker (solo Django)

El botón de IA necesita el microservicio. Para probarlo sin Docker: en `microservicio-ia/` ejecuta `npm install` y `npm start` (con las variables de `.env.example`), y en Django define `NODE_SERVICE_URL=http://localhost:3000` y `NODE_SERVICE_API_KEY` igual a `SERVICE_API_KEY`.

## Pruebas

```bash
python manage.py test                 # Django
cd microservicio-ia && npm test       # Node.js (36 pruebas, sin red ni API key)
```

Django: registro, login/logout, CRUD, permisos por rol e integración con el microservicio (simulado). Node.js: validación, cliente de Gemini simulado, seguridad, handlers y coherencia con OpenAPI.

## Panel de administración

```bash
python manage.py createsuperuser
```

Luego abrir http://127.0.0.1:8000/admin/ e iniciar sesión.

## Rutas principales

| Ruta | Función |
|---|---|
| `/registro/` | Registro de usuarios |
| `/login/` | Inicio de sesión |
| `/logout/` | Cierre de sesión (POST) |
| `/` | Lista de tareas |
| `/tarea/nueva/` | Crear tarea |
| `/tarea/<id>/` | Detalle de tarea |
| `/tarea/<id>/editar/` | Editar tarea |
| `/tarea/<id>/eliminar/` | Eliminar tarea con confirmación (Administrador) |
| `/tarea/<id>/ia/` | Analizar tarea con IA (POST) |
| `/ia/resumen/` | Resumen del equipo con IA (POST) |
| `/admin/` | Administración |

## Estado del proyecto

Entrega 3: además del núcleo funcional (autenticación, roles, CRUD, Django Admin), incluye un microservicio Node.js con Swagger/OpenAPI, integración Django → Node.js, IA generativa con Gemini y Docker Compose. Pendientes para ExpoUninpahu: CRUD de usuarios y roles desde la aplicación, persistencia opcional de los análisis y endurecimiento para producción.

## Despliegue

Ver [README_RENDER.md](README_RENDER.md).

| Servicio | URL |
|---|---|
| Django | https://gestor-tareas-uninpahu.onrender.com |
| Microservicio Node.js | `[PEGAR URL DEL MICROSERVICIO]` |
| Swagger público | `[PEGAR URL DEL MICROSERVICIO]/api-docs` |

Variables de entorno usadas: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, `PORT` y, opcionalmente, `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL` y `DJANGO_SUPERUSER_PASSWORD` para crear el usuario de `/admin` al arrancar. Para la IA: `NODE_SERVICE_URL`, `NODE_SERVICE_API_KEY` y `NODE_SERVICE_TIMEOUT` (Django); `SERVICE_API_KEY`, `GEMINI_API_KEY` y `GEMINI_MODEL` (microservicio). Los secretos nunca se suben al repositorio.

## Video de presentación

Enlace pendiente de publicación: `[VIDEO]`

## Licencia

Uso académico. Fundación Universitaria para el Desarrollo Humano - UNINPAHU.
