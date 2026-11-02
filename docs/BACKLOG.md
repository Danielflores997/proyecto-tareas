# Backlog inicial del producto

**Proyecto:** Gestor de Tareas de Equipo (`proyecto_tareas`)
**Versión:** 1.0
**Fecha:** 02/11/2026
**Método de priorización:** MoSCoW
**Unidad de estimación:** puntos de historia (escala Fibonacci: 1, 2, 3, 5, 8)

---

## 1. Visión del producto

Facilitar a pequeños equipos académicos y de trabajo la organización de sus actividades mediante un gestor web sencillo que centralice las tareas, asigne responsables y haga visible el estado de avance.

**Métrica de éxito del MVP:**

- El 100 % de las tareas del equipo se registra en el sistema (no en chats o papeles).
- Crear una tarea toma menos de 1 minuto.
- Consultar el estado del equipo toma menos de 30 segundos.
- La prueba automatizada del flujo CRUD pasa en cada entrega.

---

## 2. Personas

| Persona | Perfil | Necesidad |
|---|---|---|
| Ana, integrante de equipo | Estudiante universitaria, usa el celular y el portátil. | Saber qué le corresponde y en qué va cada tarea. |
| Carlos, líder de equipo | Coordina un grupo de 5 personas. | Ver el avance global y reasignar tareas. |
| Docente / administrador | Revisa el trabajo y administra datos. | Supervisar y corregir la información. |

---

## 3. Épicas

| ID | Épica | Descripción | Prioridad |
|---|---|---|---|
| EP-01 | Gestión básica de tareas | CRUD completo de tareas con estado. | Must |
| EP-02 | Validación y calidad de datos | Reglas de validación y mensajes de error. | Must |
| EP-03 | Administración | Panel para gestionar tareas. | Should |
| EP-04 | Organización y búsqueda | Filtros, búsqueda, orden y paginación. | Should |
| EP-05 | Seguimiento temporal | Fechas, vencimientos y prioridades. | Should |
| EP-06 | Identidad y seguridad | Autenticación, autorización y roles. | Could |
| EP-07 | Integraciones | API REST, notificaciones y exportación. | Could |
| EP-08 | Operación y despliegue | Repositorio, CI/CD, producción y respaldos. | Must (entrega) |

---

## 4. Historias de usuario

### EP-01 Gestión básica de tareas

#### HU-01 Listar tareas

- **Como** integrante del equipo
- **quiero** ver todas las tareas registradas en una sola pantalla
- **para** conocer el trabajo pendiente y su estado.

**Prioridad:** Must | **Estimación:** 2 | **Estado:** Hecho

**Criterios de aceptación:**

1. Al entrar a `/`, se muestran todas las tareas.
2. Cada fila muestra título, responsable y estado legible.
3. El título enlaza al detalle de la tarea.
4. Si no hay tareas, se muestra "No hay tareas registradas".
5. Existe un enlace visible para crear una tarea.

---

#### HU-02 Crear tarea

- **Como** integrante del equipo
- **quiero** registrar una nueva tarea con título, descripción, responsable y estado
- **para** dejar constancia de una actividad asignada.

**Prioridad:** Must | **Estimación:** 3 | **Estado:** Hecho

**Criterios de aceptación:**

1. El enlace "Crear tarea" abre un formulario vacío.
2. El formulario contiene los cuatro campos.
3. Al guardar datos válidos, se crea la tarea y se redirige a la lista.
4. La tarea creada aparece inmediatamente en la lista.
5. El estado por defecto es "Pendiente".

---

#### HU-03 Consultar detalle de tarea

- **Como** integrante del equipo
- **quiero** ver toda la información de una tarea
- **para** entender qué se debe hacer y quién es el responsable.

**Prioridad:** Must | **Estimación:** 2 | **Estado:** Hecho

**Criterios de aceptación:**

1. Al seleccionar una tarea, se muestra su título, descripción, responsable y estado.
2. Se ofrecen las acciones editar, eliminar y volver a la lista.
3. Si el identificador no existe, se responde 404.

