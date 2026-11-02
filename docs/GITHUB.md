# Guía del repositorio GitHub

**Proyecto:** Gestor de Tareas de Equipo (`proyecto_tareas`)
**Repositorio sugerido:** `proyecto-tareas-django`
**Rama principal:** `main`

---

## 1. Estructura recomendada

```text
proyecto_tareas/
├── .gitignore
├── README.md
├── requirements.txt
├── manage.py
├── proyecto_tareas/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tareas/
│   ├── admin.py
│   ├── forms.py
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   ├── views.py
│   ├── migrations/
│   └── templates/tareas/
├── docs/
│   ├── SRS.md
│   ├── UML.md
│   ├── BACKLOG.md
│   ├── GITHUB.md
│   └── GUION_VIDEO.md
└── venv/               (ignorado por Git)
```

---

## 2. Crear el repositorio local

Desde la carpeta del proyecto:

```powershell
cd "C:\Users\danif\OneDrive - Fundación Universitaria para el Desarrollo Humano - UNINPAHU\Universidad\Python Django\proyecto_tareas"
git init
git branch -M main
git add .
git status
git commit -m "feat: MVP del gestor de tareas con documentacion SRS, UML y backlog"
```

> Antes de `git add .`, confirme que `.gitignore` existe y que `venv/` y `db.sqlite3` no se están incluyendo.

---

## 3. Crear el repositorio remoto en GitHub

### Opción A: con GitHub CLI (`gh`)

```powershell
gh auth login
gh repo create proyecto-tareas-django --public --source=. --remote=origin --push
```

### Opción B: desde la web

1. Entrar a https://github.com/new
2. Nombre: `proyecto-tareas-django`
3. Visibilidad: pública (o privada e invitar al docente)
4. No inicializar con README, `.gitignore` ni licencia, porque ya existen localmente.
5. Ejecutar:

```powershell
git remote add origin https://github.com/USUARIO/proyecto-tareas-django.git
git push -u origin main
```

Reemplace `USUARIO` por el usuario de GitHub.

---

## 4. Verificación de que no se publican secretos

Antes de cada push:

```powershell
git status
git ls-files | Select-String -Pattern "venv|db.sqlite3|\.env"
```

Si aparece `db.sqlite3` o `venv`, ejecutar:

```powershell
git rm -r --cached venv
git rm --cached db.sqlite3
git commit -m "chore: excluir entorno virtual y base de datos local"
```

**Nunca** suba `.env`, contraseñas, tokens ni la `SECRET_KEY` real.

---

## 5. Ramas y flujo de trabajo

```text
main        -> versión estable y entregable
develop     -> integración de cambios
feature/*   -> una historia de usuario por rama
fix/*       -> correcciones
docs/*      -> documentación
```

Ejemplo:

```powershell
git checkout -b feature/hu-10-filtro-estado
# desarrollar y probar
git add .
git commit -m "feat(tareas): filtro por estado (HU-10)"
git push -u origin feature/hu-10-filtro-estado
```

Luego abrir un Pull Request hacia `develop` o `main`, con revisión de al menos un integrante.

---

## 6. Convención de commits (Conventional Commits)

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de error |
| `docs:` | Documentación |
| `test:` | Pruebas |
| `refactor:` | Reestructuración sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `style:` | Formato sin cambios lógicos |

Ejemplos:

```text
feat(tareas): agregar filtro por estado
fix(tareas): validar titulo vacio en el formulario
docs(srs): completar requisitos no funcionales
test(tareas): cubrir cancelacion de eliminacion
chore(repo): agregar requirements y gitignore
```

---

## 7. Etiquetas e issues

Crear las etiquetas:

- `epica`
- `historia`
- `bug`
- `mejora`
- `documentacion`
- `prioridad-alta`
- `prioridad-media`
- `prioridad-baja`
- `sprint-1`
- `sprint-2`
- `sprint-3`

Crear un issue por cada historia del backlog (`docs/BACKLOG.md`). Título sugerido:

```text
[HU-01] Listar tareas
[HU-02] Crear tarea
[HU-10] Filtrar tareas por estado
```

En el cuerpo del issue, copiar la historia y sus criterios de aceptación.

---

## 8. Tablero Kanban

Crear un GitHub Project con columnas:

```text
Backlog | Por hacer | En progreso | En revisión | Hecho
```

Reglas sugeridas:

1. Una historia no entra a "En progreso" si no cumple el DoR.
2. Una historia pasa a "Hecho" solo si cumple el DoD.
3. Cada Pull Request debe referenciar su issue con `Closes #N`.

---

## 9. Protección de la rama `main`

En GitHub: **Settings → Branches → Add branch protection rule**

- Patrón: `main`
- Exigir Pull Request antes de fusionar.
- Exigir al menos una aprobación.
- Exigir que pasen las verificaciones de estado.
- Impedir push directo.

---

## 10. GitHub Actions (opcional pero recomendado)

Crear `.github/workflows/django.yml`:

```yaml
name: Django CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.14"
      - name: Instalar dependencias
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Ejecutar pruebas
        run: python manage.py test
      - name: Verificar migraciones
        run: python manage.py makemigrations --check --dry-run
```

---

## 11. Release de la entrega

```powershell
git tag -a v1.0.0 -m "Entrega MVP: SRS, UML, backlog y CRUD de tareas"
git push origin v1.0.0
```

En GitHub: **Releases → Draft a new release → v1.0.0**, adjuntar:

- PDF del SRS.
- Exportación de los diagramas UML (PNG/SVG).
- Enlace al video.
- ZIP del proyecto sin `venv` ni `db.sqlite3`.

---

## 12. README del repositorio

Debe incluir como mínimo:

1. Nombre y descripción del proyecto.
2. Integrantes.
3. Problema y solución en dos párrafos.
4. Tecnologías.
5. Requisitos previos.
6. Instalación y ejecución.
7. Pruebas.
8. Estructura del proyecto.
9. Enlaces a SRS, UML, backlog y video.
10. Licencia o uso académico.

El archivo `README.md` de la raíz ya incluye esta información.

---

## 13. Checklist de publicación

- [ ] `.gitignore` configurado.
- [ ] `requirements.txt` con las versiones reales.
- [ ] `README.md` completo.
- [ ] Documentos de `docs/` incluidos.
- [ ] Sin `venv`, `db.sqlite3`, `.env` ni `__pycache__` en el repositorio.
- [ ] Repositorio creado y rama `main` publicada.
- [ ] Issues del backlog creados.
- [ ] Tablero Kanban configurado.
- [ ] Video enlazado en el README.
- [ ] Release `v1.0.0` creada.
- [ ] Docente invitado como colaborador (si el repositorio es privado).
