🛍️ E-Commerce Backend API

A production-ready REST API built with Django REST Framework for an e-commerce application. It supports JWT authentication, product & category management, cart operations, image uploads with thumbnails, advanced filtering, pagination, and PostgreSQL deployment support.

✨ Features
🔐 JWT Authentication (SimpleJWT)
👤 User Registration & Login
📦 Product CRUD APIs
🗂️ Category CRUD APIs
🛒 Cart system (add/remove items, total calculation)
🖼️ Multiple product image uploads
🧠 Auto-generated thumbnails using Pillow
🔍 Search, filtering & ordering (django-filter)
📄 Pagination support
📊 Aggregation APIs (product & category stats)
🐘 PostgreSQL-ready configuration
🧪 Postman collection for API testing
🧰 Tech Stack
Python 3.x
Django 4.x
Django REST Framework
PostgreSQL
SimpleJWT (Authentication)
Pillow (Image processing)
django-filter
WhiteNoise (Static files)
Gunicorn (Production server)
📁 Project Structure
WEEK12New/
└── ecommerce_project/
    ├── manage.py
    ├── requirements.txt
    ├── ecommerce_project/
    └── api/
⚙️ Quick Setup (Local Development)
# 1. Clone repository
git clone <your-repo-url>
cd Internship_tasks/WEEK12New/ecommerce_project

# 2. Create virtual environment
python -m venv venv

# 3. Activate environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Run server
python manage.py runserver
🔑 Environment Variables (.env)

Create a .env file inside ecommerce_project/:

SECRET_KEY=your_secret_key
DEBUG=True

ALLOWED_HOSTS=127.0.0.1,localhost

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgres://user:password@host:port/dbname
🌐 API Base URL
Local:
http://127.0.0.1:8000/api/
Production:
https://your-app.onrender.com/api/
📮 Postman Collection

A Postman collection is included in the project:

EcommerceAPI.postman_collection.json

👉 Import it into Postman to test all endpoints easily.

🚀 Deployment Guide (Render)
1. Push Code to GitHub

Ensure your project is committed inside:

WEEK12New/ecommerce_project
2. Create Render Web Service
Connect GitHub repo
Select project folder
3. Build & Start Commands

Build Command:

pip install -r requirements.txt

Start Command:

gunicorn ecommerce_project.wsgi:application --bind 0.0.0.0:$PORT
4. Environment Variables (Render Dashboard)

Set:

SECRET_KEY
DEBUG=False
ALLOWED_HOSTS
DATABASE_URL
5. PostgreSQL Setup
Use Render PostgreSQL OR external DB
Attach database to service
Run migrations after deployment
python manage.py migrate
python manage.py collectstatic --noinput
6. Static & Media Files
Static files handled using WhiteNoise
For production media storage, use AWS S3 (recommended)
⚠️ Common Issues
❌ 404 on / → normal (no homepage route defined)
❌ Static files missing → run collectstatic
❌ DB error → check DATABASE_URL
❌ Render crash → check Gunicorn start command
📊 Testing
Postman collection available for manual API testing
Includes full workflow: Auth → Products → Cart → Checkout logic
Automated tests included in project (tests.py)
🗃️ Database Schema
User → Cart → CartItem → Product → Category
                         ↳ ProductImage
🎯 Summary

This project demonstrates:

Backend API design using Django REST Framework
Secure authentication using JWT
Scalable e-commerce architecture
Real-world deployment setup (Render + PostgreSQL)
Image processing + storage handling
Production-ready backend structure
👨‍💻 Author

Shana Yasmin
BTech CSE (KTU)