---

#### HU-04 Editar tarea

- **Como** integrante del equipo
- **quiero** modificar los datos de una tarea
- **para** corregir información o reflejar cambios.

**Prioridad:** Must | **Estimación:** 3 | **Estado:** Hecho

**Criterios de aceptación:**

1. El formulario de edición aparece precargado con los datos actuales.
2. Al guardar cambios válidos, se persisten y se redirige al detalle.
3. Los cambios se reflejan en la lista y en el detalle.
4. Si los datos son inválidos, no se guarda nada y se muestran errores.

---

#### HU-05 Eliminar tarea con confirmación

- **Como** integrante del equipo
- **quiero** eliminar tareas que ya no son necesarias
- **para** mantener limpio el listado, evitando borrados accidentales.

**Prioridad:** Must | **Estimación:** 2 | **Estado:** Hecho

**Criterios de aceptación:**

1. Al seleccionar eliminar, se muestra una pantalla de confirmación con el título.
2. Cancelar devuelve al detalle sin borrar.
3. Confirmar elimina la tarea y redirige a la lista.
4. La tarea eliminada desaparece de la lista y de la base de datos.

---

#### HU-06 Cambiar estado de una tarea

- **Como** integrante del equipo
- **quiero** actualizar el estado de una tarea
- **para** reflejar su avance real.

**Prioridad:** Should | **Estimación:** 2 | **Estado:** Hecho (mediante HU-04)

**Criterios de aceptación:**

1. El formulario ofrece exactamente tres estados.
2. Al cambiar el estado y guardar, el nuevo valor se muestra en lista y detalle.
3. No es posible guardar un estado fuera del catálogo.

---

### EP-02 Validación y calidad de datos

#### HU-07 Validar formulario y mostrar errores

- **Como** integrante del equipo
- **quiero** recibir mensajes claros cuando ingreso datos incorrectos
- **para** corregirlos sin perder lo que escribí.

**Prioridad:** Must | **Estimación:** 2 | **Estado:** Hecho

**Criterios de aceptación:**

1. Título, descripción y responsable son obligatorios.
2. El título no supera 100 caracteres.
3. El responsable no supera 50 caracteres.
4. Los errores aparecen junto al formulario.
5. Los datos válidos ingresados se conservan tras un error.

---

#### HU-08 Proteger operaciones de escritura con CSRF

- **Como** responsable técnico
- **quiero** que todos los formularios incluyan token CSRF
- **para** prevenir ataques de falsificación de peticiones.

**Prioridad:** Must | **Estimación:** 1 | **Estado:** Hecho

**Criterios de aceptación:**

1. Todos los formularios `POST` incluyen `{% csrf_token %}`.
2. Una petición `POST` sin token es rechazada por Django.

---

### EP-03 Administración

#### HU-09 Administrar tareas desde Django Admin

- **Como** administrador
- **quiero** gestionar tareas desde el panel de administración
- **para** supervisar y corregir datos sin usar la interfaz pública.

**Prioridad:** Should | **Estimación:** 1 | **Estado:** Hecho

**Criterios de aceptación:**

1. El modelo `Tarea` está registrado en `admin.py`.
2. Un superusuario puede listar, crear, editar y eliminar tareas desde `/admin/`.
3. El acceso exige autenticación.

---

### EP-04 Organización y búsqueda

#### HU-10 Filtrar tareas por estado

- **Como** integrante del equipo
- **quiero** filtrar las tareas por estado
- **para** enfocarme en lo pendiente o en lo completado.

**Prioridad:** Should | **Estimación:** 3 | **Estado:** Pendiente

**Criterios de aceptación:**

1. La lista ofrece filtros: todas, pendientes, en proceso, completadas.
2. El filtro se refleja en la URL mediante un parámetro `?estado=`.
3. El filtro seleccionado se mantiene visible.
4. Un valor inválido se ignora o muestra todas las tareas.

---

#### HU-11 Buscar tareas por título o responsable

- **Como** integrante del equipo
- **quiero** buscar por texto
- **para** encontrar una tarea rápidamente.

