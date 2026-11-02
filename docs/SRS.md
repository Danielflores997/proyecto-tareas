# Documento de Especificación de Requisitos de Software (SRS)

**Proyecto:** Gestor de Tareas de Equipo (`proyecto_tareas`)
**Versión:** 1.0
**Fecha:** 02/11/2026
**Autor:** Equipo del proyecto
**Institución:** Fundación Universitaria para el Desarrollo Humano - UNINPAHU

---

## 1. Introducción

### 1.1 Propósito

Este documento especifica los requisitos funcionales y no funcionales del **Gestor de Tareas de Equipo**, una aplicación web desarrollada con Django que permite registrar, consultar, actualizar y eliminar tareas asignadas a los integrantes de un equipo.

El documento sirve como acuerdo entre el equipo de desarrollo, el docente evaluador y los usuarios finales, y como base para el diseño, la implementación, las pruebas y la presentación del proyecto.

### 1.2 Ámbito del sistema

El sistema es una aplicación web monolítica de tipo CRUD que cubre el ciclo de vida básico de una tarea:

1. Registro de una tarea con título, descripción, responsable y estado.
2. Consulta de todas las tareas en una lista.
3. Consulta del detalle de una tarea.
4. Edición de los datos y del estado de la tarea.
5. Eliminación con confirmación previa.
6. Administración de tareas desde el panel de Django.

El alcance corresponde a un **Producto Mínimo Viable (MVP)** académico. Funciones como autenticación de usuarios, fechas de vencimiento, prioridades, etiquetas, notificaciones, API REST y despliegue en la nube se documentan como evolución futura.

### 1.3 Definiciones y acrónimos

| Término | Significado |
|---|---|
| SRS | Software Requirements Specification |
| MVP | Minimum Viable Product (producto mínimo viable) |
| CRUD | Create, Read, Update, Delete |
| MVT | Model-View-Template, patrón de arquitectura de Django |
| ORM | Object-Relational Mapping |
| RF | Requisito funcional |
| RNF | Requisito no funcional |
| RN | Regla de negocio |
| UC | Caso de uso |
| HU | Historia de usuario |
| WSGI | Web Server Gateway Interface |
| CSRF | Cross-Site Request Forgery |
| DoD | Definition of Done |

### 1.4 Referencias

- Documentación oficial de Django: https://docs.djangoproject.com/
- Django 6.1.1 y Python 3.14.3 (versiones verificadas en el entorno del proyecto).
- Código fuente del proyecto: `manage.py`, `proyecto_tareas/`, `tareas/`.
- Diagramas UML: `docs/UML.md`.
- Backlog: `docs/BACKLOG.md`.
- Guion del video: `docs/GUION_VIDEO.md`.

### 1.5 Visión general del documento

La sección 2 describe el contexto y los usuarios. La sección 3 presenta los requisitos funcionales y no funcionales. La sección 4 describe las interfaces. La sección 5 detalla los casos de uso. La sección 6 define el modelo de datos. La sección 7 describe la arquitectura. La sección 8 presenta el plan de pruebas y criterios de aceptación. La sección 9 lista riesgos y la sección 10 la trazabilidad.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

El sistema es una aplicación web independiente, autocontenida y de uso local o institucional. Se ejecuta sobre el servidor de desarrollo de Django durante la etapa académica y puede desplegarse en un servidor WSGI en etapas posteriores.

Actualmente se compone de:

- Un proyecto Django llamado `proyecto_tareas`.
- Una aplicación llamada `tareas`.
- Una base de datos SQLite (`db.sqlite3`).
- Cuatro plantillas HTML: lista, detalle, formulario y confirmación de eliminación.
- El panel de administración de Django habilitado.

### 2.2 Funciones principales

