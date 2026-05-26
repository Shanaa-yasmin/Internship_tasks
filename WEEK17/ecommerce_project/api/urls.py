"""
api/urls.py — URL routing using DRF Routers.

All routes are prefixed with /api/ from the root urlconf.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet, RegisterView

# ── Router — auto-generates standard CRUD routes ─────────────────────────────
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products',   ProductViewSet,  basename='product')
router.register(r'cart',       CartViewSet,     basename='cart')

urlpatterns = [
    # User registration
    path('auth/register/', RegisterView.as_view(), name='register'),

    # All ViewSet routes
    path('', include(router.urls)),
]

# ─────────────────────────────────────────────────────────────────────────────
# Generated routes summary:
#
# Auth
#   POST   /api/auth/register/
#   POST   /api/auth/login/          (JWT — root urlconf)
#   POST   /api/auth/refresh/        (JWT — root urlconf)
#
# Categories
#   GET    /api/categories/
#   POST   /api/categories/
#   GET    /api/categories/stats/    ← custom action
#   GET    /api/categories/{id}/
#   PUT    /api/categories/{id}/
#   PATCH  /api/categories/{id}/
#   DELETE /api/categories/{id}/
#
# Products
#   GET    /api/products/            ?search= &category= &min_price= &max_price= &page=
#   POST   /api/products/
#   GET    /api/products/stats/      ← custom action
#   GET    /api/products/{id}/
#   GET    /api/products/{id}/related/ ← custom action
#   PUT    /api/products/{id}/
#   PATCH  /api/products/{id}/
#   DELETE /api/products/{id}/
#
# Cart
#   GET    /api/cart/
#   POST   /api/cart/
#   POST   /api/cart/add-item/       ← custom action
#   POST   /api/cart/remove-item/    ← custom action
#   GET    /api/cart/{id}/
#   DELETE /api/cart/{id}/
#   GET    /api/cart/{id}/total/     ← custom action
# ─────────────────────────────────────────────────────────────────────────────
