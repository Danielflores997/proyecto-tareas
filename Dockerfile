FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

# Render uses port 10000 by default; Docker Compose overrides this to 8000.
EXPOSE 10000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py crear_roles && exec gunicorn proyecto_tareas.wsgi:application --bind 0.0.0.0:${PORT:-10000}"]
