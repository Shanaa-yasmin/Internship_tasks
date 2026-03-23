import bcrypt
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Account lockout fields
    failed_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def set_password(self, raw_password):
        """Hash password using bcrypt."""
        hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt())
        self.password = hashed.decode("utf-8")

    def check_password(self, raw_password):
        """Verify password against bcrypt hash."""
        return bcrypt.checkpw(raw_password.encode("utf-8"), self.password.encode("utf-8"))

    def is_locked(self):
        """Check if account is currently locked."""
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        if self.locked_until and timezone.now() >= self.locked_until:
            # Auto-unlock: reset on expiry
            self.locked_until = None
            self.failed_attempts = 0
            self.save(update_fields=["locked_until", "failed_attempts"])
        return False

    def increment_failed_attempts(self):
        """Increment failed attempts and lock after 5."""
        self.failed_attempts += 1
        if self.failed_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=10)
        self.save(update_fields=["failed_attempts", "locked_until"])

    def reset_failed_attempts(self):
        """Reset failed attempt counter on successful auth."""
        self.failed_attempts = 0
        self.locked_until = None
        self.save(update_fields=["failed_attempts", "locked_until"])

    def __str__(self):
        return self.email


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def is_expired(self):
        """OTP expires after 5 minutes."""
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"OTP for {self.user.email} at {self.created_at}"
