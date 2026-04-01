"""
serializers.py — DRF serializers for the E-Commerce API.

Includes:
  • Input validation (stock, quantity)
  • Nested read representations
  • Computed / annotated fields
"""

from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Product, Cart, CartItem


# ─────────────────────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Used only for /api/auth/register/ — never exposes password in responses."""
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'date_joined')


# ─────────────────────────────────────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    # Annotated fields added by the view's queryset
    product_count = serializers.IntegerField(read_only=True)
    avg_price     = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model  = Category
        fields = ('id', 'name', 'description', 'product_count', 'avg_price')


# ─────────────────────────────────────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────────────────────────────────────

class ProductSerializer(serializers.ModelSerializer):
    """Full serializer — used for create / update."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock   = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'description', 'price',
            'category', 'category_name',
            'stock', 'is_in_stock',
            'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')

    # ── Validation ────────────────────────────────────────────────────────────

    def validate_price(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints (omits heavy description)."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock   = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'price', 'category', 'category_name',
            'stock', 'is_in_stock', 'created_at',
        )


# ─────────────────────────────────────────────────────────────────────────────
# CartItem
# ─────────────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    """Read representation — embeds product detail."""
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model  = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal')


class CartItemWriteSerializer(serializers.ModelSerializer):
    """Write serializer — accepts product ID and validates stock."""
    class Meta:
        model  = CartItem
        fields = ('id', 'cart', 'product', 'quantity')

    def validate(self, attrs):
        product  = attrs.get('product') or self.instance.product
        quantity = attrs.get('quantity', 1 if not self.instance else self.instance.quantity)

        if quantity > product.stock:
            raise serializers.ValidationError(
                {
                    'quantity': (
                        f'Only {product.stock} unit(s) of "{product.name}" available in stock.'
                    )
                }
            )
        return attrs


# ─────────────────────────────────────────────────────────────────────────────
# Cart
# ─────────────────────────────────────────────────────────────────────────────

class CartSerializer(serializers.ModelSerializer):
    """Nested read representation of a full cart."""
    items       = CartItemSerializer(many=True, read_only=True)
    total_value = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    user        = UserSerializer(read_only=True)

    class Meta:
        model  = Cart
        fields = ('id', 'user', 'created_at', 'items', 'total_value')


class CartCreateSerializer(serializers.ModelSerializer):
    """Used only to create a new (empty) cart; user is set from request."""
    class Meta:
        model  = Cart
        fields = ('id', 'created_at')


# ─────────────────────────────────────────────────────────────────────────────
# Add / Remove CartItem helpers (used in custom actions)
# ─────────────────────────────────────────────────────────────────────────────

class AddCartItemSerializer(serializers.Serializer):
    """Payload for POST /api/cart/add-item/"""
    cart_id    = serializers.IntegerField()
    product_id = serializers.IntegerField()
    quantity   = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        try:
            product = Product.objects.get(pk=attrs['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product_id': 'Product not found.'})

        try:
            cart = Cart.objects.get(pk=attrs['cart_id'])
        except Cart.DoesNotExist:
            raise serializers.ValidationError({'cart_id': 'Cart not found.'})

        # Check sufficient stock
        existing_qty = 0
        try:
            existing_item = CartItem.objects.get(cart=cart, product=product)
            existing_qty = existing_item.quantity
        except CartItem.DoesNotExist:
            pass

        total_requested = existing_qty + attrs['quantity']
        if total_requested > product.stock:
            raise serializers.ValidationError(
                {
                    'quantity': (
                        f'Cannot add {attrs["quantity"]} unit(s). '
                        f'Only {product.stock - existing_qty} more unit(s) available.'
                    )
                }
            )

        attrs['product'] = product
        attrs['cart']    = cart
        return attrs


class RemoveCartItemSerializer(serializers.Serializer):
    """Payload for POST /api/cart/remove-item/"""
    cart_id    = serializers.IntegerField()
    product_id = serializers.IntegerField()

    def validate(self, attrs):
        try:
            attrs['cart'] = Cart.objects.get(pk=attrs['cart_id'])
        except Cart.DoesNotExist:
            raise serializers.ValidationError({'cart_id': 'Cart not found.'})

        try:
            attrs['product'] = Product.objects.get(pk=attrs['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product_id': 'Product not found.'})

        return attrs
