from rest_framework import permissions
from .models import User

class IsAdmin(permissions.BasePermission):
    """Allows access only to Administrators or superusers."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == User.Role.ADMIN or request.user.is_superuser)
        )


class IsRecruiterOrAdmin(permissions.BasePermission):
    """Allows access to Recruiters and Administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in [User.Role.RECRUITER, User.Role.ADMIN] or request.user.is_superuser)
        )