| Código | Función |
|---|---|
| F-01 | Listar todas las tareas registradas. |
| F-02 | Crear una tarea. |
| F-03 | Ver el detalle de una tarea. |
| F-04 | Editar una tarea. |
| F-05 | Eliminar una tarea con confirmación. |
| F-06 | Cambiar el estado de una tarea. |
| F-07 | Administrar tareas desde Django Admin. |
| F-08 | Validar los datos del formulario. |

### 2.3 Usuarios y actores

| Actor | Descripción | Necesidad principal |
|---|---|---|
| Usuario del equipo (integrante) | Persona que registra y consulta tareas del equipo. | Organizar el trabajo y conocer el estado de cada tarea. |
| Administrador | Docente, líder o responsable con acceso al panel de administración. | Supervisar, corregir y depurar la información. |
| Desarrollador / mantenedor | Encargado técnico del sistema. | Ejecutar, probar y desplegar la aplicación. |

### 2.4 Entorno operativo

- **Cliente:** navegador web moderno (Chrome, Edge, Firefox o Safari).
- **Servidor de desarrollo:** Python 3.14.3 con Django 6.1.1.
- **Base de datos:** SQLite 3 incluida en Python.
- **Sistema operativo:** Windows, Linux o macOS.
- **Red:** local (`http://127.0.0.1:8000/`) durante el desarrollo.

### 2.5 Restricciones

- RC-01: El proyecto debe usar Django como framework principal.
- RC-02: La persistencia mínima debe funcionar con SQLite sin servicios externos.
- RC-03: La interfaz debe estar en español.
- RC-04: El sistema debe ejecutarse con el servidor de desarrollo de Django en la entrega académica.
- RC-05: No se exige autenticación en el MVP, por lo que cualquier visitante con acceso a la URL puede operar sobre las tareas.
- RC-06: Los datos actuales no se eliminan de forma lógica; la eliminación es física.

### 2.6 Supuestos y dependencias

- SP-01: El equipo dispone de Python y de un navegador web.
- SP-02: Los usuarios comparten un único espacio de trabajo; no se separan tareas por usuario.
- SP-03: El volumen inicial de tareas es bajo (decenas o cientos), adecuado para SQLite.
- SP-04: El acceso al sistema se controla a nivel de red o institución, no a nivel de aplicación.
- DP-01: El proyecto depende de Django y sus dependencias transitivas (`asgiref`, `sqlparse`, `tzdata`).

---

## 3. Requisitos

### 3.1 Requisitos funcionales

| ID | Requisito | Prioridad | Estado actual |
|---|---|---|---|
| RF-01 | El sistema debe permitir registrar una tarea con título, descripción, responsable y estado. | Alta | Implementado |
| RF-02 | El título debe ser obligatorio y tener entre 1 y 100 caracteres. | Alta | Implementado |
| RF-03 | La descripción debe ser obligatoria. | Alta | Implementado |
| RF-04 | El responsable debe ser obligatorio y tener entre 1 y 50 caracteres. | Alta | Implementado |
| RF-05 | El estado debe ser uno de: `pendiente`, `proceso`, `completada`; por defecto `pendiente`. | Alta | Implementado |
| RF-06 | El sistema debe listar todas las tareas con título, responsable y estado. | Alta | Implementado |
| RF-07 | El sistema debe mostrar un mensaje cuando no existan tareas. | Media | Implementado |
| RF-08 | El sistema debe mostrar el detalle de una tarea: título, descripción, responsable y estado. | Alta | Implementado |
| RF-09 | El sistema debe permitir editar todos los campos de una tarea. | Alta | Implementado |
| RF-10 | El sistema debe permitir eliminar una tarea previa confirmación del usuario. | Alta | Implementado |
| RF-11 | El sistema debe responder con error 404 cuando la tarea solicitada no exista. | Media | Implementado |
| RF-12 | El sistema debe mostrar los errores de validación en el formulario. | Alta | Implementado |
| RF-13 | El sistema debe permitir administrar las tareas desde Django Admin. | Media | Implementado |
| RF-14 | El sistema debe redirigir a la lista después de crear o eliminar una tarea. | Media | Implementado |
| RF-15 | El sistema debe redirigir al detalle después de editar una tarea. | Media | Implementado |
| RF-16 | El sistema debe permitir filtrar tareas por estado. | Media | Futuro |
| RF-17 | El sistema debe permitir buscar tareas por título o responsable. | Baja | Futuro |
| RF-18 | El sistema debe registrar fecha de creación y fecha límite. | Media | Futuro |
| RF-19 | El sistema debe permitir asignar una prioridad a la tarea. | Media | Futuro |
| RF-20 | El sistema debe autenticar usuarios y restringir operaciones según rol. | Alta (futuro) | Futuro |
| RF-21 | El sistema debe exponer una API REST para integraciones. | Baja | Futuro |
| RF-22 | El sistema debe enviar notificaciones de tareas próximas a vencer. | Baja | Futuro |

