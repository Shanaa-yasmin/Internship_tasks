"""
Serializers for User Authentication.

Handles:
- User registration with validation
- Login response (handled by SimpleJWT's TokenObtainPairSerializer)
- Logout (refresh token blacklisting)
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Validates:
    - Email is unique and required
    - Password meets Django's password validation rules
    - Password confirmation matches
    - Username is unique
    
    The password is hashed automatically via Django's User.set_password(),
    which uses bcrypt as configured in PASSWORD_HASHERS.
    """

    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=User.objects.all(),
            message="A user with this email already exists."
        )]
    )
    password = serializers.CharField(
        write_only=True,        # Never include password in responses
        required=True,
        validators=[validate_password],  # Apply Django's password validators
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label="Confirm Password"
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2')
        extra_kwargs = {
            'username': {
                'validators': [UniqueValidator(
                    queryset=User.objects.all(),
                    message="A user with this username already exists."
                )]
            }
        }

    def validate(self, attrs):
        """Ensure the two password fields match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        """
        Create a new user with a hashed password.
        
        Uses Django's create_user() which internally calls set_password(),
        hashing the password with bcrypt (our primary PASSWORD_HASHER).
        """
        # Remove password2 since it's only for validation
        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],  # Hashed by create_user()
        )
        return user


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout endpoint.
    
    Accepts the refresh token and blacklists it,
    preventing further use of the token pair.
    """
    refresh = serializers.CharField(
        required=True,
        help_text="The refresh token to blacklist."
    )


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for user profile data.
    Never exposes the password field.
    """

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
        read_only_fields = fields  # All fields are read-only
