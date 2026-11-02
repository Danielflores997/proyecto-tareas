# Diagramas UML iniciales

**Proyecto:** Gestor de Tareas de Equipo (`proyecto_tareas`)
**Versión:** 1.0
**Herramienta:** Mermaid (se visualiza en GitHub, GitLab, Obsidian, VS Code y https://mermaid.live)

Los diagramas describen el MVP actual y marcan con notas la evolución prevista. Cada diagrama se acompaña de una breve explicación para la sustentación.

---

## 1. Diagrama de casos de uso

### 1.1 Diagrama

```mermaid
flowchart LR
    U(["Usuario del equipo"])
    A(["Administrador"])

    subgraph SISTEMA["Sistema: Gestor de Tareas"]
        UC01(("UC-01<br/>Listar tareas"))
        UC02(("UC-02<br/>Crear tarea"))
        UC03(("UC-03<br/>Ver detalle"))
        UC04(("UC-04<br/>Editar tarea"))
        UC05(("UC-05<br/>Eliminar tarea"))
        UC06(("UC-06<br/>Cambiar estado"))
        UC07(("UC-07<br/>Validar formulario"))
        UC08(("UC-08<br/>Administrar tareas"))
        UC09(("UC-09<br/>Confirmar eliminación"))
    end

    U --> UC01
    U --> UC02
    U --> UC03
    U --> UC04
    U --> UC05
    U --> UC06
    A --> UC08

    UC02 -.->|"«include»"| UC07
    UC04 -.->|"«include»"| UC07
    UC05 -.->|"«include»"| UC09
    UC06 -.->|"«extend»"| UC04
    UC08 -.->|"«include»"| UC01
```

### 1.2 Explicación

- El **Usuario del equipo** es el actor principal y ejecuta las operaciones CRUD.
- El **Administrador** usa el panel de Django para supervisar y depurar datos.
- **UC-07 Validar formulario** es incluido por crear y editar: no existe como pantalla independiente, pero es obligatorio en ambos flujos.
- **UC-09 Confirmar eliminación** es incluido por eliminar: protege contra borrados accidentales.
- **UC-06 Cambiar estado** extiende la edición, porque en el MVP se realiza desde el mismo formulario.
- **UC-08 Administrar tareas** incluye la consulta de tareas desde el admin.

### 1.3 Actores y correspondencia con el código

| Caso de uso | Vista / componente |
|---|---|
| UC-01 Listar | `tareas.views.lista_tareas` → `lista.html` |
| UC-02 Crear | `tareas.views.crear_tarea` → `formulario.html` |
| UC-03 Ver detalle | `tareas.views.detalle_tarea` → `detalle.html` |
| UC-04 Editar | `tareas.views.editar_tarea` → `formulario.html` |
| UC-05 Eliminar | `tareas.views.eliminar_tarea` → `confirmar_eliminacion.html` |
| UC-06 Cambiar estado | `TareaForm` + `Tarea.ESTADOS` |
| UC-07 Validar | `TareaForm` |
| UC-08 Administrar | `tareas.admin` |
| UC-09 Confirmar | `confirmar_eliminacion.html` + `POST` |

---

## 2. Diagrama de clases

### 2.1 Diagrama

```mermaid
classDiagram
    class Tarea {
        +BigAutoField id
        +CharField titulo
        +TextField descripcion
        +CharField responsable
        +CharField estado
        +ESTADOS: list
        +__str__() str
    }

    class TareaForm {
        +Meta model
        +Meta fields
    }

    class TareaAdmin {
        +registrar(Tarea)
    }

    TareaForm ..> Tarea : valida y guarda
    TareaAdmin ..> Tarea : administra
```

### 2.2 Explicación

- `Tarea` es la única entidad persistente del MVP.
- `TareaForm` es un `ModelForm` que valida y persiste instancias de `Tarea`.
- `TareaAdmin` representa el registro del modelo en Django Admin.
- `ESTADOS` es una lista de tuplas que restringe los valores posibles.

### 2.3 Atributos y restricciones

| Atributo | Tipo | Restricción |
|---|---|---|
| `id` | BigAutoField | Clave primaria |
| `titulo` | CharField | Máximo 100, obligatorio |
| `descripcion` | TextField | Obligatorio |
| `responsable` | CharField | Máximo 50, obligatorio |
| `estado` | CharField | 20 caracteres, opciones cerradas, por defecto `pendiente` |

---

## 3. Diagrama de componentes

### 3.1 Diagrama

```mermaid
flowchart TB
    subgraph CLIENTE["Cliente"]
        NAV["Navegador web<br/>HTML5"]
    end

    subgraph DJANGO["Aplicación Django (monolito MVT)"]
        subgraph CONFIG["proyecto_tareas"]
            SET["settings.py"]
            URLR["urls.py"]
            WSGI["wsgi.py"]
        end

        subgraph APP["Aplicación tareas"]
            URLT["tareas/urls.py<br/>Enrutamiento"]
            VIEWS["tareas/views.py<br/>Vistas CRUD"]
            FORMS["tareas/forms.py<br/>TareaForm"]
            MODELS["tareas/models.py<br/>Tarea"]
            ADMIN["tareas/admin.py<br/>Django Admin"]
            TEMPL["Plantillas HTML<br/>lista / detalle / formulario / confirmar"]
        end
    end

    subgraph DATOS["Persistencia"]
        SQLITE[("SQLite<br/>db.sqlite3")]
    end

    NAV -->|"HTTP"| URLR
    URLR --> URLT
    URLT --> VIEWS
    VIEWS --> FORMS
    VIEWS --> MODELS
    VIEWS --> TEMPL
    TEMPL --> NAV
    ADMIN --> MODELS
    MODELS -->|"ORM"| SQLITE

    SET -.-> URLR
    SET -.-> MODELS
    WSGI -.-> URLR
```

### 3.2 Explicación

- El navegador consume HTML generado por las plantillas.
- `proyecto_tareas.urls` incluye `tareas.urls` y monta el admin.
- Las vistas orquestan formularios, modelos y plantillas.
- El ORM de Django aísla el acceso a SQLite.
- `settings.py` provee configuración transversal; `wsgi.py` es el punto de entrada para servidores de producción.

### 3.3 Responsabilidades

| Componente | Responsabilidad | Archivo |
|---|---|---|
| Configuración | Ajustes, apps, middleware, base de datos | `proyecto_tareas/settings.py` |
| Rutas raíz | Admin y delegación a la app | `proyecto_tareas/urls.py` |
| Rutas de tareas | Mapa URL → vista | `tareas/urls.py` |
| Vistas | Lógica de los casos de uso | `tareas/views.py` |
| Formularios | Validación y renderizado | `tareas/forms.py` |
| Modelo | Entidad y reglas de estado | `tareas/models.py` |
| Admin | Gestión administrativa | `tareas/admin.py` |
| Plantillas | Presentación HTML | `tareas/templates/tareas/` |
| Persistencia | Almacenamiento relacional | `db.sqlite3` |

---

## 4. Diagrama de despliegue

### 4.1 Entorno actual de desarrollo

```mermaid
flowchart LR
    subgraph DEV["Entorno de desarrollo local"]
        DEVPC["Equipo del desarrollador<br/>Windows / Linux / macOS"]
        subgraph RUNTIME["Runtime"]
            PY["Python 3.14.3"]
            VENV["venv"]
            DJ["Django 6.1.1<br/>runserver :8000"]
        end
        BROWSER["Navegador web"]
        DB[("SQLite<br/>db.sqlite3")]
    end

    BROWSER -->|"http://127.0.0.1:8000"| DJ
    DEVPC --> PY
    PY --> VENV
    VENV --> DJ
    DJ -->|"ORM"| DB
```

### 4.2 Despliegue propuesto a futuro

```mermaid
flowchart TB
    subgraph CLIENTE["Cliente"]
        B["Navegador web"]
    end

    subgraph GITHUB["GitHub"]
        REPO["Repositorio<br/>proyecto-tareas-django"]
        ACT["GitHub Actions<br/>pruebas automáticas"]
    end

    subgraph PROD["Servidor de producción"]
        NGX["Nginx<br/>reverse proxy / HTTPS"]
        GUN["Gunicorn<br/>WSGI"]
        APP["Django<br/>DEBUG=False"]
        ENV["Variables de entorno<br/>SECRET_KEY, DATABASE_URL"]
    end

    subgraph DATA["Datos"]
        PG[("PostgreSQL")]
        MEDIA[("Almacenamiento de estáticos")]
    end

    B -->|"HTTPS"| NGX
    NGX --> GUN
    GUN --> APP
    APP --> PG
    APP --> MEDIA
    ENV -.-> APP
    REPO --> ACT
    ACT -->|"deploy"| PROD
```

### 4.3 Explicación

- **Ahora:** todo corre en el equipo del desarrollador; el navegador se conecta al servidor de desarrollo y SQLite almacena los datos en un archivo local.
- **Futuro:** el código se publica en GitHub, las pruebas se ejecutan en Actions y el despliegue usa Gunicorn detrás de Nginx, con PostgreSQL y secretos en variables de entorno.
- La migración de SQLite a PostgreSQL no requiere cambios en las vistas, gracias al ORM.

### 4.4 Nodos y artefactos

| Nodo | Artefactos |
|---|---|
| Equipo del desarrollador | Código fuente, `venv`, `db.sqlite3` |
| Navegador | HTML, CSS, formularios |
| Servidor Django (dev) | `manage.py`, app `tareas`, plantillas |
| GitHub | Repositorio, issues, pull requests, Actions |
| Servidor de producción (futuro) | Nginx, Gunicorn, Django, variables de entorno |
| Base de datos (futuro) | PostgreSQL |

---

## 5. Diagrama de secuencia: crear tarea

```mermaid
sequenceDiagram
    actor U as Usuario
    participant B as Navegador
    participant URL as tareas.urls
    participant V as crear_tarea
    participant F as TareaForm
    participant M as Tarea
    participant DB as SQLite

    U->>B: Selecciona "Crear tarea"
    B->>URL: GET /tarea/nueva/
    URL->>V: crear_tarea(request)
    V->>F: TareaForm()
    F-->>V: formulario vacío
    V-->>B: formulario.html
    B-->>U: Muestra formulario

    U->>B: Ingresa datos y guarda
    B->>URL: POST /tarea/nueva/
    URL->>V: crear_tarea(request)
    V->>F: TareaForm(request.POST)
    V->>F: is_valid()
    alt Datos válidos
        F->>M: save()
        M->>DB: INSERT
        V-->>B: redirect(lista_tareas)
        B-->>U: Lista actualizada
    else Datos inválidos
        F-->>V: errores
        V-->>B: formulario.html con errores
        B-->>U: Mensajes de validación
    end
```

---

## 6. Diagrama de secuencia: editar y eliminar

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as Vistas
    participant M as Tarea
    participant DB as SQLite

    Note over U,DB: Editar
    U->>V: GET /tarea/1/editar/
    V->>M: get_object_or_404(pk=1)
    M->>DB: SELECT
    DB-->>M: registro
    V-->>U: formulario precargado
    U->>V: POST datos actualizados
    V->>M: save()
    M->>DB: UPDATE
    V-->>U: redirect(detalle)

    Note over U,DB: Eliminar
    U->>V: GET /tarea/1/eliminar/
    V->>M: get_object_or_404(pk=1)
    V-->>U: confirmación
    U->>V: POST confirmar
    V->>M: delete()
    M->>DB: DELETE
    V-->>U: redirect(lista)
```

---

## 7. Diagrama de estados de una tarea

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Crear tarea (estado por defecto)
    Pendiente --> EnProceso: Editar estado
    EnProceso --> Completada: Editar estado
    EnProceso --> Pendiente: Reabrir / corregir
    Completada --> EnProceso: Reabrir
    Pendiente --> Completada: Cerrar directamente
    Pendiente --> [*]: Eliminar
    EnProceso --> [*]: Eliminar
    Completada --> [*]: Eliminar
```

### 7.1 Explicación

Los tres estados están definidos en `Tarea.ESTADOS`. El modelo no impone un orden estricto de transición: cualquier estado puede cambiarse a cualquier otro mediante la edición. El diagrama representa las transiciones recomendadas, no una restricción técnica.

---

## 8. Diagrama de arquitectura en capas

```mermaid
flowchart TB
    P["Presentación<br/>Plantillas HTML + navegador"]
    A["Aplicación<br/>Vistas + formularios + URLs"]
    D["Dominio<br/>Modelo Tarea + reglas"]
    R["Persistencia<br/>ORM Django"]
    DB[("SQLite")]
    AD["Administración<br/>Django Admin"]

    P --> A
    A --> D
    D --> R
    R --> DB
    AD --> D
```

---

## 9. Resumen para la sustentación

1. **Casos de uso:** el usuario gestiona tareas; el administrador supervisa.
2. **Componentes:** monolito Django con separación MVT y app `tareas`.
3. **Despliegue:** hoy local con SQLite; futuro en GitHub + Nginx + Gunicorn + PostgreSQL.
4. **Clases:** una entidad `Tarea` y un `ModelForm`.
5. **Secuencia:** las vistas coordinan validación, persistencia y renderizado.
6. **Estados:** pendiente, en proceso y completada.

> Para exportar los diagramas: abra este archivo en VS Code con la extensión Mermaid, o pegue cada bloque en https://mermaid.live y descargue PNG/SVG.
