# Comandos de Docker (ejecución local)

```bash
# Primera vez, o cada vez que se cambie código
docker compose up --build -d

# Uso normal
docker compose up -d

# Ver estado y logs
docker compose ps
docker compose logs --tail=100 web

# Crear superusuario para /admin
docker compose exec web python manage.py createsuperuser

# Detener
docker compose down
```

La aplicación queda en http://localhost:8000. Los datos de SQLite se guardan en el volumen `tareas_data`.
