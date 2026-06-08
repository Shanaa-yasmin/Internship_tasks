"""
models.py — Database schema for the E-Commerce API.

Relationships:
  Category     ──<  Product
  Product      ──<  ProductImage
  User         ──<  Cart  ──<  CartItem  >──  Product
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import os


# ─────────────────────────────────────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────────────────────────────────────

class Category(models.Model):
    name        = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────────────────────────────────────

class Product(models.Model):
    name        = models.CharField(max_length=255)
    description = models.TextField()
    price       = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    category    = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )
    stock       = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (${self.price})"

    @property
    def is_in_stock(self):
        return self.stock > 0


# ─────────────────────────────────────────────────────────────────────────────
# ProductImage  ← NEW
# ─────────────────────────────────────────────────────────────────────────────

def product_image_upload_path(instance, filename):
    """Store images under  media/products/<product_id>/original/<filename>"""
    return os.path.join('products', str(instance.product_id), 'original', filename)


def product_thumbnail_upload_path(instance, filename):
    """Store thumbnails under  media/products/<product_id>/thumbnails/<filename>"""
    return os.path.join('products', str(instance.product_id), 'thumbnails', filename)


class ProductImage(models.Model):
    """
    Multiple images per product with auto-generated thumbnails.

    Constraints enforced at the serializer level:
      • Allowed types : JPEG, PNG, WEBP
      • Max file size : 5 MB per image
      • Max images    : 10 per product

    Thumbnails (300 × 300 px) are generated automatically on save via Pillow.
    One image can be flagged as `is_primary`; the view enforces only one primary
    per product.
    """
    product    = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image      = models.ImageField(upload_to=product_image_upload_path)
    thumbnail  = models.ImageField(
        upload_to=product_thumbnail_upload_path,
        blank=True,
        null=True,
    )
    is_primary = models.BooleanField(default=False)
    alt_text   = models.CharField(max_length=255, blank=True)
    order      = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"Image #{self.pk} for {self.product.name}"

    def generate_thumbnail(self):
        """
        Create a 300×300 thumbnail using Pillow (LANCZOS resampling).
        Preserves aspect ratio by using thumbnail(), then centre-crops
        to a square so the thumbnail is always exactly 300×300.
        """
        from PIL import Image as PILImage
        from io import BytesIO
        from django.core.files.base import ContentFile

        THUMB_SIZE = (300, 300)

        img = PILImage.open(self.image)

        # Convert palette / RGBA → RGB so JPEG save works
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Scale so the shortest side is 300 px, then centre-crop
        img.thumbnail((max(THUMB_SIZE), max(THUMB_SIZE)), PILImage.LANCZOS)
        width, height = img.size
        left   = (width  - THUMB_SIZE[0]) // 2
        top    = (height - THUMB_SIZE[1]) // 2
        right  = left + THUMB_SIZE[0]
        bottom = top  + THUMB_SIZE[1]
        img    = img.crop((left, top, right, bottom))

        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85, optimize=True)
        buffer.seek(0)

        # Build thumb filename from original name
        original_name = os.path.basename(self.image.name)
        thumb_name    = f"thumb_{os.path.splitext(original_name)[0]}.jpg"

        self.thumbnail.save(thumb_name, ContentFile(buffer.read()), save=False)

    def save(self, *args, **kwargs):
        # Generate thumbnail before the first save (no pk yet means it's new)
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new or not self.thumbnail:
            self.generate_thumbnail()
            # Save thumbnail field only (avoid infinite recursion)
            ProductImage.objects.filter(pk=self.pk).update(thumbnail=self.thumbnail)


# ─────────────────────────────────────────────────────────────────────────────
# Cart
# ─────────────────────────────────────────────────────────────────────────────

class Cart(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Cart #{self.pk} — {self.user.username}"

    @property
    def total_value(self):
        from django.db.models import Sum, F, DecimalField, ExpressionWrapper
        result = self.items.aggregate(
            total=Sum(
                ExpressionWrapper(
                    F('quantity') * F('product__price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                )
            )
        )
        return result['total'] or 0


# ─────────────────────────────────────────────────────────────────────────────
# CartItem
# ─────────────────────────────────────────────────────────────────────────────

class CartItem(models.Model):
    cart     = models.ForeignKey(Cart,    on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity}× {self.product.name} in Cart #{self.cart_id}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity