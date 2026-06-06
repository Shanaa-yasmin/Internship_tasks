# 🛍️ Shelf — React Product Admin Dashboard

A modern, production-ready product management dashboard built with React, Tailwind CSS, and Axios. Features a clean dark sidebar, CRUD operations, image upload with progress tracking, and a fully responsive layout.

---

## ✨ Features

- 📦 **Product CRUD** — Add, edit, and delete products
- 🖼️ **Image Upload** — Drag & drop or click to upload with live preview
- 📊 **Progress Bar** — Real-time upload progress via Axios + FormData
- 📈 **Stats Cards** — Live metrics: total products, catalog value, active/draft counts
- 🎨 **Modern UI** — Indigo/cyan palette, DM Sans + Syne fonts, smooth hover effects
- 📱 **Responsive** — Sidebar collapses on mobile, grid adapts to screen size
- 🔔 **Toast Notifications** — Feedback on every create, update, delete action

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# 1. Clone or download the project
git clone https://github.com/your-username/shelf-dashboard.git
cd shelf-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗂️ Project Structure

```
shelf-dashboard/
├── public/
├── src/
│   ├── App.jsx              # ← Main dashboard component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles (see fix below)
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚙️ Setup from Scratch (Vite)

```bash
npm create vite@latest shelf-dashboard -- --template react
cd shelf-dashboard
npm install axios
npm run dev
```

Replace `src/App.jsx` with `ProductDashboard.jsx` and update `src/index.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
}
```

> ⚠️ Vite's default `index.css` sets `#root { max-width: 1280px; margin: 0 auto; }` — remove this or the dashboard won't fill the full screen width.

---

## 📡 Connecting a Real API

The upload flow uses a simulated progress bar by default. To connect a real backend, replace the `simulateUpload()` function with:

```js
import axios from 'axios';

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post('https://your-api.com/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = Math.round((e.loaded * 100) / e.total);
      setProgress(pct);
    },
  });

  return response.data.imageUrl;
};
```

For full product CRUD, wire up these endpoints:

| Action | Method | Endpoint |
|--------|--------|----------|
| List products | `GET` | `/api/products` |
| Add product | `POST` | `/api/products` |
| Update product | `PUT` | `/api/products/:id` |
| Delete product | `DELETE` | `/api/products/:id` |
| Upload image | `POST` | `/api/upload` |

---

## 🎨 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Dev server & bundler |
| Axios | HTTP requests & upload progress |
| DM Sans | Body font |
| Syne | Display / heading font |
| CSS-in-JS (inline) | Component styles |

---

## 🖥️ Screenshots

| Dashboard | Add Product Modal |
|-----------|------------------|
| Products table with stats cards | Form with image upload + progress bar |

---

## 🐛 Common Issues

**Images not loading?**
Unsplash placeholder images require an internet connection. Swap with local assets or your own CDN in production.

**Axios not found?**
```bash
npm install axios
```

---

## 📄 License

MIT — free to use and modify.

---

> Built with ❤️ using React + Vite