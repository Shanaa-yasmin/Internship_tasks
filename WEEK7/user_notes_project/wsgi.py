"""
WSGI config for user_notes_project project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_notes_project.settings')
application = get_wsgi_application()
