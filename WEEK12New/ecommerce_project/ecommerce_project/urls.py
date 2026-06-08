"""
ecommerce_project/urls.py — Root URL configuration.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static           # ← NEW: serve media in dev
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/auth/login/',   TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),

    # App routes
    path('api/', include('api.urls')),
]

# ── Serve uploaded media files in development ─────────────────────────────────
# In production, delegate this to Nginx / S3 / CDN.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)