from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Auth routes (public)
    path("api/auth/register/", views.register, name="register"),
    path("api/auth/login/", views.login, name="login"),
    path("api/auth/verify-otp/", views.verify_otp, name="verify_otp"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Protected routes (any authenticated user)
    path("api/auth/profile/", views.profile, name="profile"),

    # Admin-only routes (protected by RoleMiddleware + IsAuthenticated)
    path("api/admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),
]