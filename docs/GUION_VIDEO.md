# Guion del video de presentación

**Duración objetivo:** 7 a 10 minutos
**Formato:** grabación de pantalla con voz en off (o cámara opcional)
**Herramientas sugeridas:** OBS Studio, Loom, PowerPoint/Canva para las diapositivas y el navegador para la demo.

---

## 1. Preparación previa a la grabación

### 1.1 Verificar el proyecto

```bash
cd "C:\Users\danif\OneDrive - Fundación Universitaria para el Desarrollo Humano - UNINPAHU\Universidad\Python Django\proyecto_tareas"
venv\Scripts\activate
python manage.py test
python manage.py runserver
```

### 1.2 Verificar el navegador

- Abrir `http://127.0.0.1:8000/` y confirmar que carga.
- Tener a mano `http://127.0.0.1:8000/admin/` con un superusuario.
- Tener creadas al menos tres tareas de ejemplo con estados distintos.
- Cerrar pestañas y notificaciones que distraigan.

### 1.3 Diapositivas mínimas

1. Portada: nombre del proyecto, integrantes, institución y fecha.
2. Problema identificado.
3. Justificación.
4. Objetivos.
5. Alcance.
6. Tecnologías.
7. Arquitectura y UML (casos de uso, componentes, despliegue).
8. Backlog y metodología.
9. Demostración en vivo.
10. Conclusiones y trabajo futuro.

---

## 2. Guion escena por escena

### Escena 1 - Portada (0:00 - 0:30)

**En pantalla:** diapositiva de portada.

**Narración:**

> "Buenos días. Somos el equipo del proyecto Gestor de Tareas de Equipo, desarrollado para la Fundación Universitaria para el Desarrollo Humano, UNINPAHU. En este video presentamos el problema que resolvemos, la solución propuesta, la arquitectura, el backlog y una demostración funcional de la aplicación."

---

### Escena 2 - Problema identificado (0:30 - 1:30)

**En pantalla:** diapositiva con el problema y ejemplos.

**Narración:**

> "El problema lo tienen los pequeños equipos académicos y de trabajo que coordinan sus actividades por WhatsApp, correo, papel o hojas de cálculo. En la práctica, las tareas se dispersan, no queda claro quién es el responsable, se duplica trabajo y el líder no tiene una visión actualizada del avance.
>
> Hoy el seguimiento se ve así: mensajes que se pierden, listas desactualizadas y reuniones para preguntar en qué va cada cosa. Vale la pena resolverlo porque centralizar la información reduce el tiempo de coordinación, mejora la rendición de cuentas y evita errores por olvido o duplicidad."

**Apoyo visual:** captura de un chat desordenado (sin datos personales) y una hoja de cálculo desactualizada.

---

### Escena 3 - Justificación (1:30 - 2:10)

**Narración:**

> "Justificamos la solución por tres razones. Primero, el equipo ya usa herramientas digitales, pero no un sistema dedicado. Segundo, el alcance CRUD es suficiente para entregar valor rápido y es ampliable. Tercero, Django ofrece seguridad, ORM y administración integrados, lo que reduce el esfuerzo de desarrollo y facilita la evolución."

---

### Escena 4 - Objetivos (2:10 - 2:50)

**En pantalla:** objetivos general y específicos.

**Narración:**

> "El objetivo general es desarrollar una aplicación web que centralice la gestión de tareas de un equipo. Los objetivos específicos son: registrar tareas con responsable y estado; consultar y actualizar su información; eliminar tareas con confirmación; validar los datos; y documentar la solución con SRS, UML y backlog para facilitar su mantenimiento y despliegue."

---

### Escena 5 - Alcance (2:50 - 3:30)

**Narración:**

> "El alcance del MVP incluye cinco operaciones: listar, crear, ver detalle, editar y eliminar tareas, además de la administración desde Django Admin y las validaciones de formulario. Quedan fuera de esta versión la autenticación, las fechas límite, las prioridades, los filtros avanzados, las notificaciones y la API REST; todas están registradas en el backlog como evolución."

---

### Escena 6 - Tecnologías (3:30 - 4:10)

**En pantalla:** tabla de tecnologías.

**Narración:**

> "Usamos Python 3.14 y Django 6.1.1 con el patrón MVT. La persistencia es SQLite, incluida en Python, lo que permite ejecutar el proyecto sin instalar un motor adicional. Las plantillas son HTML con el motor de Django, la validación se hace con ModelForm y el control de versiones con Git y GitHub. Para producción se propone PostgreSQL, Gunicorn y Nginx."

---

### Escena 7 - Arquitectura y UML (4:10 - 5:40)

**En pantalla:** diagramas de `docs/UML.md`.

**Narración:**

