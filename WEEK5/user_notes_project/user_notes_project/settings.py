"""
Django settings for user_notes_project.

Production-ready configuration with:
- MySQL database backend
- JWT authentication via SimpleJWT
- bcrypt password hashing
- Environment variable driven secrets
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

# ===========================================
# BASE DIRECTORY
# ===========================================
BASE_DIR = Path(__file__).resolve().parent.parent

# ===========================================
# SECURITY SETTINGS (from .env)
# ===========================================
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ===========================================
# INSTALLED APPLICATIONS
# ===========================================
INSTALLED_APPS = [
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',                          # Django REST Framework
    'rest_framework_simplejwt',                # JWT authentication
    'rest_framework_simplejwt.token_blacklist', # Token blacklisting for logout
    'corsheaders',                             # CORS support

    # Local apps
    'accounts',                                # User registration & authentication
    'notes',                                   # Notes CRUD operations
]

# ===========================================
# MIDDLEWARE
# ===========================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',        # CORS middleware (must be before CommonMiddleware)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ===========================================
# URL CONFIGURATION
# ===========================================
ROOT_URLCONF = 'user_notes_project.urls'

# ===========================================
# TEMPLATES
# ===========================================
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

# ===========================================
# WSGI APPLICATION
# ===========================================
WSGI_APPLICATION = 'user_notes_project.wsgi.application'

# ===========================================
# DATABASE CONFIGURATION (MySQL)
# Credentials loaded from environment variables
# ===========================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='user_notes_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',                  # Full Unicode support
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",  # Strict SQL mode
        },
    }
}

# ===========================================
# PASSWORD HASHING
# bcrypt is the PRIMARY hasher for secure password storage.
# Django will automatically upgrade older hashes to bcrypt.
# ===========================================
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',  # Primary: bcrypt
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.ScryptPasswordHasher',
]

# ===========================================
# PASSWORD VALIDATORS
# ===========================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===========================================
# DJANGO REST FRAMEWORK CONFIGURATION
# - Default authentication: JWT Bearer tokens
# - Default permission: Authenticated users only
# ===========================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    # Consistent JSON error responses
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    # Optional: browsable API only in DEBUG mode
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
    ),
}

# Enable browsable API renderer in DEBUG mode for easier development
if DEBUG:
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    )
    REST_FRAMEWORK['DEFAULT_PARSER_CLASSES'] = (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    )

# ===========================================
# SIMPLE JWT CONFIGURATION
# - Access token expires in 30 minutes
# - Refresh token expires in 1 day
# - Token blacklisting enabled for logout
# ===========================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),    # Access token valid for 30 min
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),       # Refresh token valid for 1 day
    'ROTATE_REFRESH_TOKENS': True,                     # Issue new refresh on token refresh
    'BLACKLIST_AFTER_ROTATION': True,                  # Blacklist old refresh tokens
    'UPDATE_LAST_LOGIN': True,                         # Track last login timestamp

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,

    'AUTH_HEADER_TYPES': ('Bearer',),                  # Authorization: Bearer <token>
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',

    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
}

# ===========================================
# CORS SETTINGS
# ===========================================
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all in development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# ===========================================
# INTERNATIONALIZATION
# ===========================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ===========================================
# STATIC FILES
# ===========================================
STATIC_URL = 'static/'

# ===========================================
# DEFAULT PRIMARY KEY FIELD TYPE
# ===========================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
