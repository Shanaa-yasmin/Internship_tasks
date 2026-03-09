"""
Database models for the Notes app.

Defines the following models and relationships:
  - Category: One User → Many Categories (One-to-Many)
  - Tag: Many Notes ↔ Many Tags (Many-to-Many)
  - Note: One User → Many Notes (One-to-Many), One Category → Many Notes (One-to-Many)
"""

from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """
    Represents a category for organizing notes.

    Fields:
        id         - Auto-generated primary key (BigAutoField)
        name       - Name of the category (max 100 chars)
        owner      - ForeignKey to User (One-to-Many: One user has many categories)
        created_at - Timestamp when the category was created (auto-set)

    Constraints:
        - Each user can have unique category names (unique_together).
        - When a user is deleted, all their categories are also deleted (CASCADE).
    """

    id = models.BigAutoField(primary_key=True)

    name = models.CharField(
        max_length=100,
        help_text="Name of the category (max 100 characters)."
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='categories',
        help_text="The user who owns this category."
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the category was created."
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        unique_together = ['name', 'owner']  # Each user can have unique category names

    def __str__(self):
        return f"Category(id={self.id}, name='{self.name}', owner='{self.owner.username}')"


class Tag(models.Model):
    """
    Represents a tag for labeling notes.

    Fields:
        id         - Auto-generated primary key (BigAutoField)
        name       - Name of the tag (max 50 chars, unique globally)
        created_at - Timestamp when the tag was created (auto-set)

    Notes:
        - Tags are shared globally (not user-specific) to allow reuse.
        - Tag names are stored in lowercase for consistency.
    """

    id = models.BigAutoField(primary_key=True)

    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Name of the tag (max 50 characters, unique)."
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the tag was created."
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return f"Tag(id={self.id}, name='{self.name}')"


class Note(models.Model):
    """
    Represents a user's note.

    Fields:
        id         - Auto-generated primary key (BigAutoField)
        title      - Short title of the note (max 200 chars)
        content    - Full text content of the note
        owner      - ForeignKey to User (One-to-Many: One user has many notes)
        category   - ForeignKey to Category (One-to-Many: One category has many notes)
        tags       - ManyToManyField to Tag (Many-to-Many: Notes can have multiple tags)
        created_at - Timestamp when the note was created (auto-set)
        updated_at - Timestamp when the note was last modified (auto-updated)
    
    Constraints:
        - When a user is deleted, all their notes are also deleted (CASCADE).
        - When a category is deleted, notes remain but category is set to NULL.
        - Notes are ordered by most recently updated first.
    """

    id = models.BigAutoField(primary_key=True)

    title = models.CharField(
        max_length=200,
        help_text="Title of the note (max 200 characters)."
    )

    content = models.TextField(
        help_text="Full content of the note."
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,       # Delete notes when user is deleted
        related_name='notes',           # Access user's notes via user.notes.all()
        help_text="The user who owns this note."
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,      # Keep note if category is deleted
        related_name='notes',           # Access category's notes via category.notes.all()
        null=True,
        blank=True,
        help_text="The category this note belongs to (optional)."
    )

    tags = models.ManyToManyField(
        Tag,
        related_name='notes',           # Access tag's notes via tag.notes.all()
        blank=True,
        help_text="Tags associated with this note."
    )

    created_at = models.DateTimeField(
        auto_now_add=True,              # Set automatically on creation
        help_text="Timestamp when the note was created."
    )

    updated_at = models.DateTimeField(
        auto_now=True,                  # Updated automatically on every save
        help_text="Timestamp when the note was last updated."
    )

    class Meta:
        ordering = ['-updated_at']      # Most recently updated notes first
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'

    def __str__(self):
        return f"Note(id={self.id}, title='{self.title}', owner='{self.owner.username}')"