> "La arquitectura es un monolito Django en capas. El navegador envía peticiones HTTP; el URLconf las dirige a las vistas; las vistas usan formularios y el modelo Tarea; el ORM persiste en SQLite; y las plantillas generan el HTML.
>
> En el diagrama de casos de uso, el usuario gestiona tareas y el administrador supervisa desde el panel. Crear y editar incluyen la validación; eliminar incluye la confirmación.
>
> En el diagrama de componentes se ve la separación entre configuración, rutas, vistas, formularios, modelo, admin y plantillas.
>
> En el despliegue actual todo corre localmente. La propuesta futura publica el repositorio en GitHub, ejecuta pruebas con Actions y despliega Gunicorn detrás de Nginx con PostgreSQL y variables de entorno."

---

### Escena 8 - Backlog (5:40 - 6:20)

**Narración:**

> "El backlog está priorizado con MoSCoW. Las historias Must del MVP son listar, crear, ver, editar, eliminar con confirmación, validar, proteger con CSRF, publicar el repositorio y documentar. Las Should incluyen filtros, fechas y prioridades. Las Could incluyen autenticación, API y notificaciones. Cada historia tiene criterios de aceptación y una definición de terminado."

---

### Escena 9 - Demostración en vivo (6:20 - 8:40)

**En pantalla:** navegador en `http://127.0.0.1:8000/`.

**Pasos y narración:**

1. **Lista inicial (6:20)**
   > "Esta es la pantalla principal. Vemos las tareas con su responsable y estado, y el enlace para crear una nueva."

2. **Crear tarea (6:35)**
   - Clic en "Crear tarea".
   - Completar: título "Preparar exposición final", descripción "Diseñar diapositivas y ensayar", responsable "Ana", estado "Pendiente".
   - Clic en "Guardar".
   > "Al guardar, el sistema valida, persiste en SQLite y redirige a la lista. La tarea ya aparece."

3. **Demostrar validación (7:05)**
   - Clic en "Crear tarea" y guardar con el título vacío.
   > "Si faltan campos obligatorios, Django muestra los errores y no guarda nada."

4. **Ver detalle (7:20)**
   - Clic en la tarea creada.
   > "El detalle muestra toda la información y las acciones disponibles."

5. **Editar y cambiar estado (7:35)**
   - Clic en "Editar tarea".
   - Cambiar estado a "En proceso" y el título a "Preparar exposición final - revisada".
   - Guardar.
   > "El cambio se guarda y volvemos al detalle con la información actualizada."

6. **Eliminar con confirmación (8:00)**
   - Clic en "Eliminar tarea".
   > "El sistema pide confirmación antes de borrar."
   - Clic en "Cancelar" y luego repetir para confirmar con "Sí, eliminar".
   > "Al confirmar, la tarea se elimina y volvemos a la lista."

7. **Administración (8:20)**
   - Abrir `/admin/` e iniciar sesión.
   > "El administrador puede gestionar las tareas desde el panel de Django."

---

### Escena 10 - Pruebas y calidad (8:40 - 9:05)

**En pantalla:** terminal con `python manage.py test`.

**Narración:**

> "El proyecto incluye una prueba automatizada que recorre el flujo completo: listar, crear, ver, editar y eliminar. La ejecución confirma que las operaciones principales funcionan y que la eliminación es efectiva."

---

### Escena 11 - Conclusiones y trabajo futuro (9:05 - 9:40)

**Narración:**

> "En conclusión, entregamos un MVP funcional que centraliza las tareas del equipo, con una arquitectura clara, documentación completa y una base extensible. Como trabajo futuro proponemos autenticación y roles, fechas y prioridades, filtros y búsqueda, API REST, notificaciones y despliegue en producción con PostgreSQL. Gracias por su atención."

---

## 3. Checklist de grabación

- [ ] Diapositivas listas y sin errores ortográficos.
- [ ] Proyecto ejecutándose y base de datos con datos de ejemplo.
- [ ] Audio claro, sin ruido de fondo.
- [ ] Resolución 1920x1080 o 1280x720.
- [ ] Cursor visible y movimientos pausados.
- [ ] Duración entre 7 y 10 minutos.
- [ ] Se muestran SRS, UML, backlog y demo.
- [ ] Se mencionan problema, justificación, objetivos, alcance y tecnologías.
- [ ] Se muestra el repositorio en GitHub.
- [ ] Video subido a YouTube (no listado) o Drive con permiso de lectura.
- [ ] Enlace del video incluido en el README.

---

## 4. Plan B si falla la demo

1. Tener capturas de cada pantalla en una carpeta.
2. Tener un video corto pregrabado del flujo CRUD.
3. Reiniciar el servidor y verificar que la base de datos existe.
4. Si el puerto 8000 está ocupado, ejecutar `python manage.py runserver 8001`.
5. Si falla SQLite, ejecutar `python manage.py migrate` y volver a crear datos.

---

## 5. Texto para la descripción del video

```text
Gestor de Tareas de Equipo - Proyecto Django
Fundación Universitaria para el Desarrollo Humano - UNINPAHU

Aplicación web para registrar, consultar, editar y eliminar tareas de un equipo.
Incluye documento SRS, diagramas UML, backlog inicial y demostración funcional.

Tecnologías: Python 3.14, Django 6.1.1, SQLite, HTML, Git y GitHub.
Repositorio: [enlace]
```