**Prioridad:** Could | **Estimación:** 3 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Existe un campo de búsqueda en la lista.
2. La búsqueda no distingue mayúsculas de minúsculas.
3. Busca en título y responsable.
4. Sin resultados, se muestra un mensaje claro.

---

#### HU-12 Paginar el listado de tareas

- **Como** integrante del equipo
- **quiero** ver las tareas en páginas
- **para** mantener la pantalla usable cuando haya muchos registros.

**Prioridad:** Could | **Estimación:** 3 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Se muestran como máximo 10 tareas por página.
2. Existen controles anterior y siguiente.
3. La página actual es visible.
4. La paginación conserva los filtros activos.

---

### EP-05 Seguimiento temporal

#### HU-13 Registrar fechas de creación y actualización

- **Como** integrante del equipo
- **quiero** saber cuándo se creó y actualizó una tarea
- **para** hacer seguimiento temporal.

**Prioridad:** Should | **Estimación:** 2 | **Estado:** Pendiente

**Criterios de aceptación:**

1. `creada_en` se asigna automáticamente al crear.
2. `actualizada_en` cambia automáticamente al editar.
3. Ambas fechas se muestran en el detalle.

---

#### HU-14 Asignar fecha límite y prioridad

- **Como** líder de equipo
- **quiero** definir vencimiento y prioridad
- **para** ordenar el trabajo según urgencia.

**Prioridad:** Should | **Estimación:** 3 | **Estado:** Pendiente

**Criterios de aceptación:**

1. La tarea admite fecha límite opcional.
2. La tarea admite prioridad: baja, media, alta.
3. La lista ordena por prioridad y fecha límite.
4. Las tareas vencidas se destacan visualmente.

---

### EP-06 Identidad y seguridad

#### HU-15 Registro e inicio de sesión

- **Como** usuario
- **quiero** crear una cuenta e iniciar sesión
- **para** que mis tareas estén protegidas.

**Prioridad:** Could | **Estimación:** 5 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Existe registro con usuario y contraseña.
2. La contraseña se almacena con hash.
3. Existe inicio y cierre de sesión.
4. Las rutas de tareas exigen autenticación.

---

#### HU-16 Separar tareas por usuario y rol

- **Como** usuario
- **quiero** ver solo mis tareas o las de mi equipo según mi rol
- **para** mantener la privacidad y el orden.

**Prioridad:** Could | **Estimación:** 5 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Cada tarea tiene un propietario.
2. Un usuario solo ve y modifica sus tareas, salvo el administrador.
3. Los permisos se validan en el servidor, no solo en la interfaz.

---

### EP-07 Integraciones

#### HU-17 API REST de tareas

- **Como** desarrollador
- **quiero** exponer operaciones CRUD por API
- **para** integrar el gestor con otras aplicaciones.

**Prioridad:** Could | **Estimación:** 8 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Endpoints `GET`, `POST`, `PUT`, `DELETE` para tareas.
2. Respuestas JSON con códigos HTTP correctos.
3. Validación y autenticación en la API.
4. Documentación de endpoints.

---

#### HU-18 Notificar tareas próximas a vencer

- **Como** integrante del equipo
- **quiero** recibir avisos de vencimiento
- **para** no olvidar mis compromisos.

**Prioridad:** Could | **Estimación:** 5 | **Estado:** Pendiente

**Criterios de aceptación:**

1. Se identifican tareas que vencen en las próximas 24 horas.
2. Se envía una notificación por correo o en la aplicación.
3. El usuario puede configurar si desea recibir avisos.

---

### EP-08 Operación y despliegue

#### HU-19 Publicar el repositorio en GitHub

- **Como** responsable técnico
- **quiero** versionar el código en GitHub
- **para** respaldar, colaborar y evidenciar el trabajo.

**Prioridad:** Must | **Estimación:** 1 | **Estado:** Pendiente de ejecución

**Criterios de aceptación:**

