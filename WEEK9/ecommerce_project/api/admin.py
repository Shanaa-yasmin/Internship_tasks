"""
admin.py — Register models with the Django admin interface.
"""

from django.contrib import admin
from .models import Category, Product, Cart, CartItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'description')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('id', 'name', 'category', 'price', 'stock', 'created_at')
    list_filter    = ('category',)
    search_fields  = ('name', 'description')
    ordering       = ('-created_at',)
    list_per_page  = 25


class CartItemInline(admin.TabularInline):
    model  = CartItem
    extra  = 0
    fields = ('product', 'quantity')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    inlines      = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity')
