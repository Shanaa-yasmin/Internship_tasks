# 🛍️ E-Commerce Backend API

A production-ready REST API built with **Django 4.2** + **Django REST Framework** featuring JWT auth, advanced filtering, ORM aggregations, pagination, multi-image upload with auto-thumbnails, and a comprehensive test suite.

---

## 🗂️ Project Structure

```
ecommerce_project/
├── manage.py
├── requirements.txt
├── pytest.ini                              # pytest configuration
├── .coveragerc                             # Coverage configuration
├── EcommerceAPI.postman_collection.json    # Original Postman collection
├── EcommerceAPI_Week11_Tests.postman_collection.json  # Week 11 test collection
├── ecommerce_project/          # Django project config
│   ├── __init__.py
│   ├── settings.py             # All settings incl. DRF + JWT + Pagination
│   ├── urls.py                 # Root URL conf (JWT routes live here)
│   └── wsgi.py
└── api/                        # Main application
    ├── __init__.py
    ├── apps.py
    ├── admin.py                # Django admin registrations
    ├── models.py               # Category, Product, ProductImage, Cart, CartItem
    ├── serializers.py          # All DRF serializers + validation
    ├── views.py                # ViewSets + custom actions + image management
    ├── filters.py              # ProductFilter (price range, category, stock)
    ├── pagination.py           # StandardPagination, SmallPagination
    ├── urls.py                 # DRF Router routes
    └── tests.py                # ✅ Full test suite (110 tests, 80%+ coverage)
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

### Product Image Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/products/{id}/upload-images/` | Yes | Upload 1–10 images (JPEG/PNG/WEBP, max 5MB each) |
| GET    | `/api/products/{id}/images/` | No | List all images + thumbnail URLs |
| DELETE | `/api/products/{id}/images/{img_id}/` | Yes | Delete a single image |
| PATCH  | `/api/products/{id}/set-primary-image/` | Yes | Set primary image `{ "image_id": 5 }` |
| PATCH  | `/api/products/{id}/reorder-images/` | Yes | Reorder images `{ "order": [3, 1, 2] }` |

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

## 🖼️ Image Upload

Upload multiple product images in one request:

```http
POST /api/products/{id}/upload-images/
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: file1.jpg
images: file2.png
is_primary: true
```

**Constraints:**
- Allowed types: JPEG, PNG, WEBP
- Max size: 5 MB per file
- Max images per product: 10
- Thumbnails (300×300 px) are auto-generated using Pillow

**Response:**
```json
{
  "uploaded": 2,
  "images": [
    {
      "id": 1,
      "image_url": "http://127.0.0.1:8000/media/products/1/original/file1.jpg",
      "thumbnail_url": "http://127.0.0.1:8000/media/products/1/thumbnails/thumb_file1.jpg",
      "is_primary": true,
      "alt_text": "",
      "order": 0,
      "uploaded_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

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
                                  └── ProductImage
```

### Key design decisions

- `Category.products` is protected from deletion if products exist (`on_delete=PROTECT`)
- `CartItem` has a `unique_together` constraint on `(cart, product)` — duplicate products are merged by incrementing quantity
- All `DecimalField` prices use `max_digits=10, decimal_places=2`
- Timestamps use `auto_now_add` / `auto_now` for auditability
- `ProductImage` auto-generates 300×300 JPEG thumbnails via Pillow on save

---

## 🧪 Testing (Week 11)

### Install test dependencies

```bash
pip install pytest pytest-django coverage
```

### Run all tests

```bash
coverage run -m pytest api/tests.py -v
```

### View coverage report

```bash
# Terminal summary
coverage report -m

# Full HTML report (open htmlcov/index.html in browser)
coverage html
start htmlcov/index.html      # Windows
```

### Test coverage summary

| Module | Coverage |
|--------|----------|
| `models.py` | ~91% |
| `serializers.py` | ~88% |
| `views.py` | ~88% |
| `filters.py` | ~95% |
| `pagination.py` | ~87% |
| **Overall** | **≥ 80% ✅** |

### What's tested (110 tests)

| Category | Tests |
|----------|-------|
| Model unit tests | Category, Product, Cart, CartItem, ProductImage |
| Serializer unit tests | Validation, password mismatch, price/stock errors, image limits |
| View/API tests | All endpoints — auth, permissions, CRUD, edge cases |
| Filter tests | min_price, max_price, category, in_stock, combined |
| Pagination tests | Page size, metadata, SmallPagination |
| Mocked external API | Pillow thumbnail generation mocked (PIL.Image.open) |
| Integration tests | Full register → login → browse → cart → total → remove flow |

### Run Postman integration tests

1. Open Postman → Import → `EcommerceAPI_Week11_Tests.postman_collection.json`
2. Start the server: `python manage.py runserver`
3. Use **Collection Runner** to run all 20 requests in order
4. JWT token and IDs are automatically set via test scripts

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