# Diagrama de secuencia — Primera versión

Pegar cada bloque en https://mermaid.live y exportar como PNG para el SRS.

## 1. Registro e inicio de sesión

```mermaid
sequenceDiagram
    actor U as Usuario
    participant N as Navegador
    participant V as Vista registro (views.py)
    participant F as RegistroForm
    participant DB as Base de datos
    participant A as Auth de Django

    U->>N: Abre /registro/ y completa el formulario
    N->>V: POST /registro/ (usuario, contraseña x2)
    V->>F: is_valid()
    F-->>V: datos válidos
    V->>DB: Guarda el usuario
    V->>DB: Agrega el usuario al grupo Miembro
    V->>A: login(request, usuario)
    A-->>N: Crea la sesión (cookie)
    V-->>N: Redirige a /
    N-->>U: Muestra la lista de tareas
```

## 2. Crear una tarea (con control de permisos)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant N as Navegador
    participant D as Decoradores (login_required / permission_required)
    participant V as Vista crear_tarea
    participant F as TareaForm
    participant DB as Base de datos

    U->>N: Clic en "Crear tarea"
    N->>D: GET /tarea/nueva/
    alt Sin sesión
        D-->>N: Redirige a /login/
    else Sin permiso add_tarea
        D-->>N: 403 Prohibido
    else Con permiso
        D->>V: Continúa
        V-->>N: Formulario vacío
    end
    U->>N: Completa y envía
    N->>V: POST /tarea/nueva/
    V->>F: is_valid()
    F-->>V: válido
    V->>DB: INSERT Tarea
    V-->>N: Redirige a /
    N-->>U: Lista con la nueva tarea
```