### 3.2 Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF-01 | Usabilidad | La interfaz debe estar en español, con navegación clara y acciones principales a un máximo de tres clics. |
| RNF-02 | Rendimiento | La lista de tareas debe cargar en menos de 1 segundo con hasta 1.000 registros en un entorno local. |
| RNF-03 | Seguridad | Toda operación de escritura debe usar protección CSRF. Las consultas deben realizarse mediante el ORM para prevenir inyección SQL. |
| RNF-04 | Seguridad | En producción, `DEBUG` debe ser `False`, `SECRET_KEY` debe provenir de una variable de entorno y `ALLOWED_HOSTS` debe estar configurado. |
| RNF-05 | Compatibilidad | La aplicación debe funcionar en las versiones recientes de Chrome, Edge, Firefox y Safari. |
| RNF-06 | Mantenibilidad | El código debe seguir el patrón MVT, la convención PEP 8 y mantener separadas las responsabilidades de modelo, vista, formulario y plantilla. |
| RNF-07 | Portabilidad | La aplicación debe ejecutarse en Windows, Linux y macOS con Python 3.14 o superior. |
| RNF-08 | Escalabilidad | La capa de persistencia debe poder migrarse de SQLite a PostgreSQL sin cambios en la lógica de negocio. |
| RNF-09 | Confiabilidad | Las operaciones de escritura deben ser atómicas a nivel de petición; los errores de validación no deben persistir datos. |
| RNF-10 | Accesibilidad | Las plantillas deben usar HTML semántico, etiquetas asociadas a los campos y contraste suficiente. |
| RNF-11 | Respaldo | Debe ser posible respaldar la base de datos copiando `db.sqlite3` o mediante `dumpdata`. |
| RNF-12 | Disponibilidad | El MVP debe funcionar sin conexión a servicios de terceros. |
| RNF-13 | Pruebas | Debe existir al menos una prueba automatizada que cubra el flujo CRUD completo. |
| RNF-14 | Documentación | El repositorio debe incluir README, SRS, UML, backlog y guion del video. |

### 3.3 Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una tarea solo puede tener uno de los tres estados definidos: pendiente, en proceso o completada. |
| RN-02 | El título de la tarea es obligatorio y no puede superar los 100 caracteres. |
| RN-03 | El responsable es obligatorio y no puede superar los 50 caracteres. |
| RN-04 | La descripción es obligatoria. |
| RN-05 | La eliminación es física e irreversible; debe confirmarse explícitamente. |
| RN-06 | No se restringe la creación de tareas con títulos repetidos. |
| RN-07 | Todas las tareas son visibles para todos los usuarios del sistema en el MVP. |
| RN-08 | Una tarea nueva inicia en estado `pendiente` si no se indica otro estado. |

### 3.4 Requisitos de información

El sistema debe almacenar de forma persistente:

- Identificador único autoincremental de la tarea.
- Título.
- Descripción.
- Responsable.
- Estado.

