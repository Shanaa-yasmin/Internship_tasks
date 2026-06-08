"""
views.py — API Views for the E-Commerce Backend.

ViewSets:
  CategoryViewSet  — CRUD + stats
  ProductViewSet   — CRUD + search/filter/pagination + stats + image upload  ← UPDATED
  CartViewSet      — CRUD + add-item / remove-item + total

Extra:
  RegisterView     — POST /api/auth/register/
"""

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import (
    Count, Avg, Sum, Min, Max, F, DecimalField, ExpressionWrapper, Q
)
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, Cart, CartItem, ProductImage
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
    ProductImageSerializer,
    ProductImageUploadSerializer,
    ProductImageReorderSerializer,
    CartSerializer,
    CartCreateSerializer,
    CartItemWriteSerializer,
    AddCartItemSerializer,
    RemoveCartItemSerializer,
    UserRegistrationSerializer,
)
from .filters import ProductFilter
from .pagination import StandardPagination, SmallPagination


# ─────────────────────────────────────────────────────────────────────────────
# Auth — Registration
# ─────────────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset           = User.objects.all()
    serializer_class   = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Account created successfully.',
                'user': {'id': user.id, 'username': user.username, 'email': user.email},
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class   = CategorySerializer
    pagination_class   = SmallPagination
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'description']
    ordering_fields    = ['name', 'product_count']
    ordering           = ['name']

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'stats'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count('products'),
            avg_price=Avg('products__price'),
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        data = (
            Category.objects
            .annotate(
                product_count=Count('products'),
                avg_price=Avg('products__price'),
                total_stock=Sum('products__stock'),
            )
            .values('id', 'name', 'product_count', 'avg_price', 'total_stock')
        )
        summary = Product.objects.aggregate(
            total_products=Count('id'),
            overall_avg_price=Avg('price'),
        )
        return Response({'summary': summary, 'per_category': list(data)})


