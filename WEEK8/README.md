# Django REST Framework Authentication System

## Features
- User registration with bcrypt password hashing
- Login with OTP via Gmail SMTP
- OTP verification with 5-minute expiry
- JWT tokens with role claim
- Account lockout (5 failed attempts → 10-minute lock)
- Role-based access (admin/user) via middleware

---

## Quick Setup

### 1. Install Dependencies
```bash
pip install djangorestframework djangorestframework-simplejwt bcrypt django
```

### 2. Project Structure
```
your_project/
├── your_app/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── middleware.py
│   └── urls.py
├── your_project/
│   ├── settings.py     ← paste settings_snippet.py contents
│   └── urls.py         ← include('your_app.urls')
└── manage.py
```

### 3. Update settings.py
Copy the contents of `settings_snippet.py` into your project's `settings.py`.
Replace `your_app_name` with your actual Django app name.

### 4. Set Environment Variables
```bash
export GMAIL_USER="youremail@gmail.com"
export GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"   # Gmail App Password (not your Gmail password)
```

To generate a Gmail App Password:
1. Enable 2-Step Verification on your Google account
2. Go to: Google Account → Security → App Passwords
3. Generate a password for "Mail" / "Other"

### 5. Run Migrations
```bash
python manage.py makemigrations your_app_name
python manage.py migrate
```

### 6. Include URLs
In your project's `urls.py`:
```python
from django.urls import path, include

urlpatterns = [
    path("", include("your_app_name.urls")),
]
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | None | Register new user |
| POST | `/api/auth/login/` | None | Verify password, send OTP |
| POST | `/api/auth/verify-otp/` | None | Verify OTP, get JWT |
| POST | `/api/auth/token/refresh/` | None | Refresh access token |
| GET | `/api/auth/profile/` | Bearer token | Get own profile |
| GET | `/api/admin/dashboard/` | Bearer (admin) | Admin-only dashboard |

---

## Account Lockout Logic

- **5 failed** login or OTP attempts → account locked for **10 minutes**
- Lock auto-expires; next request after expiry resets the counter
- Successful auth resets the failed attempt counter

---

## Postman
Import `postman_collection.json` into Postman.
The "Verify OTP" request auto-saves tokens to collection variables.