No se almacenan actualmente: autor, fecha de creación, fecha de actualización, fecha límite, prioridad, etiquetas ni historial de cambios.

---

## 4. Interfaces

### 4.1 Interfaces de usuario

| Pantalla | Ruta | Descripción |
|---|---|---|
| Lista de tareas | `/` | Muestra todas las tareas, un enlace a cada detalle y el acceso a crear tarea. |
| Crear tarea | `/tarea/nueva/` | Formulario vacío para registrar una tarea. |
| Detalle de tarea | `/tarea/<id>/` | Muestra los datos de la tarea y las acciones editar, eliminar y volver. |
| Editar tarea | `/tarea/<id>/editar/` | Formulario precargado con los datos de la tarea. |
| Eliminar tarea | `/tarea/<id>/eliminar/` | Confirmación antes de eliminar. |
| Administración | `/admin/` | Panel de Django para gestionar tareas y usuarios administradores. |

### 4.2 Interfaces de software

- `tareas.models.Tarea`: modelo de datos.
- `tareas.forms.TareaForm`: formulario basado en el modelo.
- `tareas.views`: vistas de lista, detalle, creación, edición y eliminación.
- `tareas.urls` y `proyecto_tareas.urls`: enrutamiento.
- `django.contrib.admin`: administración.
- SQLite como motor de base de datos.

### 4.3 Interfaces de comunicación

- HTTP/HTTPS entre el navegador y el servidor.
- Formularios HTML con método `POST` y token CSRF.
- Respuestas HTML renderizadas con el motor de plantillas de Django.
- No existe API ni comunicación con servicios externos en el MVP.

---

## 5. Casos de uso

### 5.1 Actores

- **Usuario del equipo:** actor principal.
- **Administrador:** actor secundario con acceso al panel de administración.
- **Sistema:** participa en validaciones, persistencia y redirecciones.

### 5.2 Resumen de casos de uso

| ID | Caso de uso | Actor | Prioridad |
|---|---|---|---|
| UC-01 | Listar tareas | Usuario | Alta |
| UC-02 | Crear tarea | Usuario | Alta |
| UC-03 | Consultar detalle de tarea | Usuario | Alta |
| UC-04 | Editar tarea | Usuario | Alta |
| UC-05 | Eliminar tarea | Usuario | Alta |
| UC-06 | Cambiar estado de tarea | Usuario | Media |
| UC-07 | Validar formulario | Sistema | Alta |
| UC-08 | Administrar tareas | Administrador | Media |

### 5.3 UC-01 Listar tareas

- **Actor:** Usuario del equipo.
- **Precondición:** La aplicación está disponible.
- **Flujo principal:**
  1. El usuario accede a `/`.
  2. El sistema consulta todas las tareas.
  3. El sistema muestra título, responsable y estado de cada tarea.
  4. El sistema muestra el enlace para crear una tarea.
- **Flujo alternativo A1:** No existen tareas; el sistema muestra "No hay tareas registradas".
- **Postcondición:** El usuario conoce el listado actual de tareas.

### 5.4 UC-02 Crear tarea

- **Actor:** Usuario del equipo.
- **Precondición:** Ninguna.
- **Flujo principal:**
  1. El usuario selecciona "Crear tarea".
  2. El sistema muestra el formulario vacío.
  3. El usuario ingresa título, descripción, responsable y estado.
  4. El usuario envía el formulario.
  5. El sistema valida los datos.
  6. El sistema guarda la tarea.
  7. El sistema redirige a la lista.
- **Flujo alternativo A1:** Datos inválidos; el sistema vuelve a mostrar el formulario con los errores y conserva los datos ingresados.
- **Postcondición:** La tarea queda persistida y visible en la lista.

### 5.5 UC-03 Consultar detalle de tarea

- **Actor:** Usuario del equipo.
- **Precondición:** La tarea existe.
- **Flujo principal:**
  1. El usuario selecciona una tarea en la lista.
  2. El sistema recupera la tarea por su identificador.
  3. El sistema muestra título, descripción, responsable y estado.
  4. El sistema ofrece las acciones editar, eliminar y volver.
