"""
Serializers for the Notes app.

Handles serialization/deserialization of Note objects
and provides validation for create/update operations.
"""

from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    """
    Serializer for the Note model.
    
    - `owner` is read-only and displayed as the username string.
    - `created_at` and `updated_at` are read-only timestamps.
    - `title` and `content` are required for creation/update.
    
    The owner is automatically assigned in the view (perform_create),
    so it is never accepted from the request body.
    """

    # Display the owner's username instead of the raw user ID
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Note
        fields = ('id', 'title', 'content', 'owner', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def validate_title(self, value):
        """Ensure the title is not empty or whitespace-only."""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value.strip()

    def validate_content(self, value):
        """Ensure the content is not empty or whitespace-only."""
        if not value.strip():
            raise serializers.ValidationError("Content cannot be blank.")
        return value
