"""
api/urls.py — URL routing using DRF Routers.

All routes are prefixed with /api/ from the root urlconf.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet, RegisterView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products',   ProductViewSet,  basename='product')
router.register(r'cart',       CartViewSet,     basename='cart')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]

# ─────────────────────────────────────────────────────────────────────────────
# Generated routes summary (image routes are NEW ↓):
#
# Auth
#   POST   /api/auth/register/
#   POST   /api/auth/login/
#   POST   /api/auth/refresh/
#
# Categories
#   GET    /api/categories/
#   POST   /api/categories/
#   GET    /api/categories/stats/
#   GET    /api/categories/{id}/
#   PUT    /api/categories/{id}/
#   PATCH  /api/categories/{id}/
#   DELETE /api/categories/{id}/
#
# Products
#   GET    /api/products/
#   POST   /api/products/
#   GET    /api/products/stats/
#   GET    /api/products/{id}/
#   GET    /api/products/{id}/related/
#   PUT    /api/products/{id}/
#   PATCH  /api/products/{id}/
#   DELETE /api/products/{id}/
#
#   ── Image Management (NEW) ─────────────────────────────────────────────────
#   POST   /api/products/{id}/upload-images/      multipart, field: images[]
#   GET    /api/products/{id}/images/             list all images + thumbnails
#   DELETE /api/products/{id}/images/{img_id}/   delete one image
#   PATCH  /api/products/{id}/set-primary-image/  body: { image_id }
#   PATCH  /api/products/{id}/reorder-images/     body: { order: [id, id, …] }
#
# Cart
#   GET    /api/cart/
#   POST   /api/cart/
#   POST   /api/cart/add-item/
#   POST   /api/cart/remove-item/
#   GET    /api/cart/{id}/
#   DELETE /api/cart/{id}/
#   GET    /api/cart/{id}/total/
# ─────────────────────────────────────────────────────────────────────────────