- **Flujo alternativo A1:** La tarea no existe; el sistema responde con error 404.
- **Postcondición:** El usuario visualiza la información completa de la tarea.

### 5.6 UC-04 Editar tarea

- **Actor:** Usuario del equipo.
- **Precondición:** La tarea existe.
- **Flujo principal:**
  1. El usuario selecciona "Editar tarea" desde el detalle.
  2. El sistema muestra el formulario con los datos actuales.
  3. El usuario modifica uno o varios campos.
  4. El usuario envía el formulario.
  5. El sistema valida y guarda los cambios.
  6. El sistema redirige al detalle de la tarea.
- **Flujo alternativo A1:** Datos inválidos; se muestran los errores y no se guarda nada.
- **Flujo alternativo A2:** La tarea no existe; el sistema responde con error 404.
- **Postcondición:** La tarea refleja los nuevos datos.

### 5.7 UC-05 Eliminar tarea

- **Actor:** Usuario del equipo.
- **Precondición:** La tarea existe.
- **Flujo principal:**
  1. El usuario selecciona "Eliminar tarea".
  2. El sistema muestra una pantalla de confirmación con el título de la tarea.
  3. El usuario confirma la eliminación.
  4. El sistema elimina la tarea.
  5. El sistema redirige a la lista.
- **Flujo alternativo A1:** El usuario cancela; el sistema vuelve al detalle sin borrar.
- **Flujo alternativo A2:** La tarea no existe; el sistema responde con error 404.
- **Postcondición:** La tarea deja de existir de forma permanente.

### 5.8 UC-06 Cambiar estado de tarea

- **Actor:** Usuario del equipo.
- **Precondición:** La tarea existe.
- **Flujo principal:**
  1. El usuario abre la edición de la tarea.
  2. El usuario selecciona el nuevo estado.
  3. El usuario guarda.
  4. El sistema persiste el nuevo estado.
- **Postcondición:** El estado de la tarea se actualiza.
- **Nota:** En el MVP este caso de uso se realiza a través de UC-04; no existe una acción rápida independiente.

### 5.9 UC-07 Validar formulario

- **Actor:** Sistema.
- **Flujo principal:**
  1. El sistema recibe los datos del formulario.
  2. Verifica campos obligatorios, longitudes y valores permitidos.
  3. Si todo es válido, permite guardar.
  4. Si algo falla, devuelve el formulario con mensajes de error.
- **Postcondición:** Solo se persisten datos válidos.

### 5.10 UC-08 Administrar tareas

- **Actor:** Administrador.
- **Precondición:** El administrador tiene una cuenta con permisos y ha iniciado sesión.
- **Flujo principal:**
  1. El administrador accede a `/admin/`.
  2. El sistema solicita credenciales.
  3. El administrador consulta, crea, edita o elimina tareas.
- **Postcondición:** Los datos administrados quedan actualizados.

---

## 6. Modelo de datos

### 6.1 Entidad Tarea

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | Clave primaria, autoincremental | Identificador único. |
| `titulo` | CharField(100) | Obligatorio | Nombre corto de la tarea. |
| `descripcion` | TextField | Obligatorio | Detalle de la tarea. |
| `responsable` | CharField(50) | Obligatorio | Persona asignada. |
| `estado` | CharField(20) | Obligatorio, opciones cerradas, por defecto `pendiente` | Situación actual de la tarea. |

### 6.2 Valores del estado

| Valor almacenado | Etiqueta mostrada |
|---|---|
| `pendiente` | Pendiente |
| `proceso` | En proceso |
| `completada` | Completada |

### 6.3 Relaciones

En el MVP existe una única entidad, `Tarea`, sin relaciones con otras entidades. La evolución propuesta incluye `Usuario`, `Proyecto`, `Etiqueta` y `Comentario`.

