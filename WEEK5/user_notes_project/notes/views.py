"""
Views for the Notes app.

Provides full CRUD operations for user-specific notes:
- POST   /api/notes/       → Create a new note (auto-assign owner)
- GET    /api/notes/       → List all notes for the authenticated user
- GET    /api/notes/{id}/  → Retrieve a single note (owner only)
- PUT    /api/notes/{id}/  → Update a note (owner only)
- PATCH  /api/notes/{id}/  → Partial update a note (owner only)
- DELETE /api/notes/{id}/  → Delete a note (owner only)

All endpoints require JWT Bearer token authentication.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Note
from .serializers import NoteSerializer
from .permissions import IsOwner


class NoteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/notes/ → List all notes belonging to the authenticated user.
    POST /api/notes/ → Create a new note for the authenticated user.

    - List: Returns only the logged-in user's notes (filtered by owner).
    - Create: Automatically sets owner = request.user.
    """
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Filter notes to return only those belonging to the current user.
        This ensures users cannot see other users' notes.
        """
        return Note.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically assign the authenticated user as the note owner.
        This prevents users from creating notes for other users.
        """
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Override create to return a custom success message with 201 status.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response({
            "message": "Note created successfully.",
            "note": serializer.data
        }, status=status.HTTP_201_CREATED)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/notes/{id}/ → Retrieve a specific note.
    PUT    /api/notes/{id}/ → Full update of a note.
    PATCH  /api/notes/{id}/ → Partial update of a note.
    DELETE /api/notes/{id}/ → Delete a note.

    All operations require:
    1. The user is authenticated (IsAuthenticated)
    2. The user owns the note (IsOwner) → otherwise 403 Forbidden
    """
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def get_queryset(self):
        """
        Restrict queryset to the authenticated user's notes.
        Combined with IsOwner permission for defense in depth.
        """
        return Note.objects.filter(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        """Override update to return a custom success message."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            "message": "Note updated successfully.",
            "note": serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return a custom success message."""
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Note deleted successfully."},
            status=status.HTTP_200_OK
        )
