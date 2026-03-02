"""
Database models for the Notes app.

Defines the Note model with a One-to-Many relationship:
  One User → Many Notes (via ForeignKey with CASCADE delete).
"""

from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    """
    Represents a user's note.

    Fields:
        id         - Auto-generated primary key (BigAutoField)
        title      - Short title of the note (max 200 chars)
        content    - Full text content of the note
        owner      - ForeignKey to User (One-to-Many: One user has many notes)
        created_at - Timestamp when the note was created (auto-set)
        updated_at - Timestamp when the note was last modified (auto-updated)
    
    Constraints:
        - When a user is deleted, all their notes are also deleted (CASCADE).
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
