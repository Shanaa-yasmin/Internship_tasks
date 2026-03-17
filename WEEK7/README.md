User Notes REST API

A secure REST API for managing personal notes with JWT authentication, built using Django and Django REST Framework.
Includes advanced features like categories, tags, search, filtering, and public shareable links with expiration and access tracking.

🚀 Features

JWT Authentication (access + refresh tokens)

User registration, login, logout (token blacklisting)

Full CRUD for notes (Create, Read, Update, Delete)

User-specific access control (owner-only)

Categories and tags support

Filtering by category or tag

Search notes by title or content

Public shareable links with:

Unique token-based URLs

Optional expiration date

Access count tracking

Secure password hashing using bcrypt

MySQL database integration

Environment variable configuration

Proper HTTP status codes and JSON responses

🛠 Tech Stack
Component	Technology
Framework	Django 4.2
REST Framework	Django REST Framework 3.14
Authentication	SimpleJWT
Database	MySQL 8.0+
Password Hashing	BCryptSHA256
Environment	python-decouple
📁 Project Structure
user_notes_project/
│
├── user_notes_project/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── accounts/
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── notes/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   └── urls.py
│
├── .env
├── requirements.txt
├── manage.py
└── README.md
⚙️ Setup (Quick)
# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start server
python manage.py runserver

API Base URL:

http://127.0.0.1:8000/
🔐 Authentication Endpoints (/api/accounts/)
Method	Endpoint	Description	Auth
POST	/register/	Register user	No
POST	/login/	Get JWT tokens	No
POST	/logout/	Logout (blacklist)	Yes
POST	/token/refresh/	Refresh access token	No
GET	/profile/	User profile	Yes
📝 Notes Endpoints (/api/notes/)
Method	Endpoint	Description	Auth
GET	/	List notes	Yes
POST	/	Create note	Yes
GET	/{id}/	Retrieve note	Yes
PUT	/{id}/	Update note	Yes
PATCH	/{id}/	Partial update	Yes
DELETE	/{id}/	Delete note	Yes
GET	/search/?q=keyword	Search notes	Yes
🗂 Categories (/api/notes/categories/)
Method	Endpoint	Description
GET	/	List categories
POST	/	Create category
🔗 Share Links (Key Feature)
Method	Endpoint	Description	Auth
POST	/api/notes/{id}/share/	Create share link	Yes
GET	/api/notes/share/{token}/	Access shared note	No
✨ How it works

A unique token is generated using UUID.

A public URL is created:

/api/notes/share/{token}/

Optional expiration date can be set.

Access count is incremented on each visit.

📌 Sample Requests
Create Note
POST /api/notes/
Authorization: Bearer <access_token>

{
  "title": "Reminder",
  "content": "Buy groceries"
}
Create Share Link
POST /api/notes/12/share/
Authorization: Bearer <access_token>

{
  "expires_at": "2026-03-20T12:00:00Z"
}
Public Access
GET /api/notes/share/3942ca0a75004c1d84a876280442ecae/
📊 HTTP Status Codes
Code	Meaning
200	OK
201	Created
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
410	Gone (Expired link)
🔒 Security Features

bcrypt password hashing

JWT authentication with expiry

Token blacklisting on logout

Owner-only data access

No sensitive data exposure

Environment-based configuration

🧪 Testing

Tested using Postman

Collection supports:

JWT authentication

CRUD operations

Share link generation

Public access via token

Dynamic variables used for token handling

📌 Key Highlight

Implemented a secure public sharing system using token-based URLs with expiration and access tracking.

📄 License

This project is for educational purposes.