# ─────────────────────────────────────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD + filtering + search + pagination + image management.

    Image endpoints (all require authentication):
    POST   /api/products/{id}/upload-images/   — upload 1–10 images
    GET    /api/products/{id}/images/          — list images for a product
    DELETE /api/products/{id}/images/{img_id}/ — delete a single image
    PATCH  /api/products/{id}/set-primary-image/ — set primary image
    PATCH  /api/products/{id}/reorder-images/  — reorder images
    """
    queryset        = Product.objects.select_related('category').prefetch_related('images').all()
    pagination_class = StandardPagination
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = ProductFilter
    search_fields    = ['name', 'description', 'category__name']
    ordering_fields  = ['price', 'name', 'created_at', 'stock']
    ordering         = ['-created_at']

    # Accept multipart for image upload actions; fall back to JSON for the rest
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'stats', 'related', 'images'):
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── Standard actions ──────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        overall = Product.objects.aggregate(
            total_products=Count('id'),
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price'),
            total_stock=Sum('stock'),
        )
        per_category = (
            Category.objects
            .annotate(product_count=Count('products'), avg_price=Avg('products__price'))
            .values('id', 'name', 'product_count', 'avg_price')
        )
        low_stock = Product.objects.filter(stock__gt=0, stock__lt=5).values('id', 'name', 'stock')
        return Response({
            'overall': overall,
            'per_category': list(per_category),
            'low_stock_warnings': list(low_stock),
        })

    @action(detail=True, methods=['get'], url_path='related')
    def related(self, request, pk=None):
        product    = self.get_object()
        related_qs = (
            Product.objects
            .filter(category=product.category)
            .exclude(pk=product.pk)
            .select_related('category')
            .prefetch_related('images')[:8]
        )
        serializer = ProductListSerializer(related_qs, many=True, context={'request': request})
        return Response(serializer.data)

    # ── Image upload ──────────────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='upload-images',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_images(self, request, pk=None):
        """
        POST /api/products/{id}/upload-images/
        Content-Type: multipart/form-data

        Form fields:
          images       (required) — one or more image files
          is_primary   (optional, bool) — mark the FIRST uploaded image as primary

        Validation:
          • Types  : JPEG, PNG, WEBP only
          • Size   : ≤ 5 MB per file
          • Count  : total stored + new ≤ 10

        Response 201:
          {
            "uploaded": 3,
            "images": [ { id, image_url, thumbnail_url, is_primary, ... }, … ]
          }
        """
        product = self.get_object()

        # `request.FILES.getlist` supports multiple files with the same field name
        files = request.FILES.getlist('images')
        if not files:
            return Response(
                {'detail': 'No images were provided. '
                           'Send files under the `images` field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProductImageUploadSerializer(
            data={'images': files, 'is_primary': request.data.get('is_primary', False)},
            context={'product': product, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        mark_primary = serializer.validated_data.get('is_primary', False)
        created_images = []

        with transaction.atomic():
            # If caller wants the first upload to be primary, clear current primary
            if mark_primary:
                product.images.filter(is_primary=True).update(is_primary=False)

            for idx, file in enumerate(serializer.validated_data['images']):
                is_primary = mark_primary and idx == 0
                # Only auto-set primary when product has no images yet
                if not is_primary and not product.images.exists() and idx == 0:
                    is_primary = True

                img = ProductImage.objects.create(
                    product=product,
                    image=file,
                    is_primary=is_primary,
                    alt_text=request.data.get('alt_text', ''),
                    order=product.images.count(),
                )
                created_images.append(img)

        response_serializer = ProductImageSerializer(
            created_images, many=True, context={'request': request}
        )
        return Response(
            {
                'uploaded': len(created_images),
                'images': response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── List images ───────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='images')
    def images(self, request, pk=None):
        """
        GET /api/products/{id}/images/
        Returns all images (with thumbnail URLs) for the product.
        """
        product = self.get_object()
        serializer = ProductImageSerializer(
            product.images.all(), many=True, context={'request': request}
        )
        return Response(serializer.data)

    # ── Delete single image ───────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'images/(?P<img_id>\d+)',
    )
    def delete_image(self, request, pk=None, img_id=None):
        """
        DELETE /api/products/{id}/images/{img_id}/
        Deletes the image and its thumbnail file from storage.
        If the deleted image was primary, the next image becomes primary.
        """
        product = self.get_object()
        img     = get_object_or_404(ProductImage, pk=img_id, product=product)

        was_primary = img.is_primary

        # Delete files from storage
        if img.image:
            img.image.delete(save=False)
        if img.thumbnail:
            img.thumbnail.delete(save=False)
        img.delete()

        # Promote first remaining image to primary if needed
        if was_primary:
            first = product.images.order_by('order', 'uploaded_at').first()
            if first:
                first.is_primary = True
                first.save(update_fields=['is_primary'])

        return Response(
            {'detail': f'Image #{img_id} deleted successfully.'},
            status=status.HTTP_200_OK,
        )

    # ── Set primary image ─────────────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='set-primary-image')
    def set_primary_image(self, request, pk=None):
        """
        PATCH /api/products/{id}/set-primary-image/
        Body: { "image_id": 5 }

        Sets image_id as the primary image; clears the flag on all others.
        """
        product  = self.get_object()
        image_id = request.data.get('image_id')

        if not image_id:
            return Response(
                {'detail': '`image_id` is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        img = get_object_or_404(ProductImage, pk=image_id, product=product)

        with transaction.atomic():
            product.images.filter(is_primary=True).update(is_primary=False)
            img.is_primary = True
            img.save(update_fields=['is_primary'])

        serializer = ProductImageSerializer(img, context={'request': request})
        return Response(
            {'detail': 'Primary image updated.', 'image': serializer.data},
            status=status.HTTP_200_OK,
        )

    # ── Reorder images ────────────────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='reorder-images')
    def reorder_images(self, request, pk=None):
        """
        PATCH /api/products/{id}/reorder-images/
        Body: { "order": [3, 1, 2] }   ← list of image IDs in desired display order

        All listed image IDs must belong to this product.
        """
        product    = self.get_object()
        serializer = ProductImageReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_ids  = serializer.validated_data['order']
        images_map = {img.pk: img for img in product.images.all()}

        # Validate all IDs belong to this product
        unknown = [i for i in image_ids if i not in images_map]
        if unknown:
            return Response(
                {'detail': f'Image ID(s) {unknown} do not belong to this product.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for position, img_id in enumerate(image_ids):
                ProductImage.objects.filter(pk=img_id).update(order=position)

        updated = ProductImageSerializer(
            product.images.all(), many=True, context={'request': request}
        )
        return Response(
            {'detail': 'Image order updated.', 'images': updated.data},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Cart
# ─────────────────────────────────────────────────────────────────────────────

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Cart.objects
            .filter(user=self.request.user)
            .prefetch_related('items__product__category', 'items__product__images')
        )

    def get_serializer_class(self):
        if self.action in ('create',):
            return CartCreateSerializer
        return CartSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart    = serializer.validated_data['cart']
        product = serializer.validated_data['product']
        qty     = serializer.validated_data['quantity']

        if cart.user != request.user:
            return Response(
                {'detail': 'You do not have permission to modify this cart.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={'quantity': qty},
        )
        if not created:
            cart_item.quantity += qty
            cart_item.save()

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(
            {
                'message': 'Item added to cart.' if created else 'Item quantity updated.',
                'cart': cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        serializer = RemoveCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart    = serializer.validated_data['cart']
        product = serializer.validated_data['product']

        if cart.user != request.user:
            return Response(
                {'detail': 'You do not have permission to modify this cart.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        deleted, _ = CartItem.objects.filter(cart=cart, product=product).delete()
        if not deleted:
            return Response(
                {'detail': 'Item not found in cart.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(
            {'message': 'Item removed from cart.', 'cart': cart_serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'], url_path='total')
    def total(self, request, pk=None):
        cart = self.get_object()
        items_data = (
            CartItem.objects
            .filter(cart=cart)
            .annotate(
                subtotal=ExpressionWrapper(
                    F('quantity') * F('product__price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                )
            )
            .values(
                'id', 'product__id', 'product__name',
                'product__price', 'quantity', 'subtotal',
            )
        )
        grand_total = sum(item['subtotal'] for item in items_data)
        return Response({
            'cart_id': cart.pk,
            'item_count': len(items_data),
            'items': list(items_data),
            'grand_total': grand_total,
        })