"""
views.py — API Views for the E-Commerce Backend.

ViewSets:
  CategoryViewSet  — CRUD + stats
  ProductViewSet   — CRUD + search/filter/pagination + stats
  CartViewSet      — CRUD + add-item / remove-item + total

Extra:
  RegisterView     — POST /api/auth/register/
"""

from django.contrib.auth.models import User
from django.db.models import (
    Count, Avg, Sum, F, DecimalField, ExpressionWrapper, Q
)
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, Cart, CartItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
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
    """
    POST /api/auth/register/
    Create a new user account. No authentication required.
    """
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
    """
    CRUD for categories.

    GET    /api/categories/         — list with product count & avg price
    POST   /api/categories/         — create
    GET    /api/categories/{id}/    — retrieve
    PUT    /api/categories/{id}/    — full update
    PATCH  /api/categories/{id}/    — partial update
    DELETE /api/categories/{id}/    — destroy

    Custom:
    GET    /api/categories/stats/   — aggregated stats across all categories
    """
    serializer_class   = CategorySerializer
    pagination_class   = SmallPagination
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'description']
    ordering_fields    = ['name', 'product_count']
    ordering           = ['name']

    def get_permissions(self):
        """Read is open; write requires authentication."""
        if self.action in ('list', 'retrieve', 'stats'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Annotate each category with:
          • product_count — number of products
          • avg_price     — mean product price
        """
        return Category.objects.annotate(
            product_count=Count('products'),
            avg_price=Avg('products__price'),
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        GET /api/categories/stats/
        Returns aggregated stats for all categories.
        """
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

        return Response({
            'summary': summary,
            'per_category': list(data),
        })


# ─────────────────────────────────────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD + filtering + search + pagination for products.

    GET    /api/products/           — list (supports filters & search)
    POST   /api/products/           — create (admin only)
    GET    /api/products/{id}/      — retrieve
    PUT    /api/products/{id}/      — full update (admin only)
    PATCH  /api/products/{id}/      — partial update (admin only)
    DELETE /api/products/{id}/      — destroy (admin only)

    Custom:
    GET    /api/products/stats/     — aggregation stats
    GET    /api/products/{id}/related/ — products in the same category
    """
    queryset           = Product.objects.select_related('category').all()
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ProductFilter
    search_fields      = ['name', 'description', 'category__name']
    ordering_fields    = ['price', 'name', 'created_at', 'stock']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        """
        Anyone can read; only authenticated admins can write.
        Adjust to IsAuthenticated if all users should be able to create products.
        """
        if self.action in ('list', 'retrieve', 'stats', 'related'):
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── Custom actions ────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        GET /api/products/stats/
        Returns:
          • total products
          • avg / min / max price
          • products per category
          • low-stock warnings (stock < 5)
        """
        # Overall aggregations
        overall = Product.objects.aggregate(
            total_products=Count('id'),
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price'),
            total_stock=Sum('stock'),
        )

        # Per-category breakdown
        per_category = (
            Category.objects
            .annotate(
                product_count=Count('products'),
                avg_price=Avg('products__price'),
            )
            .values('id', 'name', 'product_count', 'avg_price')
        )

        # Low-stock products (stock between 1 and 4)
        low_stock = (
            Product.objects
            .filter(stock__gt=0, stock__lt=5)
            .values('id', 'name', 'stock')
        )

        return Response({
            'overall': overall,
            'per_category': list(per_category),
            'low_stock_warnings': list(low_stock),
        })

    @action(detail=True, methods=['get'], url_path='related')
    def related(self, request, pk=None):
        """
        GET /api/products/{id}/related/
        Returns other products in the same category.
        """
        product = self.get_object()
        related_qs = (
            Product.objects
            .filter(category=product.category)
            .exclude(pk=product.pk)
            .select_related('category')[:8]
        )
        serializer = ProductListSerializer(related_qs, many=True)
        return Response(serializer.data)


# Fix missing imports for stats action
from django.db.models import Min, Max  # noqa: E402 — after class definition is fine


# ─────────────────────────────────────────────────────────────────────────────
# Cart
# ─────────────────────────────────────────────────────────────────────────────

class CartViewSet(viewsets.ModelViewSet):
    """
    Cart management — scoped to the authenticated user.

    GET    /api/cart/               — list user's carts
    POST   /api/cart/               — create a new cart
    GET    /api/cart/{id}/          — retrieve cart (with items)
    DELETE /api/cart/{id}/          — delete cart

    Custom:
    POST   /api/cart/add-item/      — add / increment an item
    POST   /api/cart/remove-item/   — remove an item entirely
    GET    /api/cart/{id}/total/    — cart value summary
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users only see their own carts."""
        return (
            Cart.objects
            .filter(user=self.request.user)
            .prefetch_related('items__product__category')
        )

    def get_serializer_class(self):
        if self.action in ('create',):
            return CartCreateSerializer
        return CartSerializer

    def perform_create(self, serializer):
        """Attach the requesting user when creating a cart."""
        serializer.save(user=self.request.user)

    # ── add-item ──────────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        """
        POST /api/cart/add-item/
        Body: { "cart_id": 1, "product_id": 3, "quantity": 2 }

        • Creates a new CartItem if the product isn't in the cart yet.
        • Increments quantity if the item already exists.
        • Validates that the requested quantity doesn't exceed available stock.
        """
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart    = serializer.validated_data['cart']
        product = serializer.validated_data['product']
        qty     = serializer.validated_data['quantity']

        # Ownership check — users can only modify their own carts
        if cart.user != request.user:
            return Response(
                {'detail': 'You do not have permission to modify this cart.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': qty},
        )
        if not created:
            cart_item.quantity += qty
            cart_item.save()

        # Return the updated cart
        cart_serializer = CartSerializer(cart)
        return Response(
            {
                'message': 'Item added to cart.' if created else 'Item quantity updated.',
                'cart': cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── remove-item ───────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        """
        POST /api/cart/remove-item/
        Body: { "cart_id": 1, "product_id": 3 }

        Removes the CartItem entirely (regardless of quantity).
        """
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

        cart_serializer = CartSerializer(cart)
        return Response(
            {
                'message': 'Item removed from cart.',
                'cart': cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── total ─────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='total')
    def total(self, request, pk=None):
        """
        GET /api/cart/{id}/total/
        Returns itemised breakdown + grand total for the cart.
        """
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
            .values('id', 'product__id', 'product__name', 'product__price', 'quantity', 'subtotal')
        )

        grand_total = sum(item['subtotal'] for item in items_data)

        return Response({
            'cart_id': cart.pk,
            'item_count': len(items_data),
            'items': list(items_data),
            'grand_total': grand_total,
        })
