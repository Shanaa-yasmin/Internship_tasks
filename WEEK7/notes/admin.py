from django.contrib import admin
from .models import Category, Tag, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for the Category model."""
    list_display = ('id', 'name', 'owner', 'created_at')
    list_filter = ('owner', 'created_at')
    search_fields = ('name', 'owner__username')
    readonly_fields = ('created_at',)
    ordering = ('name',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin configuration for the Tag model."""
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)
    ordering = ('name',)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """Admin configuration for the Note model."""
    list_display = ('id', 'title', 'owner', 'category', 'get_tags', 'created_at', 'updated_at')
    list_filter = ('owner', 'category', 'tags', 'created_at')
    search_fields = ('title', 'content', 'owner__username', 'category__name', 'tags__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    filter_horizontal = ('tags',)  # Better UI for ManyToMany field

    def get_tags(self, obj):
        """Display tags as comma-separated list."""
        return ", ".join([tag.name for tag in obj.tags.all()])
    get_tags.short_description = 'Tags'
