# User Notes REST API

A production-ready REST API for managing user notes, built with **Django**, **Django REST Framework**, **MySQL**, and **JWT authentication**.

---

## Features

- **JWT Authentication** (access + refresh tokens via SimpleJWT)
- **bcrypt password hashing** (configured as primary hasher)
- **User registration & login**
- **Token blacklisting** for secure logout
- **Full CRUD** for notes (Create, Read, Update, Delete)
- **User-specific access control** — users can only access their own notes
- **MySQL** database backend
- **Environment variable** configuration for secrets
- **Proper HTTP status codes** and JSON responses
- **Input validation** via DRF serializers

---

## Tech Stack

| Component        | Technology                          |
|------------------|-------------------------------------|
| Framework        | Django 4.2                          |
| REST Framework   | Django REST Framework 3.14          |
| Authentication   | djangorestframework-simplejwt 5.3   |
| Database         | MySQL 8.0+                          |
| Password Hashing | bcrypt (via Django's BCryptSHA256)  |
| Environment      | python-decouple                     |

---

## Project Structure

```
user_notes_project/
│
├── user_notes_project/          # Django project configuration
│   ├── __init__.py
│   ├── settings.py              # Main settings (DB, JWT, bcrypt, etc.)
│   ├── urls.py                  # Root URL routing
│   ├── wsgi.py
│   └── asgi.py
│
├── accounts/                    # Authentication app
│   ├── __init__.py
│   ├── apps.py
│   ├── serializers.py           # Register, Login, Logout serializers
│   ├── views.py                 # Register, Login, Logout, Profile views
│   └── urls.py                  # Auth URL routes
│
├── notes/                       # Notes CRUD app
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py                # Note model (FK → User)
│   ├── serializers.py           # Note serializer with validation
│   ├── views.py                 # List, Create, Retrieve, Update, Delete
│   ├── permissions.py           # IsOwner custom permission
│   ├── admin.py                 # Admin registration
│   └── urls.py                  # Notes URL routes
│
├── .env                         # Environment variables (DO NOT COMMIT)
├── requirements.txt             # Python dependencies
├── manage.py                    # Django management script
└── README.md                    # This file
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- MySQL 8.0+ (running locally or remotely)
- pip (Python package manager)

### 1. Clone the Repository

```bash
cd user_notes_project
```

### 2. Create a Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create the MySQL Database

Open MySQL shell and run:

```sql
CREATE DATABASE user_notes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Configure Environment Variables

Edit the `.env` file with your MySQL credentials:

```env
SECRET_KEY=your-super-secret-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=user_notes_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start the Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

---

## API Endpoints

### Authentication (`/api/accounts/`)

| Method | Endpoint                        | Description              | Auth Required |
|--------|---------------------------------|--------------------------|:------------:|
| POST   | `/api/accounts/register/`       | Register a new user      | No           |
| POST   | `/api/accounts/login/`          | Login (get JWT tokens)   | No           |
| POST   | `/api/accounts/logout/`         | Logout (blacklist token) | Yes          |
| POST   | `/api/accounts/token/refresh/`  | Refresh access token     | No           |
| GET    | `/api/accounts/profile/`        | Get user profile         | Yes          |

### Notes (`/api/notes/`)

| Method | Endpoint              | Description        | Auth Required |
|--------|-----------------------|--------------------|:------------:|
| GET    | `/api/notes/`         | List user's notes  | Yes          |
| POST   | `/api/notes/`         | Create a new note  | Yes          |
| GET    | `/api/notes/{id}/`    | Get a single note  | Yes (owner)  |
| PUT    | `/api/notes/{id}/`    | Update a note      | Yes (owner)  |
| PATCH  | `/api/notes/{id}/`    | Partial update     | Yes (owner)  |
| DELETE | `/api/notes/{id}/`    | Delete a note      | Yes (owner)  |

---

## JWT Usage

### Getting Tokens (Login)

```bash
POST /api/accounts/login/
Content-Type: application/json

{
    "username": "john_doe",
    "password": "SecureP@ss123"
}
```

**Response:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLC...",
    "access": "eyJ0eXAiOiJKV1QiLC..."
}
```

### Using the Access Token

Add the token to the `Authorization` header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...
```

### Refreshing the Access Token

When the access token expires (after 30 minutes):

```bash
POST /api/accounts/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

### Logging Out

```bash
POST /api/accounts/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

---

## Sample Postman Test Requests

### 1. Register a New User

```
POST http://127.0.0.1:8000/api/accounts/register/
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestP@ss123!",
    "password2": "TestP@ss123!"
}
```

**Expected Response (201 Created):**
```json
{
    "message": "User registered successfully.",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    },
    "tokens": {
        "refresh": "eyJ...",
        "access": "eyJ..."
    }
}
```

### 2. Login

```
POST http://127.0.0.1:8000/api/accounts/login/
Content-Type: application/json

