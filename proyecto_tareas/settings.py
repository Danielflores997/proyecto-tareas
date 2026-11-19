import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'clave-de-desarrollo-no-usar-en-produccion')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if host.strip()
]

# Render provides the public hostname and URL automatically at runtime.
render_hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin.strip()
]
render_external_url = os.environ.get('RENDER_EXTERNAL_URL')
if render_external_url and render_external_url not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(render_external_url)

# Render terminates HTTPS at its proxy and forwards the original scheme.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'tareas',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'proyecto_tareas.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'proyecto_tareas.wsgi.application'

if os.environ.get('DATABASE_URL'):
    import dj_database_url

    DATABASES = {
        'default': dj_database_url.parse(
            os.environ['DATABASE_URL'],
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Local development and Docker Compose continue using SQLite.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.environ.get('SQLITE_PATH', BASE_DIR / 'db.sqlite3'),
        }
    }

LANGUAGE_CODE = 'es'

TIME_ZONE = 'America/Bogota'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
 


LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'lista_tareas'
LOGOUT_REDIRECT_URL = 'login'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

NODE_SERVICE_URL = os.environ.get('NODE_SERVICE_URL', 'http://localhost:3000').rstrip('/')
NODE_SERVICE_API_KEY = os.environ.get('NODE_SERVICE_API_KEY', '')
NODE_SERVICE_TIMEOUT = float(os.environ.get('NODE_SERVICE_TIMEOUT', '60'))