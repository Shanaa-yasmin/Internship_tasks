"""
Views for the Notes app.

Provides full CRUD operations for user-specific notes and categories:

Categories:
- POST   /api/categories/       → Create a new category
- GET    /api/categories/       → List all categories for the authenticated user

Notes:
- POST   /api/notes/            → Create a new note (with category and tags)
- GET    /api/notes/            → List all notes (with optional filtering)
- GET    /api/notes/{id}/       → Retrieve a single note (owner only)
- PUT    /api/notes/{id}/       → Update a note (owner only)
- PATCH  /api/notes/{id}/       → Partial update a note (owner only)
- DELETE /api/notes/{id}/       → Delete a note (owner only)

Search:
- GET    /api/notes/search?q=keyword → Search notes by title or content

Filtering:
- GET    /api/notes?category=Study   → Filter by category name
- GET    /api/notes?tag=exam         → Filter by tag name

All endpoints require JWT Bearer token authentication.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.urls import reverse

from .models import Category, Tag, Note, ShareLink
from .serializers import CategorySerializer, NoteSerializer, ShareLinkSerializer, PublicNoteSerializer
from .permissions import IsOwner


# =============================================================================
# Category Views
# =============================================================================

class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/categories/ → List all categories belonging to the authenticated user.
    POST /api/categories/ → Create a new category for the authenticated user.

    - List: Returns only the logged-in user's categories.
    - Create: Automatically sets owner = request.user.
    """
    serializer_class = CategorySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """Filter categories to return only those belonging to the current user."""
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the authenticated user as the category owner."""
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to return a custom success message with 201 status."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response({
            "message": "Category created successfully.",
            "category": serializer.data
        }, status=status.HTTP_201_CREATED)


# =============================================================================
# Note Views
# =============================================================================

class NoteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/notes/ → List all notes belonging to the authenticated user.
    POST /api/notes/ → Create a new note for the authenticated user.

    Filtering (query parameters):
    - ?category=Study → Filter by category name
    - ?tag=exam       → Filter by tag name

    - List: Returns only the logged-in user's notes (filtered by owner).
    - Create: Automatically sets owner = request.user.
    """
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Filter notes to return only those belonging to the current user.
        Apply optional filters for category and tag.
        """
        queryset = Note.objects.filter(owner=self.request.user)

        # Filter by category name
        category_name = self.request.query_params.get('category')
        if category_name:
            queryset = queryset.filter(category__name__iexact=category_name)

        # Filter by tag name
        tag_name = self.request.query_params.get('tag')
        if tag_name:
            queryset = queryset.filter(tags__name__iexact=tag_name)

        return queryset.distinct()

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


class NoteSearchView(APIView):
    """
    GET /api/notes/search?q=keyword → Search notes by title or content.

    Uses Django Q objects to perform OR queries on title and content fields.
    Only searches within the authenticated user's notes.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """
        Search notes by keyword in title or content.
        
        Query Parameters:
            q (str): The search keyword (required).
        
        Returns:
            List of notes matching the search query.
        """
        keyword = request.query_params.get('q', '').strip()

        if not keyword:
            return Response(
                {"error": "Search query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use Q objects for OR query: title contains keyword OR content contains keyword
        queryset = Note.objects.filter(
            Q(owner=request.user) & (
                Q(title__icontains=keyword) | Q(content__icontains=keyword)
            )
        )

        serializer = NoteSerializer(queryset, many=True, context={'request': request})
        
        return Response({
            "query": keyword,
            "count": queryset.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)


# =============================================================================
# Share Link Views
# =============================================================================

class ShareLinkCreateView(APIView):
    """
    POST /api/notes/{id}/share/ → Create a shareable link for a note.

    Only the note owner can create a share link.
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        note = get_object_or_404(Note, pk=pk)

        if note.owner != request.user:
            return Response(
                {"error": "You do not have permission to share this note."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ShareLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        share_link = serializer.save(note=note)

        share_url = request.build_absolute_uri(
            reverse('note-share-public', kwargs={'token': share_link.token})
        )

        return Response({
            "message": "Share link created successfully.",
            "share_link": ShareLinkSerializer(share_link).data,
            "share_url": share_url
        }, status=status.HTTP_201_CREATED)


class ShareLinkPublicView(APIView):
    """
    GET /api/notes/share/{token}/ → Public access to a shared note.

    Does not require authentication.
    """

    permission_classes = (AllowAny,)

    def get(self, request, token):
        share_link = get_object_or_404(ShareLink, token=token)

        if share_link.is_expired():
            return Response(
                {"error": "This share link has expired."},
                status=status.HTTP_410_GONE
            )

        ShareLink.objects.filter(pk=share_link.pk).update(access_count=F('access_count') + 1)
        share_link.refresh_from_db(fields=['access_count'])

        note_serializer = PublicNoteSerializer(share_link.note)

        return Response({
            "share_link": {
                "token": share_link.token,
                "expires_at": share_link.expires_at,
                "access_count": share_link.access_count,
                "created_at": share_link.created_at
            },
            "note": note_serializer.data
        }, status=status.HTTP_200_OK)
