"""
Views for User Authentication.

Endpoints:
- POST /api/accounts/register/  → Register a new user
- POST /api/accounts/login/     → Obtain JWT token pair (access + refresh)
- POST /api/accounts/logout/    → Blacklist refresh token
- POST /api/accounts/token/refresh/ → Refresh access token
- GET  /api/accounts/profile/   → Get current user profile
"""

from django.contrib.auth.models import User
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer, LogoutSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/accounts/register/
    
    Register a new user account.
    
    Request body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "SecureP@ss123",
        "password2": "SecureP@ss123"
    }
    
    Returns:
    - 201: User created successfully with user data and tokens
    - 400: Validation errors (duplicate email, weak password, etc.)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)  # Registration is open to everyone

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly registered user
        # so they are immediately authenticated after registration
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    
    Logout by blacklisting the refresh token.
    The access token will expire naturally after 30 minutes.
    
    Request body:
    {
        "refresh": "<refresh_token>"
    }
    
    Returns:
    - 200: Successfully logged out
    - 400: Invalid or already blacklisted token
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Get the refresh token and blacklist it
            refresh_token = RefreshToken(serializer.validated_data['refresh'])
            refresh_token.blacklist()

            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {"error": "Invalid or expired token.", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/accounts/profile/
    
    Retrieve the authenticated user's profile.
    
    Returns:
    - 200: User profile data (id, username, email, date_joined)
    - 401: Not authenticated
    """
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        """Return the currently authenticated user."""
        return self.request.user