1. Existe `.gitignore` que excluye `venv`, `__pycache__`, `db.sqlite3` y `.env`.
2. Existe `README.md` con instrucciones.
3. El repositorio tiene rama `main` y al menos un commit inicial.
4. No se publican secretos.

---

#### HU-20 Documentar y presentar la solución

- **Como** equipo
- **quiero** entregar SRS, UML, backlog y video
- **para** demostrar el análisis y la arquitectura.

**Prioridad:** Must | **Estimación:** 3 | **Estado:** Hecho (documentos) / Pendiente (video)

**Criterios de aceptación:**

1. SRS completo en `docs/SRS.md`.
2. UML de casos de uso, componentes y despliegue en `docs/UML.md`.
3. Backlog en `docs/BACKLOG.md`.
4. Guion y video de presentación de 5 a 10 minutos.

---

## 5. Resumen del backlog por prioridad

| Prioridad | Historias | Puntos |
|---|---|---|
| Must | HU-01, HU-02, HU-03, HU-04, HU-05, HU-07, HU-08, HU-19, HU-20 | 19 |
| Should | HU-06, HU-09, HU-10, HU-13, HU-14 | 11 |
| Could | HU-11, HU-12, HU-15, HU-16, HU-17, HU-18 | 29 |
| Won't (esta versión) | Historial de auditoría, exportación a PDF/Excel, aplicación móvil nativa, multi-idioma | — |

---

## 6. Plan de iteraciones

### Sprint 0 - Preparación (completado)

- Análisis del proyecto existente.
- Configuración del entorno virtual.
- Documentación SRS, UML y backlog.
- Preparación de repositorio y README.

### Sprint 1 - MVP CRUD (completado)

- HU-01 Listar tareas.
- HU-02 Crear tarea.
- HU-03 Ver detalle.
- HU-04 Editar tarea.
- HU-05 Eliminar con confirmación.
- HU-06 Cambiar estado.
- HU-07 Validaciones.
- HU-08 CSRF.
- HU-09 Admin.
- Prueba automatizada del flujo CRUD.

### Sprint 2 - Organización y seguimiento (propuesto)

- HU-10 Filtro por estado.
- HU-13 Fechas de creación y actualización.
- HU-14 Fecha límite y prioridad.
- HU-11 Búsqueda.
- HU-12 Paginación.

### Sprint 3 - Seguridad y publicación (propuesto)

- HU-15 Autenticación.
- HU-16 Roles y propietario.
- Configuración de producción (DEBUG, SECRET_KEY, ALLOWED_HOSTS).
- Despliegue con Gunicorn y PostgreSQL.
- CI con GitHub Actions.

### Sprint 4 - Integraciones (propuesto)

- HU-17 API REST.
- HU-18 Notificaciones.
- Exportación e historial.

---

## 7. Definition of Ready (DoR)

Una historia está lista para desarrollo cuando:

1. Tiene formato "Como / Quiero / Para".
2. Tiene criterios de aceptación verificables.
3. Tiene prioridad y estimación.
4. Sus dependencias están identificadas.
5. El diseño de interfaz o contrato está claro.

## 8. Definition of Done (DoD)

Una historia está terminada cuando:

1. El código está implementado y cumple los criterios de aceptación.
2. Pasan las pruebas automatizadas (`python manage.py test`).
3. Se validó manualmente en el navegador.
4. No introduce errores de validación ni de seguridad evidentes.
5. El código está versionado en Git.
6. La documentación afectada está actualizada.

---

## 9. Plantilla de issue para GitHub

```markdown
## Historia de usuario
Como [rol], quiero [funcionalidad] para [beneficio].

## Criterios de aceptación
- [ ] ...
- [ ] ...

## Detalles técnicos
- Archivos afectados:
- Migraciones:
- Riesgos:

## Definition of Done
- [ ] Pruebas pasan
- [ ] Validación manual
- [ ] Documentación actualizada
```

### Etiquetas sugeridas

`epica`, `historia`, `bug`, `mejora`, `documentacion`, `prioridad-alta`, `prioridad-media`, `prioridad-baja`, `sprint-1`, `sprint-2`, `sprint-3`.
