# Gestor de Tareas de Equipo

Aplicación web desarrollada con Django para registrar, consultar, editar y eliminar las tareas de un equipo de trabajo. Proyecto académico de la Fundación Universitaria para el Desarrollo Humano - UNINPAHU.

## Problema

Los equipos pequeños coordinan sus actividades por WhatsApp, correo, papel u hojas de cálculo. Las tareas se dispersan, no queda claro quién es el responsable y el líder no tiene una visión actualizada del avance.

## Solución

Un gestor web centralizado que permite:

- Listar todas las tareas del equipo.
- Crear tareas con título, descripción, responsable y estado.
- Consultar el detalle de cada tarea.
- Editar la información y el estado.
- Eliminar con confirmación.
- Administrar las tareas desde Django Admin.

## Tecnologías

| Tecnología | Versión |
|---|---|
| Python | 3.14.3 |
| Django | 6.1.1 |
| SQLite | Incluida en Python |
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

## Estructura del proyecto

```text
proyecto_tareas/
├── manage.py
├── requirements.txt
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
│   ├── tests.py
│   ├── migrations/
│   └── templates/tareas/
└── docs/
```

## Requisitos previos

- Python 3.14 o superior.
- Git.
- Navegador web moderno.

## Instalación

```bash
git clone https://github.com/USUARIO/proyecto-tareas-django.git
cd proyecto-tareas-django

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Abrir http://127.0.0.1:8000/

## Pruebas

```bash
python manage.py test
```

La prueba `TareaCrudTests` cubre el flujo completo: listar, crear, consultar, editar y eliminar.

## Panel de administración

```bash
python manage.py createsuperuser
```

Luego abrir http://127.0.0.1:8000/admin/ e iniciar sesión.

## Rutas principales

| Ruta | Función |
|---|---|
| `/` | Lista de tareas |
| `/tarea/nueva/` | Crear tarea |
| `/tarea/<id>/` | Detalle de tarea |
| `/tarea/<id>/editar/` | Editar tarea |
| `/tarea/<id>/eliminar/` | Eliminar tarea con confirmación |
| `/admin/` | Administración |

## Estado del proyecto

MVP funcional. Las funcionalidades de autenticación, fechas, prioridades, filtros, búsqueda, API REST y despliegue en producción están registradas en el backlog como evolución futura.

## Seguridad antes de desplegar

El proyecto está configurado para desarrollo. Antes de publicarlo en producción:

1. Cambiar `DEBUG = False`.
2. Mover `SECRET_KEY` a una variable de entorno.
3. Configurar `ALLOWED_HOSTS`.
4. Usar PostgreSQL en lugar de SQLite.
5. Servir con Gunicorn y Nginx.
6. Ejecutar `python manage.py check --deploy`.

## Video de presentación

Enlace pendiente de publicación: `[VIDEO]`

## Licencia

Uso académico. Fundación Universitaria para el Desarrollo Humano - UNINPAHU.
