/**
 * Folio — React Blog App (API Edition)
 * ─────────────────────────────────────
 * Fetches live posts from https://jsonplaceholder.typicode.com/posts
 * Features:
 *  • Axios-pattern data fetching inside useEffect
 *  • useState for posts / loading / error
 *  • Pagination (5 posts/page)
 *  • Category filter (auto-assigned by post id)
 *  • Single post view (useParams equivalent)
 *  • Infinite scroll (bonus) via IntersectionObserver
 *  • Spinner + error + empty states
 *  • Light editorial theme
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const POSTS_PER_PAGE = 5;
const CATEGORIES = ["All", "Tech", "Sports", "Lifestyle", "Science"];

/**
 * assignCategory — maps a post id to a category deterministically.
 * JSONPlaceholder posts have no category field, so we derive one.
 */
const assignCategory = (id) => {
  const map = ["Tech", "Sports", "Lifestyle", "Science"];
  return map[(id - 1) % map.length];
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once into <head>)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F6F4F1;
    --surface: #FFFFFF;
    --border: #E6E2DC;
    --text-primary: #18140F;
    --text-secondary: #65605A;
    --text-muted: #9C9690;
    --accent: #C05C28;
    --accent-light: #F3E8DF;
    --accent-hover: #9E4A1E;
    --tag-tech:      #2A5FA5; --tag-tech-bg:      #DDE8F6;
    --tag-sports:    #236B3E; --tag-sports-bg:    #DCF0E5;
    --tag-lifestyle: #7A3475; --tag-lifestyle-bg: #F2E0F0;
    --tag-science:   #5A3D9A; --tag-science-bg:   #EAE2F8;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.05);
    --shadow-lg: 0 12px 36px rgba(0,0,0,0.1);
    --radius: 16px; --radius-sm: 10px;
    --ease: cubic-bezier(0.4,0,0.2,1);
    --transition: 0.22s var(--ease);
  }

  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text-primary); min-height:100vh; line-height:1.65; }

  /* Navbar */
  .navbar { background:rgba(246,244,241,0.9); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; padding:0 24px; }
  .navbar-inner { max-width:960px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; height:64px; }
  .navbar-brand { font-family:'Lora',serif; font-size:1.5rem; font-weight:700; color:var(--text-primary); cursor:pointer; letter-spacing:-0.03em; transition:opacity var(--transition); }
  .navbar-brand:hover { opacity:0.7; }
  .navbar-brand .dot { color:var(--accent); }
  .nav-pill { font-size:0.75rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); background:var(--surface); border:1px solid var(--border); border-radius:100px; padding:5px 14px; }

  /* Layout */
  .page { max-width:960px; margin:0 auto; padding:52px 24px 100px; }

  /* Page header */
  .page-header { margin-bottom:44px; }
  .page-header h1 { font-family:'Lora',serif; font-size:clamp(1.9rem,4.5vw,2.8rem); font-weight:700; letter-spacing:-0.035em; line-height:1.15; }
  .page-header p { margin-top:10px; color:var(--text-secondary); font-size:1rem; }
  .accent-bar { width:44px; height:4px; background:var(--accent); border-radius:2px; margin-top:16px; }

  /* Live badge */
  .live-badge { display:inline-flex; align-items:center; gap:6px; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:#1A7A3C; background:#D9F2E3; border-radius:100px; padding:4px 12px; }
  .live-dot { width:7px; height:7px; background:#1A7A3C; border-radius:50%; animation:pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }

  /* Stats bar */
  .stats-bar { display:flex; gap:24px; margin-bottom:32px; padding:16px 22px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); align-items:center; }
  .stat { display:flex; flex-direction:column; gap:2px; }
  .stat-num { font-size:1.25rem; font-weight:700; font-family:'Lora',serif; color:var(--text-primary); }
  .stat-label { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.07em; color:var(--text-muted); }

  /* Mode toggle */
  .mode-toggle { display:flex; align-items:center; background:var(--bg); border:1px solid var(--border); border-radius:100px; padding:3px; gap:2px; margin-left:auto; }
  .mode-btn { padding:5px 14px; border-radius:100px; font-size:0.74rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; cursor:pointer; border:none; background:none; color:var(--text-muted); font-family:'DM Sans',sans-serif; transition:all var(--transition); }
  .mode-btn.active { background:var(--accent); color:#fff; }

  /* Category filter */
  .category-filter { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px; }
  .cat-btn { border:1.5px solid var(--border); background:var(--surface); color:var(--text-secondary); padding:7px 18px; border-radius:100px; font-size:0.84rem; font-weight:500; cursor:pointer; transition:all var(--transition); font-family:'DM Sans',sans-serif; }
  .cat-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
  .cat-btn.active { background:var(--accent); border-color:var(--accent); color:#fff; box-shadow:0 2px 10px rgba(192,92,40,0.28); }

  /* Cards */
  .blog-list { display:flex; flex-direction:column; gap:18px; }
  .blog-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:28px 30px; cursor:pointer; transition:all var(--transition); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:10px; animation:fadeUp 0.35s var(--ease) both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .blog-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-3px); border-color:transparent; }
  .card-meta { display:flex; align-items:center; gap:12px; }
  .category-badge { display:inline-block; padding:3px 10px; border-radius:100px; font-size:0.7rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; }
  .badge-Tech      { background:var(--tag-tech-bg);      color:var(--tag-tech); }
  .badge-Sports    { background:var(--tag-sports-bg);    color:var(--tag-sports); }
  .badge-Lifestyle { background:var(--tag-lifestyle-bg); color:var(--tag-lifestyle); }
  .badge-Science   { background:var(--tag-science-bg);   color:var(--tag-science); }
  .card-id { font-size:0.76rem; color:var(--text-muted); }
  .card-title { font-family:'Lora',serif; font-size:1.18rem; font-weight:700; letter-spacing:-0.02em; line-height:1.35; color:var(--text-primary); transition:color var(--transition); text-transform:capitalize; }
  .blog-card:hover .card-title { color:var(--accent); }
  .card-desc { font-size:0.9rem; color:var(--text-secondary); line-height:1.65; text-transform:capitalize; }
  .card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
  .post-number { font-size:0.72rem; color:var(--text-muted); }
  .card-arrow { font-size:0.8rem; font-weight:600; color:var(--accent); display:flex; align-items:center; gap:4px; opacity:0; transform:translateX(-6px); transition:all var(--transition); }
  .blog-card:hover .card-arrow { opacity:1; transform:translateX(0); }

  /* Pagination */
  .pagination { display:flex; align-items:center; justify-content:center; gap:16px; margin-top:44px; }
  .pag-btn { border:1.5px solid var(--border); background:var(--surface); color:var(--text-primary); padding:9px 22px; border-radius:var(--radius-sm); font-size:0.875rem; font-weight:500; cursor:pointer; transition:all var(--transition); font-family:'DM Sans',sans-serif; }
  .pag-btn:hover:not(:disabled) { background:var(--accent); border-color:var(--accent); color:#fff; box-shadow:0 2px 10px rgba(192,92,40,0.25); }
  .pag-btn:disabled { opacity:0.32; cursor:not-allowed; }
  .pag-info { font-size:0.84rem; color:var(--text-muted); min-width:90px; text-align:center; }

  /* Spinner */
  .spinner-wrap { display:flex; flex-direction:column; align-items:center; padding:80px 24px; gap:18px; }
  .spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.75s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .spinner-text { font-size:0.9rem; color:var(--text-muted); }

  /* Infinite scroll */
  .infinite-loader { display:flex; align-items:center; justify-content:center; gap:10px; padding:28px; color:var(--text-muted); font-size:0.88rem; }
  .mini-spin { width:18px; height:18px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
  .all-loaded { text-align:center; padding:28px; font-size:0.84rem; color:var(--text-muted); }
  .all-loaded span { margin:0 6px; }
  .scroll-sentinel { height:1px; }

  /* Error */
  .error-box { background:#FEF2F2; border:1px solid #FECACA; border-radius:var(--radius); padding:36px; text-align:center; color:#B91C1C; }
  .error-box h3 { font-family:'Lora',serif; margin-bottom:8px; font-size:1.3rem; }
  .error-box p { font-size:0.88rem; opacity:0.8; margin-bottom:20px; }
  .retry-btn { background:#B91C1C; color:#fff; border:none; padding:9px 22px; border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity var(--transition); }
  .retry-btn:hover { opacity:0.85; }

  /* Empty state */
  .empty-state { text-align:center; padding:72px 24px; color:var(--text-muted); }
  .empty-icon { font-size:3rem; margin-bottom:16px; }
  .empty-state h3 { font-family:'Lora',serif; font-size:1.3rem; color:var(--text-secondary); margin-bottom:8px; }

  /* Single post */
  .single-wrap { max-width:720px; margin:0 auto; }
  .back-btn { display:inline-flex; align-items:center; gap:6px; color:var(--text-secondary); font-size:0.875rem; font-weight:500; cursor:pointer; border:none; background:none; padding:0; margin-bottom:36px; transition:color var(--transition); font-family:'DM Sans',sans-serif; }
  .back-btn:hover { color:var(--accent); }
  .post-header { margin-bottom:32px; }
  .post-meta { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .post-id-label { font-size:0.78rem; color:var(--text-muted); }
  .post-title { font-family:'Lora',serif; font-size:clamp(1.6rem,4vw,2.3rem); font-weight:700; letter-spacing:-0.03em; line-height:1.2; text-transform:capitalize; }
  .post-divider { height:1px; background:var(--border); margin:30px 0; }
  .post-body { font-size:1.05rem; line-height:1.88; color:#2A2520; }
  .post-body p { margin-bottom:20px; text-transform:capitalize; }
  .post-footer { margin-top:48px; padding-top:24px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .post-footer-note { font-size:0.82rem; color:var(--text-muted); }

  @media(max-width:600px) {
    .blog-card { padding:20px; }
    .page { padding:32px 16px 60px; }
    .stats-bar { gap:14px; flex-wrap:wrap; }
    .mode-toggle { margin-left:0; }
  }
`;

if (!document.getElementById("folio-api-styles")) {
  const s = document.createElement("style");
  s.id = "folio-api-styles";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   CUSTOM HOOK — usePosts
   Manages: posts, loading, error
   Pattern mirrors Axios usage exactly.
───────────────────────────────────────────── */
const usePosts = () => {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /**
       * Using fetch() here — swap with Axios like so:
       *   import axios from 'axios';
       *   const { data } = await axios.get(API_URL);
       *   const enriched = data.map(...);
       */
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();

      // Enrich posts — add category, trim body to description
      const enriched = data.map((p) => ({
        id:          p.id,
        title:       p.title,
        description: p.body.split("\n")[0],  // first sentence as card excerpt
        content:     p.body,
        category:    assignCategory(p.id),
        userId:      p.userId,
      }));

      setPosts(enriched);
    } catch (err) {
      setError(err.message || "Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on component mount (like componentDidMount)
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

/* ─────────────────────────────────────────────
   CUSTOM HOOK — useInfiniteScroll
   Attaches an IntersectionObserver to a sentinel
   element; fires onLoadMore when it enters viewport.
───────────────────────────────────────────── */
const useInfiniteScroll = (onLoadMore, enabled) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { threshold: 0.1 }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [onLoadMore, enabled]);

  return sentinelRef;
};

/* ─────────────────────────────────────────────
   LIGHTWEIGHT ROUTER (useState-based)
   Mirrors: BrowserRouter + Routes + useParams
───────────────────────────────────────────── */
const useRouter = () => {
  const [route, setRoute] = useState({ view: "list" });
  const navigate = useCallback((to) => {
    setRoute(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return { route, navigate };
};

/* ─────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────── */

/** Full-page loading spinner */
const Spinner = ({ text = "Fetching live posts from API…" }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    <p className="spinner-text">{text}</p>
  </div>
);

/** Error card with retry */
const ErrorBox = ({ message, onRetry }) => (
  <div className="error-box">
    <h3>⚠ Failed to load posts</h3>
    <p>{message}</p>
    <button className="retry-btn" onClick={onRetry}>↻ Try Again</button>
  </div>
);

/** Coloured category badge */
const Badge = ({ category }) => (
  <span className={`category-badge badge-${category}`}>{category}</span>
);

/** Blog post card — navigates to single post on click */
const BlogCard = ({ post, navigate, index }) => (
  <article
    className="blog-card"
    onClick={() => navigate({ view: "post", id: post.id })}
    style={{ animationDelay: `${index * 0.06}s` }}
  >
    <div className="card-meta">
      <Badge category={post.category} />
      <span className="card-id">Post #{post.id}</span>
    </div>
    <h2 className="card-title">{post.title}</h2>
    <p className="card-desc">{post.description}</p>
    <div className="card-footer">
      <span className="post-number">By User {post.userId}</span>
      <span className="card-arrow">Read article →</span>
    </div>
  </article>
);

/** Category pill filter row */
const CategoryFilter = ({ active, onSelect }) => (
  <div className="category-filter">
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        className={`cat-btn${active === cat ? " active" : ""}`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

/** Prev / Next pagination */
const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="pagination">
    <button className="pag-btn" onClick={onPrev} disabled={page === 1}>← Prev</button>
    <span className="pag-info">Page {page} / {totalPages}</span>
    <button className="pag-btn" onClick={onNext} disabled={page === totalPages}>Next →</button>
  </div>
);

/* ─────────────────────────────────────────────
   BLOG LIST PAGE  ("/")
───────────────────────────────────────────── */
const BlogList = ({ allPosts, navigate }) => {
  const [category, setCategory]       = useState("All");
  const [page, setPage]               = useState(1);
  const [mode, setMode]               = useState("paginated");   // "paginated" | "infinite"
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [infiniteLoading, setInfLoad] = useState(false);

  // Reset pagination when category or mode changes
  useEffect(() => { setPage(1); setVisibleCount(POSTS_PER_PAGE); }, [category, mode]);

  // Filtered list based on active category
  const filtered = category === "All"
    ? allPosts
    : allPosts.filter((p) => p.category === category);

  // ── Paginated slices ──
  const totalPages   = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const pagedPosts   = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // ── Infinite scroll slices ──
  const infinitePosts = filtered.slice(0, visibleCount);
  const hasMore       = visibleCount < filtered.length;

  // Appends next batch — simulates loading delay
  const loadMore = useCallback(() => {
    if (!hasMore || infiniteLoading) return;
    setInfLoad(true);
    setTimeout(() => {
      setVisibleCount((c) => c + POSTS_PER_PAGE);
      setInfLoad(false);
    }, 700);
  }, [hasMore, infiniteLoading]);

  const sentinelRef = useInfiniteScroll(loadMore, mode === "infinite" && hasMore);
  const displayedPosts = mode === "paginated" ? pagedPosts : infinitePosts;

  return (
    <main className="page">
      {/* ── Header ── */}
      <header className="page-header">
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
          <h1>Stories Worth Reading</h1>
          <div className="live-badge"><span className="live-dot" /> Live API</div>
        </div>
        <p>Fetched in real-time from JSONPlaceholder · {allPosts.length} posts</p>
        <div className="accent-bar" />
      </header>

      {/* ── Stats bar + mode toggle ── */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-num">{allPosts.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat">
          <span className="stat-num">{filtered.length}</span>
          <span className="stat-label">Filtered</span>
        </div>
        <div className="stat">
          <span className="stat-num">{CATEGORIES.length - 1}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="mode-toggle">
          <button
            className={`mode-btn${mode === "paginated" ? " active" : ""}`}
            onClick={() => setMode("paginated")}
          >Paginated</button>
          <button
            className={`mode-btn${mode === "infinite" ? " active" : ""}`}
            onClick={() => setMode("infinite")}
          >Infinite</button>
        </div>
      </div>

      {/* ── Category filter ── */}
      <CategoryFilter active={category} onSelect={setCategory} />

      {/* ── Post cards ── */}
      <div className="blog-list">
        {displayedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No posts found</h3>
            <p>Try selecting a different category.</p>
          </div>
        ) : (
          displayedPosts.map((post, i) => (
            <BlogCard key={post.id} post={post} navigate={navigate} index={i} />
          ))
        )}
      </div>

      {/* ── Paginated controls ── */}
      {mode === "paginated" && totalPages > 1 && (
        <Pagination
          page={page} totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {/* ── Infinite scroll: loader + sentinel ── */}
      {mode === "infinite" && (
        <>
          {infiniteLoading && (
            <div className="infinite-loader">
              <div className="mini-spin" /> Loading more posts…
            </div>
          )}
          {!hasMore && filtered.length > 0 && (
            <div className="all-loaded">
              <span>✦</span> All {filtered.length} posts loaded <span>✦</span>
            </div>
          )}
          {/* IntersectionObserver target */}
          <div ref={sentinelRef} className="scroll-sentinel" />
        </>
      )}
    </main>
  );
};

/* ─────────────────────────────────────────────
   SINGLE POST PAGE  ("/post/:id")
   id comes from route state (useParams equivalent)
───────────────────────────────────────────── */
const SinglePost = ({ id, allPosts, navigate }) => {
  const post = allPosts.find((p) => p.id === id);

  if (!post) return (
    <main className="page">
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h3>Post not found</h3>
        <p>This post doesn't exist or data is still loading.</p>
      </div>
    </main>
  );

  return (
    <main className="page">
      <div className="single-wrap">
        <button className="back-btn" onClick={() => navigate({ view: "list" })}>
          ← Back to all posts
        </button>

        <article>
          <header className="post-header">
            <div className="post-meta">
              <Badge category={post.category} />
              <span className="post-id-label">Post #{post.id} · User {post.userId}</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
          </header>

          <div className="post-divider" />

          <div className="post-body">
            <p>{post.content}</p>
            <p>
              This content was retrieved live from the JSONPlaceholder REST API. In a
              production application you would render full rich-text stored in your CMS
              or database. Pagination, category filtering, and infinite scroll all
              operate directly on the API dataset without any static dummy data.
            </p>
          </div>

          <div className="post-footer">
            <span className="post-footer-note">Source: jsonplaceholder.typicode.com</span>
            <button className="back-btn" style={{ marginBottom:0 }} onClick={() => navigate({ view:"list" })}>
              ← All posts
            </button>
          </div>
        </article>
      </div>
    </main>
  );
};

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
const Navbar = ({ navigate }) => (
  <nav className="navbar">
    <div className="navbar-inner">
      <span className="navbar-brand" onClick={() => navigate({ view:"list" })}>
        Folio<span className="dot">.</span>
      </span>
      <span className="nav-pill">API Edition</span>
    </div>
  </nav>
);

/* ─────────────────────────────────────────────
   APP ROOT
   Route map (React Router v6 equivalent):
     "list" → <BlogList />    → "/"
     "post" → <SinglePost />  → "/post/:id"
───────────────────────────────────────────── */
export default function App() {
  const { route, navigate } = useRouter();

  // Global fetch — shared across all views via props
  const { posts, loading, error, refetch } = usePosts();

  const renderRoute = () => {
    if (loading) return <main className="page"><Spinner /></main>;
    if (error)   return <main className="page"><ErrorBox message={error} onRetry={refetch} /></main>;

    switch (route.view) {
      case "post":
        return <SinglePost id={route.id} allPosts={posts} navigate={navigate} />;
      default:
        return <BlogList allPosts={posts} navigate={navigate} />;
    }
  };

  return (
    <>
      <Navbar navigate={navigate} />
      {renderRoute()}
    </>
  );
}