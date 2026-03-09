"""
URL configuration for the accounts app.

Routes:
- /register/       → User registration
- /login/          → JWT token obtain (access + refresh)
- /logout/         → Blacklist refresh token
- /token/refresh/  → Refresh access token
- /profile/        → Get current user profile
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    # User registration
    path('register/', views.RegisterView.as_view(), name='register'),

    # JWT Login — returns access & refresh tokens
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT Token Refresh — exchange refresh token for new access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Logout — blacklist refresh token
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # User profile — get current authenticated user info
    path('profile/', views.ProfileView.as_view(), name='profile'),
]
