from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import User


class RoleMiddleware:
    """
    Middleware that restricts access to /api/admin/* routes to users with role='admin'.

    Flow:
    1. Only intercepts requests to ADMIN_PREFIXES.
    2. Extracts and validates the JWT Bearer token from the Authorization header.
    3. Checks the 'role' claim embedded in the token.
    4. Rejects with 403 if role != 'admin'.
    """

    ADMIN_PREFIXES = ["/api/admin/"]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if self._is_admin_route(request.path):
            response = self._check_admin_role(request)
            if response:
                return response
        return self.get_response(request)

    def _is_admin_route(self, path):
        return any(path.startswith(prefix) for prefix in self.ADMIN_PREFIXES)

    def _check_admin_role(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return JsonResponse(
                {"error": "Authentication credentials were not provided."},
                status=401,
            )

        raw_token = auth_header.split(" ", 1)[1]
        try:
            token = AccessToken(raw_token)
            role = token.get("role")
        except (TokenError, InvalidToken) as e:
            return JsonResponse({"error": f"Invalid or expired token: {str(e)}"}, status=401)

        if role != "admin":
            return JsonResponse(
                {"error": "Access denied. Admin role required."},
                status=403,
            )

        # Optionally attach the decoded user to request for downstream use
        try:
            request.token_user_id = token["user_id"]
            request.token_role = role
        except KeyError:
            pass

        return None  # Proceed to the next middleware / view
