# 🛍️ E-Commerce Backend API

A production-ready REST API built with **Django 4.2** + **Django REST Framework** featuring JWT auth, advanced filtering, ORM aggregations, and pagination.

---

## 🗂️ Project Structure

```
ecommerce_project/
├── manage.py
├── requirements.txt
├── EcommerceAPI.postman_collection.json
├── ecommerce_project/          # Django project config
│   ├── __init__.py
│   ├── settings.py             # All settings incl. DRF + JWT + Pagination
│   ├── urls.py                 # Root URL conf (JWT routes live here)
│   └── wsgi.py
└── api/                        # Main application
    ├── __init__.py
    ├── apps.py
    ├── admin.py                # Django admin registrations
    ├── models.py               # Category, Product, Cart, CartItem
    ├── serializers.py          # All DRF serializers + validation
    ├── views.py                # ViewSets + custom actions
    ├── filters.py              # ProductFilter (price range, category, stock)
    ├── pagination.py           # StandardPagination, SmallPagination
    └── urls.py                 # DRF Router routes
```

---

## ⚡ Quick Start

### 1. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Apply migrations

```bash
python manage.py migrate
```

### 4. Create a superuser (for admin panel)

```bash
python manage.py createsuperuser
```

### 5. Run the development server

```bash
python manage.py runserver
```

API is now live at **http://127.0.0.1:8000**

---

## 🔑 Authentication

This API uses **JWT (JSON Web Tokens)** via `djangorestframework-simplejwt`.

### Register a new account

```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "password2": "StrongPass123!"
}
```

### Login to get tokens

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "StrongPass123!"
}
```

**Response:**
```json
{
  "access":  "eyJhbGciOiJIUzI1NiIsInR...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

Use the `access` token in all subsequent requests:
```
Authorization: Bearer <access_token>
```

---

## 📡 API Endpoints

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/categories/` | No | List all categories (with product count & avg price) |
| POST   | `/api/categories/` | Yes | Create category |
| GET    | `/api/categories/{id}/` | No | Get single category |
| PUT    | `/api/categories/{id}/` | Yes | Update category |
| PATCH  | `/api/categories/{id}/` | Yes | Partial update |
| DELETE | `/api/categories/{id}/` | Yes | Delete category |
| GET    | `/api/categories/stats/` | No | **Aggregation** — stats per category |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/products/` | No | List products (search + filter + paginate) |
| POST   | `/api/products/` | Yes | Create product |
| GET    | `/api/products/{id}/` | No | Get single product |
| PUT    | `/api/products/{id}/` | Yes | Update product |
| PATCH  | `/api/products/{id}/` | Yes | Partial update |
| DELETE | `/api/products/{id}/` | Yes | Delete product |
| GET    | `/api/products/stats/` | No | **Aggregation** — overall + per-category stats |
| GET    | `/api/products/{id}/related/` | No | Other products in the same category |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/cart/` | Yes | List user's carts |
| POST   | `/api/cart/` | Yes | Create new cart |
| GET    | `/api/cart/{id}/` | Yes | Get cart with all items |
| DELETE | `/api/cart/{id}/` | Yes | Delete cart |
| POST   | `/api/cart/add-item/` | Yes | Add/increment item in cart |
| POST   | `/api/cart/remove-item/` | Yes | Remove item from cart |
| GET    | `/api/cart/{id}/total/` | Yes | **Aggregation** — cart value breakdown |

---

## 🔍 Filtering & Search

Products support rich query parameters:

```
# Search by name or description
GET /api/products/?search=phone

# Filter by category ID
GET /api/products/?category=2

# Price range
GET /api/products/?min_price=100&max_price=1000

# In-stock only
GET /api/products/?in_stock=true

# Sort by price ascending
GET /api/products/?ordering=price

# Sort by newest
GET /api/products/?ordering=-created_at

# Combined
GET /api/products/?search=samsung&category=1&min_price=200&max_price=800&ordering=price&page=1&page_size=5
```

---

## 📄 Pagination

All list endpoints return paginated results:

```json
{
  "pagination": {
    "total_items": 42,
    "total_pages": 5,
    "current_page": 1,
    "page_size": 10,
    "next": "http://127.0.0.1:8000/api/products/?page=2",
    "previous": null
  },
  "results": [ ... ]
}
```

Override page size with `?page_size=N` (max 100).

---

## 📊 Example API Responses

### GET /api/categories/stats/

```json
{
  "summary": {
    "total_products": 25,
    "overall_avg_price": "349.99"
  },
  "per_category": [
    {
      "id": 1,
      "name": "Electronics",
      "product_count": 12,
      "avg_price": "599.99",
      "total_stock": 240
    },
    {
      "id": 2,
      "name": "Books",
      "product_count": 13,
      "avg_price": "24.99",
      "total_stock": 500
    }
  ]
}
```

### GET /api/products/stats/

```json
{
  "overall": {
    "total_products": 25,
    "avg_price": "349.99",
    "min_price": "9.99",
    "max_price": "1299.00",
    "total_stock": 740
  },
  "per_category": [
    { "id": 1, "name": "Electronics", "product_count": 12, "avg_price": "599.99" }
  ],
  "low_stock_warnings": [
    { "id": 5, "name": "Wireless Mouse", "stock": 3 }
  ]
}
```

### GET /api/cart/{id}/total/

```json
{
  "cart_id": 1,
  "item_count": 2,
  "items": [
    {
      "id": 1,
      "product__id": 3,
      "product__name": "Samsung Galaxy S24",
      "product__price": "799.99",
      "quantity": 2,
      "subtotal": "1599.98"
    },
    {
      "id": 2,
      "product__id": 7,
      "product__name": "AirPods Pro",
      "product__price": "249.00",
      "quantity": 1,
      "subtotal": "249.00"
    }
  ],
  "grand_total": "1848.98"
}
```

### POST /api/cart/add-item/ — stock validation error

```json
{
  "quantity": [
    "Cannot add 10 unit(s). Only 3 more unit(s) available."
  ]
}
```

---

## 🗃️ Database Schema

```
User (Django built-in)
 └── Cart  ──>  CartItem  ──>  Product  ──>  Category
```

### Key design decisions

- `Category.products` is protected from deletion if products exist (`on_delete=PROTECT`)
- `CartItem` has a `unique_together` constraint on `(cart, product)` — duplicate products are merged by incrementing quantity
- All `DecimalField` prices use `max_digits=10, decimal_places=2`
- Timestamps use `auto_now_add` / `auto_now` for auditability

---

## 🔧 PostgreSQL Setup (optional)

Install the driver:
```bash
pip install psycopg2-binary
```

Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ecommerce_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Then run migrations:
```bash
python manage.py migrate
```

---

## 🧪 Running with Postman

1. Import `EcommerceAPI.postman_collection.json` into Postman
2. The **Login** request automatically saves the JWT to the collection variable `access_token`
3. All authenticated requests use `{{access_token}}` in the Authorization header
4. Update `{{category_id}}`, `{{product_id}}`, `{{cart_id}}` variables as you create resources
