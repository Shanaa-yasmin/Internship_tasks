"""
Serializers for the Notes app.

Handles serialization/deserialization of Category, Tag, and Note objects
and provides validation for create/update operations.
"""

from rest_framework import serializers
from .models import Category, Tag, Note


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model.
    
    - `owner` is read-only and displayed as the username string.
    - `created_at` is a read-only timestamp.
    - `name` is required for creation.
    
    The owner is automatically assigned in the view (perform_create).
    """

    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Category
        fields = ('id', 'name', 'owner', 'created_at')
        read_only_fields = ('id', 'owner', 'created_at')

    def validate_name(self, value):
        """Ensure the category name is not empty or whitespace-only."""
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be blank.")
        return value.strip()


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for the Tag model.
    
    Used for displaying tag information.
    """

    class Meta:
        model = Tag
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')


class NoteSerializer(serializers.ModelSerializer):
    """
    Serializer for the Note model.
    
    - `owner` is read-only and displayed as the username string.
    - `category` is displayed as the category name (read-only output).
    - `category_id` is write-only for setting the category.
    - `tags` is displayed as a list of tag names (read-only output).
    - `tag_names` is write-only for setting tags by name.
    - `created_at` and `updated_at` are read-only timestamps.
    - `title` and `content` are required for creation/update.
    
    The owner is automatically assigned in the view (perform_create),
    so it is never accepted from the request body.
    """

    # Display the owner's username instead of the raw user ID
    owner = serializers.ReadOnlyField(source='owner.username')

    # Category - read as name, write as category_id
    category = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )

    # Tags - read as list of names, write as list of tag names
    tags = serializers.SerializerMethodField()
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Note
        fields = (
            'id', 'title', 'content', 'owner',
            'category', 'category_id',
            'tags', 'tag_names',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'owner', 'category', 'tags', 'created_at', 'updated_at')

    def get_tags(self, obj):
        """Return list of tag names for the note."""
        return [tag.name for tag in obj.tags.all()]

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

    def validate_category_id(self, value):
        """Ensure the category belongs to the current user."""
        if value is None:
            return value
        
        request = self.context.get('request')
        if request and value.owner != request.user:
            raise serializers.ValidationError("Category does not belong to you.")
        return value

    def validate_tag_names(self, value):
        """Normalize tag names to lowercase and remove duplicates."""
        if not value:
            return []
        # Normalize to lowercase and strip whitespace
        normalized = []
        seen = set()
        for tag_name in value:
            tag_name = tag_name.strip().lower()
            if tag_name and tag_name not in seen:
                normalized.append(tag_name)
                seen.add(tag_name)
        return normalized

    def create(self, validated_data):
        """Create a note with optional tags."""
        tag_names = validated_data.pop('tag_names', [])
        note = Note.objects.create(**validated_data)
        
        # Create or get tags and associate them with the note
        if tag_names:
            tags = []
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
            note.tags.set(tags)
        
        return note

    def update(self, instance, validated_data):
        """Update a note with optional tags."""
        tag_names = validated_data.pop('tag_names', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            tags = []
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
            instance.tags.set(tags)
        
        return instance