{
    "username": "testuser",
    "password": "TestP@ss123!"
}
```

**Expected Response (200 OK):**
```json
{
    "refresh": "eyJ...",
    "access": "eyJ..."
}
```

### 3. Create a Note

```
POST http://127.0.0.1:8000/api/notes/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "title": "My First Note",
    "content": "This is the content of my first note."
}
```

**Expected Response (201 Created):**
```json
{
    "message": "Note created successfully.",
    "note": {
        "id": 1,
        "title": "My First Note",
        "content": "This is the content of my first note.",
        "owner": "testuser",
        "created_at": "2026-03-02T10:00:00Z",
        "updated_at": "2026-03-02T10:00:00Z"
    }
}
```

### 4. Get All Notes

```
GET http://127.0.0.1:8000/api/notes/
Authorization: Bearer <access_token>
```

**Expected Response (200 OK):**
```json
[
    {
        "id": 1,
        "title": "My First Note",
        "content": "This is the content of my first note.",
        "owner": "testuser",
        "created_at": "2026-03-02T10:00:00Z",
        "updated_at": "2026-03-02T10:00:00Z"
    }
]
```

### 5. Get Single Note

```
GET http://127.0.0.1:8000/api/notes/1/
Authorization: Bearer <access_token>
```

### 6. Update a Note

```
PUT http://127.0.0.1:8000/api/notes/1/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "title": "Updated Note Title",
    "content": "Updated content here."
}
```

**Expected Response (200 OK):**
```json
{
    "message": "Note updated successfully.",
    "note": {
        "id": 1,
        "title": "Updated Note Title",
        "content": "Updated content here.",
        "owner": "testuser",
        "created_at": "2026-03-02T10:00:00Z",
        "updated_at": "2026-03-02T10:05:00Z"
    }
}
```

### 7. Delete a Note

```
DELETE http://127.0.0.1:8000/api/notes/1/
Authorization: Bearer <access_token>
```

**Expected Response (200 OK):**
```json
{
    "message": "Note deleted successfully."
}
```

### 8. Logout

```
POST http://127.0.0.1:8000/api/accounts/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "refresh": "<refresh_token>"
}
```

### 9. Access Without Token (401)

```
GET http://127.0.0.1:8000/api/notes/
```

**Expected Response (401 Unauthorized):**
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 10. Access Another User's Note (403)

```
GET http://127.0.0.1:8000/api/notes/999/
Authorization: Bearer <other_user_access_token>
```

**Expected Response (404 Not Found):**
```json
{
    "detail": "Not found."
}
```

---

## HTTP Status Codes

| Code | Meaning       | When                                    |
|------|---------------|-----------------------------------------|
| 200  | OK            | Successful GET, PUT, PATCH, DELETE       |
| 201  | Created       | Successful POST (register, create note)  |
| 400  | Bad Request   | Validation errors, invalid token         |
| 401  | Unauthorized  | Missing or invalid JWT token             |
| 403  | Forbidden     | Accessing another user's note            |
| 404  | Not Found     | Note does not exist                      |

---

## Security Features

- **bcrypt** password hashing (primary hasher)
- **JWT tokens** with 30-minute access token expiry
- **Token blacklisting** on logout
- **Owner-only access** to notes (custom IsOwner permission)
- **No password exposure** in any API response
- **CORS** configuration for frontend integration
- **Strict SQL mode** for MySQL
- **Environment variable** secrets (never hardcoded)
- **Django password validators** enforced on registration

---

## License

This project is for educational purposes.
