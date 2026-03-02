"""
Root URL configuration for user_notes_project.

API Endpoints:
- /api/accounts/  → Authentication (register, login, logout, token refresh, profile)
- /api/notes/     → Notes CRUD (list, create, retrieve, update, delete)
- /admin/         → Django admin panel
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    """Root endpoint — provides API overview."""
    return JsonResponse({
        "message": "Welcome to the User Notes API",
        "version": "1.0.0",
        "endpoints": {
            "accounts": {
                "register": "POST /api/accounts/register/",
                "login": "POST /api/accounts/login/",
                "logout": "POST /api/accounts/logout/",
                "token_refresh": "POST /api/accounts/token/refresh/",
                "profile": "GET /api/accounts/profile/",
            },
            "notes": {
                "list_create": "GET/POST /api/notes/",
                "detail": "GET/PUT/PATCH/DELETE /api/notes/{id}/",
            }
        }
    })


urlpatterns = [
    # API root — overview of all endpoints
    path('', api_root, name='api-root'),

    # Django admin panel
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/accounts/', include('accounts.urls')),

    # Notes CRUD endpoints
    path('api/notes/', include('notes.urls')),
]
