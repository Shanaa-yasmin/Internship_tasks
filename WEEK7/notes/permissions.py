"""
Custom permissions for the Notes app.

IsOwner: Ensures that only the owner of a note can view, update, or delete it.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission: Only the owner of a note can access it.

    - Used as an object-level permission in DRF views.
    - Returns 403 Forbidden if the requesting user is not the note's owner.
    """

    message = "You do not have permission to access this note."

    def has_object_permission(self, request, view, obj):
        """
        Check if request.user is the owner of the note object.
        
        Args:
            request: The incoming HTTP request.
            view: The DRF view handling the request.
            obj: The Note instance being accessed.
        
        Returns:
            True if the user owns the note, False otherwise (→ 403).
        """
        return obj.owner == request.user
