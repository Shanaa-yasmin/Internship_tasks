"""
serializers.py — DRF serializers for the E-Commerce API.

Includes:
  • Input validation (stock, quantity, image type & size)
  • Nested read representations
  • Computed / annotated fields
  • ProductImage upload + thumbnail serializers  ← NEW
"""

from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Product, Cart, CartItem, ProductImage


# ─────────────────────────────────────────────────────────────────────────────
# Constants for image validation
# ─────────────────────────────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = ('image/jpeg', 'image/png', 'image/webp')
ALLOWED_EXTENSIONS  = ('.jpg', '.jpeg', '.png', '.webp')
MAX_IMAGE_SIZE_MB   = 5
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024   # 5 MB
MAX_IMAGES_PER_PRODUCT = 10


# ─────────────────────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
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
    product_count = serializers.IntegerField(read_only=True)
    avg_price     = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model  = Category
        fields = ('id', 'name', 'description', 'product_count', 'avg_price')


# ─────────────────────────────────────────────────────────────────────────────
# ProductImage  ← NEW
# ─────────────────────────────────────────────────────────────────────────────

class ProductImageSerializer(serializers.ModelSerializer):
    """
    Read serializer — returns full image URL and thumbnail URL.
    The `request` context is needed so absolute URLs are returned.
    """
    image_url     = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = (
            'id', 'image_url', 'thumbnail_url',
            'is_primary', 'alt_text', 'order', 'uploaded_at',
        )

    def _build_url(self, path):
        request = self.context.get('request')
        if request and path:
            return request.build_absolute_uri(path)
        return path or None

    def get_image_url(self, obj):
        return self._build_url(obj.image.url if obj.image else None)

    def get_thumbnail_url(self, obj):
        return self._build_url(obj.thumbnail.url if obj.thumbnail else None)


class ProductImageUploadSerializer(serializers.Serializer):
    """
    Write serializer for  POST /api/products/{id}/upload-images/

    Accepts multiple files in the `images` field.
    Validates:
      • Each file must be JPEG, PNG, or WEBP
      • Each file must be ≤ 5 MB
      • Total images already stored + new uploads must not exceed 10
    """
    images     = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        allow_empty=False,
    )
    is_primary = serializers.BooleanField(default=False, required=False)

    def validate_images(self, files):
        errors = []

        for idx, file in enumerate(files, start=1):
            # ── Size check ──────────────────────────────────────────────────
            if file.size > MAX_IMAGE_SIZE_BYTES:
                size_mb = file.size / (1024 * 1024)
                errors.append(
                    f"Image {idx} ({file.name}): size {size_mb:.1f} MB exceeds "
                    f"the {MAX_IMAGE_SIZE_MB} MB limit."
                )
                continue

            # ── Type check (content_type header + extension) ────────────────
            content_type = getattr(file, 'content_type', '')
            extension    = '.' + file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''

            if content_type not in ALLOWED_IMAGE_TYPES and extension not in ALLOWED_EXTENSIONS:
                errors.append(
                    f"Image {idx} ({file.name}): unsupported type '{content_type}'. "
                    f"Allowed types: JPEG, PNG, WEBP."
                )

        if errors:
            raise serializers.ValidationError(errors)

        return files

    def validate(self, attrs):
        """Enforce the per-product maximum of 10 images."""
        product = self.context.get('product')
        if product:
            existing_count = product.images.count()
            incoming_count = len(attrs.get('images', []))
            if existing_count + incoming_count > MAX_IMAGES_PER_PRODUCT:
                available = MAX_IMAGES_PER_PRODUCT - existing_count
                raise serializers.ValidationError(
                    {
                        'images': (
                            f"This product already has {existing_count} image(s). "
                            f"You can upload at most {available} more "
                            f"(limit is {MAX_IMAGES_PER_PRODUCT} per product)."
                        )
                    }
                )
        return attrs


class ProductImageReorderSerializer(serializers.Serializer):
    """
    Payload for PATCH /api/products/{id}/reorder-images/
    Body: { "order": [3, 1, 2] }  — list of image IDs in desired display order
    """
    order = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────────────────────────────────────

class ProductSerializer(serializers.ModelSerializer):
    """Full serializer — used for create / update. Embeds images."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock   = serializers.BooleanField(read_only=True)
    images        = ProductImageSerializer(many=True, read_only=True)   # ← NEW

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'description', 'price',
            'category', 'category_name',
            'stock', 'is_in_stock',
            'images',                                                    # ← NEW
            'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')

    def validate_price(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — shows primary thumbnail only."""
    category_name   = serializers.CharField(source='category.name', read_only=True)
    is_in_stock     = serializers.BooleanField(read_only=True)
    primary_image   = serializers.SerializerMethodField()                # ← NEW

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'price', 'category', 'category_name',
            'stock', 'is_in_stock',
            'primary_image',                                             # ← NEW
            'created_at',
        )

    def get_primary_image(self, obj):
        """Return the thumbnail URL of the primary image (or first image)."""
        request = self.context.get('request')
        img = (
            obj.images.filter(is_primary=True).first()
            or obj.images.first()
        )
        if img and img.thumbnail:
            url = img.thumbnail.url
            return request.build_absolute_uri(url) if request else url
        return None


# ─────────────────────────────────────────────────────────────────────────────
# CartItem
# ─────────────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product  = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model  = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal')


class CartItemWriteSerializer(serializers.ModelSerializer):
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
    items       = CartItemSerializer(many=True, read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    user        = UserSerializer(read_only=True)

    class Meta:
        model  = Cart
        fields = ('id', 'user', 'created_at', 'items', 'total_value')


class CartCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Cart
        fields = ('id', 'created_at')


# ─────────────────────────────────────────────────────────────────────────────
# Cart helpers
# ─────────────────────────────────────────────────────────────────────────────

class AddCartItemSerializer(serializers.Serializer):
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

        existing_qty = 0
        try:
            existing_item = CartItem.objects.get(cart=cart, product=product)
            existing_qty  = existing_item.quantity
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