import random
import string
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTP
from .serializers import RegisterSerializer, LoginSerializer, OTPVerifySerializer, UserSerializer


def generate_otp(length=6):
    return "".join(random.choices(string.digits, k=length))


def send_otp_email(email, otp_code):
    subject = "Your Login OTP"
    body = (
        f"Your one-time password (OTP) is: {otp_code}\n\n"
        f"This OTP is valid for 5 minutes. Do not share it with anyone."
    )

    msg = MIMEMultipart()
    msg['From'] = settings.EMAIL_HOST_USER
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Bypass SSL certificate verification — fixes Python 3.14 Windows SSL bug
    context = ssl._create_unverified_context()

    with smtplib.SMTP_SSL(
        settings.EMAIL_HOST,
        settings.EMAIL_PORT,
        context=context
    ) as server:
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        server.sendmail(settings.EMAIL_HOST_USER, email, msg.as_string())


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if user.is_locked():
        return Response(
            {"error": "Account is temporarily locked. Please try again after 10 minutes."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not user.check_password(password):
        user.increment_failed_attempts()
        remaining = max(0, 5 - user.failed_attempts)
        if user.is_locked():
            return Response(
                {"error": "Account locked after 5 failed attempts. Try again in 10 minutes."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(
            {"error": "Invalid email or password.", "attempts_remaining": remaining},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response({"error": "Account is inactive."}, status=status.HTTP_403_FORBIDDEN)

    # Invalidate existing unused OTPs
    OTP.objects.filter(user=user, is_used=False).update(is_used=True)

    # Generate and save new OTP
    otp_code = generate_otp()
    OTP.objects.create(user=user, otp=otp_code)

    # Send OTP email
    try:
        send_otp_email(user.email, otp_code)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Failed to send OTP email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {"message": f"OTP sent to {email}. Valid for 5 minutes."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    otp_code = serializer.validated_data["otp"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.is_locked():
        return Response(
            {"error": "Account is temporarily locked. Please try again after 10 minutes."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        otp_obj = OTP.objects.filter(user=user, is_used=False).latest("created_at")
    except OTP.DoesNotExist:
        return Response(
            {"error": "No active OTP found. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp_obj.is_expired():
        otp_obj.is_used = True
        otp_obj.save()
        return Response(
            {"error": "OTP has expired. Please login again to receive a new OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp_obj.otp != otp_code:
        user.increment_failed_attempts()
        if user.is_locked():
            return Response(
                {"error": "Account locked after 5 failed attempts. Try again in 10 minutes."},
                status=status.HTTP_403_FORBIDDEN,
            )
        remaining = max(0, 5 - user.failed_attempts)
        return Response(
            {"error": "Invalid OTP.", "attempts_remaining": remaining},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_obj.is_used = True
    otp_obj.save()
    user.reset_failed_attempts()

    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    refresh["email"] = user.email

    return Response(
        {
            "message": "Login successful.",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    users = User.objects.all().values("id", "email", "role", "is_active", "failed_attempts", "date_joined")
    return Response(
        {
            "message": "Admin dashboard",
            "total_users": User.objects.count(),
            "users": list(users),
        }
    )