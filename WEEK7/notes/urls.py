"""
URL configuration for the Notes app.

Routes:
Notes:
- /                  → List all notes (GET) / Create a note (POST)
- /<int:pk>/         → Retrieve / Update / Delete a specific note
- /search/           → Search notes by keyword (GET ?q=keyword)

Categories:
- /categories/       → List all categories (GET) / Create a category (POST)
"""

from django.urls import path
from . import views

urlpatterns = [
    # Category endpoints
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),

    # Note search endpoint (must be before <int:pk>/ to avoid conflicts)
    path('search/', views.NoteSearchView.as_view(), name='note-search'),

    # Note list/create endpoint
    path('', views.NoteListCreateView.as_view(), name='note-list-create'),

    # Share link endpoints
    path('<int:pk>/share/', views.ShareLinkCreateView.as_view(), name='note-share-create'),
    path('share/<str:token>/', views.ShareLinkPublicView.as_view(), name='note-share-public'),

    # Note detail endpoint (Retrieve / Update / Delete)
    path('<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
]
