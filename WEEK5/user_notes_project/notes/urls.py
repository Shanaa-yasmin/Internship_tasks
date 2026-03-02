"""
URL configuration for the Notes app.

Routes:
- /          → List all notes (GET) / Create a note (POST)
- /<int:pk>/ → Retrieve / Update / Delete a specific note
"""

from django.urls import path
from . import views

urlpatterns = [
    # List all notes for the user / Create a new note
    path('', views.NoteListCreateView.as_view(), name='note-list-create'),

    # Retrieve / Update / Delete a specific note by ID
    path('<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
]