### 6.4 Diccionario de datos y persistencia

- Base de datos: `db.sqlite3`.
- Migración inicial: `tareas/migrations/0001_initial.py`.
- Tabla generada: `tareas_tarea`.
- Acceso: ORM de Django (`Tarea.objects`).

---

## 7. Arquitectura

### 7.1 Estilo arquitectónico

El sistema usa el patrón **MVT (Model-View-Template)** propio de Django, con arquitectura monolítica en capas:

1. **Capa de presentación:** plantillas HTML en `tareas/templates/tareas/`.
2. **Capa de aplicación:** vistas en `tareas/views.py`, formularios en `tareas/forms.py` y rutas en `tareas/urls.py`.
3. **Capa de dominio:** modelo `Tarea` en `tareas/models.py`.
4. **Capa de persistencia:** ORM de Django sobre SQLite.
5. **Capa de administración:** Django Admin.

### 7.2 Componentes

- `proyecto_tareas.settings`: configuración del proyecto.
- `proyecto_tareas.urls`: enrutamiento raíz y montaje del admin.
- `tareas.urls`: rutas del dominio de tareas.
- `tareas.views`: lógica de las operaciones CRUD.
- `tareas.forms`: validación y presentación de formularios.
- `tareas.models`: definición de la entidad y reglas de estado.
- Plantillas: lista, detalle, formulario y confirmación.
- `tareas.admin`: registro del modelo en el panel administrativo.
- `tareas.tests`: prueba automatizada del flujo CRUD.

### 7.3 Flujo de una petición

1. El navegador envía una petición HTTP.
2. `proyecto_tareas.urls` delega en `tareas.urls`.
3. La vista correspondiente procesa la petición.
4. La vista usa el formulario para validar y el modelo para persistir.
5. La vista renderiza una plantilla o redirige.
6. El navegador recibe HTML y lo muestra.

### 7.4 Decisiones de diseño

| Decisión | Justificación |
|---|---|
| Django | Framework maduro, seguro y con ORM y admin integrados. |
| SQLite | Cero configuración y suficiente para el alcance académico. |
| MVT | Separación de responsabilidades y convención del framework. |
| Formularios de Django | Validación declarativa y protección CSRF. |
| Plantillas HTML simples | Claridad para la entrega y fácil mantenimiento. |
| Eliminación con confirmación | Evita pérdidas accidentales de información. |

### 7.5 Deuda técnica identificada

1. `SECRET_KEY` embebida en el código y `DEBUG = True`.
2. `ALLOWED_HOSTS` vacío.
3. Ausencia de autenticación y autorización por usuario.
4. Ausencia de paginación, búsqueda y filtros.
5. Sin fechas de creación, actualización ni vencimiento.
6. Sin `requirements.txt` ni repositorio Git (se corrigen con esta entrega).
7. Sin configuración de despliegue (Gunicorn, Nginx, variables de entorno).
8. Cobertura de pruebas limitada a un flujo feliz.
9. Sin manejo de errores personalizado (404/500).
10. Sin accesibilidad ni diseño responsive.

---

## 8. Criterios de aceptación y plan de pruebas

### 8.1 Criterios de aceptación del MVP

| ID | Criterio |
|---|---|
| CA-01 | Es posible abrir la lista de tareas y ver las tareas existentes. |
| CA-02 | Es posible crear una tarea con datos válidos y verla en la lista. |
| CA-03 | Es posible abrir el detalle de una tarea existente. |
| CA-04 | Es posible editar una tarea y ver los cambios reflejados. |
| CA-05 | Es posible cancelar la eliminación sin borrar la tarea. |
| CA-06 | Es posible confirmar la eliminación y dejar de ver la tarea. |
| CA-07 | Un formulario con datos inválidos no persiste la tarea y muestra errores. |
| CA-08 | Una URL con un identificador inexistente responde 404. |
| CA-09 | La prueba automatizada del flujo CRUD pasa correctamente. |
| CA-10 | El panel `/admin/` permite gestionar tareas con un superusuario. |

