FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

# Render usa el puerto 10000 por defecto; Docker Compose lo cambia a 8000.
EXPOSE 10000

# Al iniciar: migraciones -> roles -> (opcional) superusuario -> Gunicorn.
# El superusuario solo se crea si existe DJANGO_SUPERUSER_USERNAME
# (junto con DJANGO_SUPERUSER_PASSWORD y DJANGO_SUPERUSER_EMAIL).
# Si ya existe, el error se ignora y el arranque continua.
# --timeout 120: la llamada a la IA puede tardar si el microservicio gratuito esta despertando.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py crear_roles && ([ -z \"$DJANGO_SUPERUSER_USERNAME\" ] || python manage.py createsuperuser --noinput || true) && exec gunicorn proyecto_tareas.wsgi:application --bind 0.0.0.0:${PORT:-10000} --timeout 120"]
