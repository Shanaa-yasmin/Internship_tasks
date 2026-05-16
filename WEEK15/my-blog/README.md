# Folio — Modern React Blog Application

A clean, editorial-style blog application built with React and Vite. Features category filtering, pagination, and a responsive light-theme UI.

---

## 🚀 Quick Start

```bash
# 1. Create a Vite React project
npm create vite@latest my-blog -- --template react

# 2. Navigate into the project
cd my-blog

# 3. Install dependencies
npm install

# 4. Replace src/App.jsx with BlogApp.jsx content

# 5. Start the dev server
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 📁 Project Structure

```
my-blog/
├── public/
├── src/
│   ├── App.jsx          ← Main app file (BlogApp.jsx content goes here)
│   ├── main.jsx         ← Entry point
│   └── index.css        ← (optional, styles are injected by the app)
├── index.html
├── vite.config.js
└── package.json
```

### Component Tree

```
App
├── Navbar
├── BlogList             (route: "/")
│   ├── CategoryFilter
│   ├── BlogCard
│   └── Pagination
├── SinglePost           (route: "/post/:id")
└── CategoryPage         (route: "/category/:name")
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 Blog List | Displays all posts with title, description, and category badge |
| 🔖 Category Filter | Filter posts by All, Tech, Sports, or Lifestyle |
| 📑 Pagination | 5 posts per page with Prev / Next controls |
| 📰 Single Post | Full article view with back navigation |
| 🗂️ Category Page | Dedicated page for each category |
| 📱 Responsive | Mobile-friendly layout |
| 💫 Animations | Smooth hover effects on cards and buttons |
| 🚫 Empty State | Friendly message when no posts are found |

---

## 🛣️ Routing

The app uses a lightweight internal router that mirrors React Router v6 behavior.

| View | Equivalent Route | Component |
|---|---|---|
| Blog list | `/` | `<BlogList />` |
| Single post | `/post/:id` | `<SinglePost />` |
| Category | `/category/:name` | `<CategoryPage />` |

> To upgrade to real React Router v6, install `react-router-dom` and replace the `useRouter` hook with `BrowserRouter`, `Routes`, `Route`, `useParams`, and `useNavigate`.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#F7F5F2` (warm off-white) |
| Surface | `#FFFFFF` |
| Accent | `#C8602A` (terracotta) |
| Display font | Lora (serif) |
| Body font | DM Sans |
| Border radius | `14px` |

**Category badge colors:**
- 🔵 Tech — soft blue
- 🟢 Sports — soft green
- 🟣 Lifestyle — soft purple

---

## 🧰 Tech Stack

- [React 18](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — build tool and dev server
- Google Fonts — Lora + DM Sans
- Vanilla CSS with CSS custom properties (no CSS framework)

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build locally
```

---

## 🔧 Customisation

### Add a new post
Open `App.jsx` and add an entry to the `POSTS` array:

```js
{
  id: 13,
  category: "Tech",           // "Tech" | "Sports" | "Lifestyle"
  title: "Your Post Title",
  description: "Short summary shown on the card.",
  content: "Full article text shown on the single post page.",
  date: "May 16, 2026"
}
```

### Add a new category
1. Add the category name to the `CATEGORIES` array.
2. Add a badge color in the CSS (follow the `.badge-Tech` pattern).

---

## 📄 License

MIT — free to use and modify for personal or commercial projects.