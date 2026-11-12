# Despliegue en Render (paso a paso)

Este proyecto queda preparado para un Render Blueprint con Docker y PostgreSQL.

## Antes de subir a GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube el CONTENIDO de esta carpeta a la raiz del repositorio (Dockerfile, manage.py, render.yaml, requirements.txt y carpetas del proyecto). No subas el archivo ZIP ni una carpeta contenedora adicional.
3. No subas `db.sqlite3`, claves, contrasenas ni archivos `.env`. El `.gitignore` y `.dockerignore` ya excluyen la base SQLite local.

## Desplegar con Render Blueprint

1. Entra en https://dashboard.render.com/ y conecta tu cuenta de GitHub.
2. Abre Blueprints y selecciona **New Blueprint Instance**.
3. Elige el repositorio que acabas de subir.
4. Revisa los recursos que Render va a crear: un servicio web Docker gratuito y una base de datos PostgreSQL gratuita.
5. Pulsa **Apply**. Render construira la imagen, ejecutara las migraciones, creara los grupos Miembro y Administrador y arrancara Gunicorn.
6. Cuando el deploy termine como **Live**, abre la URL `*.onrender.com` que aparece en el servicio.

El archivo `settings.py` agrega automaticamente el hostname y la URL que Render asigna, y usa PostgreSQL cuando existe `DATABASE_URL`. En desarrollo local, sin esa variable, conserva SQLite.

## Pruebas despues del deploy

1. Abre la URL publica y registra un usuario nuevo.
2. Inicia sesion y crea, consulta y edita una tarea.
3. Comprueba los permisos del rol Miembro y del rol Administrador con usuarios preparados para la demostracion.
4. Verifica tambien el inicio de sesion y el cierre de sesion.

## Importante sobre el plan gratuito

- El servicio web gratuito se suspende tras 15 minutos sin trafico y puede tardar cerca de un minuto en volver a responder.
- El sistema utiliza PostgreSQL en Render, no el SQLite local. La base de datos gratuita de Render tiene un limite de 30 dias y 1 GB; guarda una copia de los datos que necesites antes de que expire.
- La carpeta de archivos del servicio gratuito es efimera. No guardes datos de la aplicacion en archivos locales del servidor.
- El plan gratuito es adecuado para una demostracion academica, no para produccion.

## Docker local

Para ejecutar localmente con SQLite:

```bash
docker compose up --build -d
```

Abre `http://localhost:8000`.