### 8.2 Pruebas automatizadas existentes

`tareas/tests.py` implementa `TareaCrudTests.test_crear_leer_editar_y_eliminar_tarea`, que verifica:

1. Acceso a la lista (HTTP 200).
2. Creación por `POST` y redirección.
3. Existencia de la tarea en la base de datos.
4. Visualización del detalle.
5. Edición y redirección al detalle.
6. Persistencia del nuevo título.
7. Confirmación de eliminación.
8. Eliminación efectiva.

Ejecución:

```bash
python manage.py test
```

### 8.3 Pruebas manuales recomendadas

- Crear tarea con título vacío.
- Crear tarea con título de 101 caracteres.
- Crear tarea con estado inválido.
- Acceder a `/tarea/999999/`.
- Cancelar una eliminación.
- Verificar el mensaje de lista vacía.
- Verificar el comportamiento en un navegador móvil.

### 8.4 Matriz de trazabilidad

| Requisito | Caso de uso | Historia de usuario |
|---|---|---|
| RF-01, RF-02, RF-03, RF-04, RF-05 | UC-02, UC-07 | HU-02 |
| RF-06, RF-07 | UC-01 | HU-01 |
| RF-08, RF-11 | UC-03 | HU-03 |
| RF-09, RF-15 | UC-04 | HU-04 |
| RF-10, RF-14 | UC-05 | HU-05 |
| RF-05, RF-09 | UC-06 | HU-06 |
| RF-12 | UC-07 | HU-07 |
| RF-13 | UC-08 | HU-08 |

---

## 9. Riesgos y supuestos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R-01 | Pérdida de datos por eliminación accidental. | Media | Alto | Confirmación previa y respaldos de `db.sqlite3`. |
| R-02 | Acceso no autorizado por falta de autenticación. | Alta | Alto | Implementar autenticación y roles en la siguiente iteración. |
| R-03 | Exposición de información por `DEBUG = True`. | Alta | Alto | Configurar variables de entorno antes de desplegar. |
| R-04 | Crecimiento de datos y degradación con SQLite. | Baja | Medio | Migrar a PostgreSQL y agregar paginación. |
| R-05 | Pérdida del código por no usar control de versiones. | Alta | Alto | Publicar el repositorio en GitHub. |
| R-06 | Cambios de alcance durante el desarrollo. | Media | Medio | Priorizar con MoSCoW y congelar el alcance del MVP. |
| R-07 | Diferencias entre entornos. | Media | Medio | Documentar versiones y usar `requirements.txt`. |

---

## 10. Glosario

- **Tarea:** unidad de trabajo con título, descripción, responsable y estado.
- **Responsable:** persona del equipo asignada a una tarea.
- **Estado:** situación de avance de la tarea.
- **CRUD:** conjunto de operaciones de creación, lectura, actualización y borrado.
- **MVT:** patrón Modelo-Vista-Plantilla de Django.
- **ORM:** capa que traduce objetos Python a registros de base de datos.
- **MVP:** versión mínima que entrega valor y permite validar la solución.
- **Backlog:** lista priorizada de historias de usuario y trabajo pendiente.

---

## 11. Evolución futura

1. Autenticación con `django.contrib.auth` y roles.
2. Modelo `Usuario` y asignación real de responsables.
3. Fechas de creación, actualización y vencimiento.
4. Prioridades, etiquetas y proyectos.
5. Filtros, búsqueda, ordenamiento y paginación.
6. API REST con Django REST Framework.
7. Notificaciones por correo o en la aplicación.
8. Historial de cambios y auditoría.
9. Despliegue con Gunicorn, Nginx, PostgreSQL y variables de entorno.
10. Pruebas de integración, cobertura y CI/CD con GitHub Actions.
