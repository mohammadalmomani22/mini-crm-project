from config.settings.base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mini_crm',
        'USER': 'mini_crm_user',
        'PASSWORD': '123456',
        'HOST': 'db',
        'PORT': '5432',
    }
}