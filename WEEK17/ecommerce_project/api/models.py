"""
models.py — Database schema for the E-Commerce API.

Relationships:
  Category  ──<  Product
  User      ──<  Cart  ──<  CartItem  >──  Product
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


# ─────────────────────────────────────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────────────────────────────────────

class Category(models.Model):
    """
    Represents a product category (e.g. "Electronics", "Books").
    """
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
    """
    A sellable item belonging to a category.
    `stock` is validated ≥ 0 at the model level; business-logic checks live
    in the serializer so API clients receive friendly error messages.
    """
    name        = models.CharField(max_length=255)
    description = models.TextField()
    price       = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    category    = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,       # prevent deleting a category that has products
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
# Cart
# ─────────────────────────────────────────────────────────────────────────────

class Cart(models.Model):
    """
    A shopping cart tied to one user.
    Each user can have multiple carts (e.g. saved / active).
    """
    user       = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='carts',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Cart #{self.pk} — {self.user.username}"

    @property
    def total_value(self):
        """Sum of (price × quantity) for every item in the cart."""
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
    """
    A single product line within a cart.
    Enforces unique (cart, product) so the same product can't be added twice —
    callers should increment `quantity` instead.
    """
    cart     = models.ForeignKey(Cart,    on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity}× {self.product.name} in Cart #{self.cart_id}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity
