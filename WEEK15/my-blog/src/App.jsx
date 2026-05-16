/**
 * Modern React Blog Application
 * Uses React Router v6 (via CDN hash-based routing simulation)
 * Components: Navbar, BlogList, BlogCard, Pagination, CategoryFilter, SinglePost
 *
 * NOTE: Since this runs in an Artifact sandbox, we simulate React Router
 * using useState-based navigation (same API surface as useParams / useNavigate).
 */

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   DUMMY DATA
───────────────────────────────────────────── */
const POSTS = [
  { id: 1, category: "Tech", title: "The Rise of AI Agents in 2025", description: "How autonomous AI agents are reshaping the software industry and what it means for developers worldwide.", content: "Artificial intelligence has moved well beyond the era of simple chatbots. In 2025, AI agents capable of planning, executing multi-step tasks, and self-correcting errors are becoming core infrastructure for companies large and small. From automated code review pipelines to customer service bots that autonomously resolve disputes, agents are fundamentally rewriting how work gets done. The implications for developers are profound: while routine coding tasks become automated, the demand for engineers who can design, orchestrate, and debug complex agentic systems is soaring. This piece explores the key architectures powering today's agents—ReAct, Plan-and-Solve, and multi-agent frameworks—and offers a practical guide for integrating them into your own projects.", date: "May 12, 2026" },
  { id: 2, category: "Lifestyle", title: "Slow Living in a Fast World", description: "Practical ways to embrace intentional living without disconnecting from modern reality.", content: "The slow living movement isn't about rejecting technology or retreating to a cabin in the woods. It is about reclaiming deliberate choice over how you spend your hours. Practitioners report lower anxiety, deeper relationships, and a surprising uptick in creative output—because the mind works better when it isn't perpetually flooded with notifications. This article walks through five evidence-backed habits: single-tasking, analog mornings, scheduled digital silence, mindful eating, and weekly reflection. Each practice is designed to slot into a busy schedule rather than replace it, making slow living accessible even to the most calendar-blocked among us.", date: "May 10, 2026" },
  { id: 3, category: "Sports", title: "Marathon Training for Absolute Beginners", description: "A 16-week blueprint to get you from the couch to the finish line safely and confidently.", content: "Running 42.195 kilometres might sound absurd if you currently struggle to jog for ten minutes. But with a structured 16-week plan, intelligent pacing, and the right recovery habits, finishing a marathon is well within reach for most healthy adults. This guide covers the build-up phase (weeks 1–6), the mileage peak (weeks 7–12), and the critical taper (weeks 13–16). We also dig into nutrition timing, shoe selection, blister prevention, and the psychological strategies that carry runners through kilometres 30 to 42—where the real race begins.", date: "May 9, 2026" },
  { id: 4, category: "Tech", title: "WebAssembly Is Eating the Web", description: "Why WASM is no longer a niche experiment—and how to start using it in production today.", content: "WebAssembly began as a way to run C++ game engines in the browser. Five years later it powers everything from serverless edge functions to AI inference at the network boundary. Runtimes like Wasmtime and WasmEdge have brought near-native performance to the server side, while tools like Emscripten and the WASI standard are making cross-language compilation more accessible than ever. If you have been watching WASM from the sidelines, 2026 is the year to get hands-on. We cover the compilation toolchain, memory model, and three production case studies that demonstrate real-world performance gains.", date: "May 8, 2026" },
  { id: 5, category: "Lifestyle", title: "Designing a Home That Sparks Creativity", description: "Interior design principles borrowed from creative studios to inspire better ideas at home.", content: "Creative professionals have long understood that the environment shapes the quality of thought. Studios, ateliers, and research labs are designed with deliberate attention to light, texture, and spatial flow. Applying these same principles at home—even on a tight budget—can meaningfully improve focus and creative output. This article covers biophilic design (living plants, natural materials), zoning your space for distinct cognitive modes, choosing a colour palette that energises without overwhelming, and the underrated power of ambient sound. Practical tips and affordable product recommendations are included throughout.", date: "May 7, 2026" },
  { id: 6, category: "Sports", title: "The Science of Recovery: What Athletes Get Wrong", description: "Sleep, nutrition, and active recovery decoded with the latest sports science research.", content: "Most recreational athletes focus obsessively on training volume while neglecting the phase that actually produces gains: recovery. Sleep architecture, protein synthesis windows, cold versus heat therapy, and parasympathetic nervous system restoration are all areas where popular advice frequently contradicts the research. Drawing on meta-analyses published in the last three years, this piece clarifies what actually works—and identifies the common mistakes that leave gains on the table. Whether you are a weekend cyclist or a competitive triathlete, optimising recovery is the fastest way to improve performance.", date: "May 6, 2026" },
  { id: 7, category: "Tech", title: "Building Offline-First Apps with CRDT", description: "Conflict-free replicated data types explained plainly, with a practical React implementation.", content: "Offline-first is no longer a premium feature—users expect apps to work regardless of connectivity. CRDTs (Conflict-free Replicated Data Types) offer a mathematically sound approach to syncing distributed state without conflicts or last-write-wins data loss. This deep-dive explains the two main families—operation-based and state-based CRDTs—and walks through implementing a collaborative to-do list in React using the Yjs library. By the end you will have a solid mental model for when to reach for CRDTs versus simpler solutions like optimistic updates.", date: "May 5, 2026" },
  { id: 8, category: "Lifestyle", title: "The Art of Digital Minimalism", description: "How cutting your app count in half can double your focus and free time.", content: "Digital minimalism, popularised by computer scientist Cal Newport, is not about asceticism—it is about intentionality. The average smartphone user interacts with 30 apps a week; digital minimalists typically use fewer than 10. The decluttering process involves auditing every app against a simple question: does this serve a value I deeply care about, or does it merely offer shallow stimulation? This article provides a structured 30-day decluttering protocol, a framework for evaluating new tools before installing them, and strategies for handling social pressure to be available on every platform.", date: "May 4, 2026" },
  { id: 9, category: "Sports", title: "Strength Training After 40: A Complete Guide", description: "Evidence-based strategies to build muscle, protect joints, and stay injury-free as you age.", content: "Muscle mass declines at roughly 1% per year after 40 without deliberate resistance training—a process called sarcopenia. The good news: the muscle fibres that remain are highly trainable at any age, and the hormonal environment can be optimised through sleep, nutrition, and programming. This guide covers the key differences in training for masters athletes: longer warm-ups, higher frequency at lower per-session volume, greater emphasis on mobility, and smarter periodisation. Exercise selection, progressive overload strategies, and recovery protocols are all discussed in practical, jargon-free terms.", date: "May 3, 2026" },
  { id: 10, category: "Tech", title: "Edge Computing: The Next Frontier", description: "Why processing data closer to the source is transforming IoT, gaming, and real-time analytics.", content: "Cloud centralisation made the internet scalable, but it introduced latency that is incompatible with emerging use cases: autonomous vehicles need sub-10ms response times, AR/VR requires consistent frame delivery, and industrial IoT sensors generate too much data to pipe to a distant data centre. Edge computing relocates compute and storage to the network periphery—closer to where data is produced. This article maps the edge computing landscape, from carrier-operated MEC nodes to on-premise micro data centres, and examines how platforms like AWS Wavelength and Cloudflare Workers are making edge deployment accessible to every developer.", date: "May 2, 2026" },
  { id: 11, category: "Lifestyle", title: "Morning Routines of Highly Creative People", description: "Patterns and practices drawn from interviews with artists, writers, and designers.", content: "Across hundreds of interviews with creative professionals, certain morning patterns emerge with surprising consistency. Protected maker time before noon. Analog rituals—journaling, sketching, or reading physical books—before screens. Physical movement, even brief, to shift the nervous system from rest to alert. And crucially, the absence of email and social media until mid-morning. This is not coincidence. Creativity is cognitively expensive; it requires a mind that has not yet been depleted by reactive decision-making. This article distils these patterns into five morning habits you can adopt incrementally.", date: "May 1, 2026" },
  { id: 12, category: "Sports", title: "Cold Water Swimming: Benefits and Risks", description: "What the data actually says about cold-water immersion for recovery and mental health.", content: "Cold water swimming has exploded in popularity, fuelled by social media coverage and early-stage research suggesting benefits for mood, inflammation, and metabolism. But the evidence is more nuanced than the headlines suggest. While cold immersion does reliably activate brown adipose tissue and trigger norepinephrine release—both with measurable health effects—the optimal temperature, duration, and frequency are still being established. This article reviews the current literature honestly, outlines the genuine risks (cardiac shock, hypothermia), and provides a beginner protocol for those who want to experiment safely.", date: "Apr 30, 2026" },
];

const CATEGORIES = ["All", "Tech", "Sports", "Lifestyle"];
const POSTS_PER_PAGE = 5;

/* ─────────────────────────────────────────────
   STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F7F5F2;
    --surface: #FFFFFF;
    --surface-hover: #FAFAF8;
    --border: #E8E4DF;
    --text-primary: #1A1714;
    --text-secondary: #6B6560;
    --text-muted: #9B9590;
    --accent: #C8602A;
    --accent-light: #F5E8E0;
    --accent-hover: #A84E20;
    --tag-tech-bg: #E0EAF8; --tag-tech: #2D5FA8;
    --tag-sports-bg: #E0F0E8; --tag-sports: #276945;
    --tag-lifestyle-bg: #F5E8F0; --tag-lifestyle: #8B3D70;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
    --radius: 14px;
    --radius-sm: 8px;
    --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── Navbar ── */
  .navbar {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0 24px;
  }
  .navbar-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .navbar-brand {
    font-family: 'Lora', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    cursor: pointer;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: opacity var(--transition);
  }
  .navbar-brand:hover { opacity: 0.75; }
  .navbar-brand .dot { color: var(--accent); }
  .navbar-tagline {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Page Layout ── */
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* ── Page Header ── */
  .page-header {
    margin-bottom: 40px;
  }
  .page-header h1 {
    font-family: 'Lora', serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: var(--text-primary);
  }
  .page-header p {
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  /* ── Category Filter ── */
  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 32px;
  }
  .cat-btn {
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    padding: 7px 18px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    font-family: 'DM Sans', sans-serif;
  }
  .cat-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }
  .cat-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 2px 8px rgba(200,96,42,0.25);
  }

  /* ── Blog Cards ── */
  .blog-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .blog-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 32px;
    cursor: pointer;
    transition: all var(--transition);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .blog-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-3px);
    border-color: transparent;
    background: var(--surface-hover);
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .category-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .badge-Tech    { background: var(--tag-tech-bg);      color: var(--tag-tech); }
  .badge-Sports  { background: var(--tag-sports-bg);    color: var(--tag-sports); }
  .badge-Lifestyle { background: var(--tag-lifestyle-bg); color: var(--tag-lifestyle); }

  .card-date {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .card-title {
    font-family: 'Lora', serif;
    font-size: 1.22rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.35;
    color: var(--text-primary);
    transition: color var(--transition);
  }
  .blog-card:hover .card-title { color: var(--accent); }

  .card-desc {
    font-size: 0.92rem;
    color: var(--text-secondary);
    line-height: 1.65;
  }

  .card-arrow {
    align-self: flex-start;
    margin-top: 4px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transform: translateX(-4px);
    transition: all var(--transition);
  }
  .blog-card:hover .card-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Pagination ── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
  }
  .pag-btn {
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--text-primary);
    padding: 9px 22px;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pag-btn:hover:not(:disabled) {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 2px 10px rgba(200,96,42,0.25);
  }
  .pag-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .pag-info {
    font-size: 0.85rem;
    color: var(--text-muted);
    min-width: 90px;
    text-align: center;
  }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    padding: 72px 24px;
    color: var(--text-muted);
  }
  .empty-state .empty-icon { font-size: 3rem; margin-bottom: 16px; }
  .empty-state h3 {
    font-family: 'Lora', serif;
    font-size: 1.3rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  .empty-state p { font-size: 0.9rem; }

  /* ── Single Post ── */
  .single-post-wrap {
    max-width: 720px;
    margin: 0 auto;
  }
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    margin-bottom: 36px;
    transition: color var(--transition);
    font-family: 'DM Sans', sans-serif;
  }
  .back-btn:hover { color: var(--accent); }

  .post-header { margin-bottom: 36px; }
  .post-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .post-date { font-size: 0.82rem; color: var(--text-muted); }
  .post-title {
    font-family: 'Lora', serif;
    font-size: clamp(1.7rem, 4vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }
  .post-divider {
    height: 1px;
    background: var(--border);
    margin: 32px 0;
  }
  .post-body {
    font-size: 1.05rem;
    line-height: 1.85;
    color: #2E2A27;
  }
  .post-body p + p { margin-top: 20px; }

  /* ── Category Page ── */
  .cat-page-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  /* ── Divider bar ── */
  .accent-bar {
    width: 40px;
    height: 4px;
    background: var(--accent);
    border-radius: 2px;
    margin-top: 14px;
    margin-bottom: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .blog-card { padding: 20px; }
    .page { padding: 32px 16px 60px; }
    .navbar-tagline { display: none; }
  }
`;

/* inject CSS once */
if (!document.getElementById("blog-app-styles")) {
  const styleEl = document.createElement("style");
  styleEl.id = "blog-app-styles";
  styleEl.textContent = GLOBAL_CSS;
  document.head.appendChild(styleEl);
}

/* ─────────────────────────────────────────────
   ROUTER CONTEXT (lightweight hash-based)
───────────────────────────────────────────── */
// route shape: { view: "list" | "post" | "category", id?: number, name?: string }
const useRouter = () => {
  const [route, setRoute] = useState({ view: "list" });

  const navigate = useCallback((to) => {
    setRoute(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route, navigate };
};

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
const Navbar = ({ navigate }) => (
  <nav className="navbar">
    <div className="navbar-inner">
      <span className="navbar-brand" onClick={() => navigate({ view: "list" })}>
        Folio<span className="dot">.</span>
      </span>
      <span className="navbar-tagline">A modern blog</span>
    </div>
  </nav>
);

/* ─────────────────────────────────────────────
   CATEGORY BADGE
───────────────────────────────────────────── */
const Badge = ({ category }) => (
  <span className={`category-badge badge-${category}`}>{category}</span>
);

/* ─────────────────────────────────────────────
   BLOG CARD
───────────────────────────────────────────── */
const BlogCard = ({ post, navigate }) => (
  <article className="blog-card" onClick={() => navigate({ view: "post", id: post.id })}>
    <div className="card-meta">
      <Badge category={post.category} />
      <span className="card-date">{post.date}</span>
    </div>
    <h2 className="card-title">{post.title}</h2>
    <p className="card-desc">{post.description}</p>
    <span className="card-arrow">Read article →</span>
  </article>
);

/* ─────────────────────────────────────────────
   CATEGORY FILTER
───────────────────────────────────────────── */
const CategoryFilter = ({ active, onSelect }) => (
  <div className="category-filter" role="group" aria-label="Filter by category">
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

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="pagination">
    <button className="pag-btn" onClick={onPrev} disabled={page === 1}>
      ← Prev
    </button>
    <span className="pag-info">
      Page {page} of {totalPages}
    </span>
    <button className="pag-btn" onClick={onNext} disabled={page === totalPages}>
      Next →
    </button>
  </div>
);

/* ─────────────────────────────────────────────
   BLOG LIST PAGE  (route: "/")
───────────────────────────────────────────── */
const BlogList = ({ navigate }) => {
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  // Reset to page 1 when category changes
  useEffect(() => { setPage(1); }, [category]);

  const filtered = category === "All"
    ? POSTS
    : POSTS.filter((p) => p.category === category);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = filtered.slice(start, start + POSTS_PER_PAGE);

  return (
    <main className="page">
      {/* Page header */}
      <header className="page-header">
        <h1>Stories Worth Reading</h1>
        <p>Insights on technology, sports, and the art of living well.</p>
        <div className="accent-bar" />
      </header>

      {/* Category filter (links to /category/:name equivalent) */}
      <CategoryFilter active={category} onSelect={(cat) => {
        setCategory(cat);
        // Also allow navigating to category page via badge clicks on list
      }} />

      {/* Posts */}
      <div className="blog-list">
        {visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No posts found</h3>
            <p>Try selecting a different category.</p>
          </div>
        ) : (
          visible.map((post) => (
            <BlogCard key={post.id} post={post} navigate={navigate} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </main>
  );
};

/* ─────────────────────────────────────────────
   SINGLE POST PAGE  (route: "/post/:id")
───────────────────────────────────────────── */
const SinglePost = ({ id, navigate }) => {
  // Simulate useParams
  const post = POSTS.find((p) => p.id === id);

  if (!post) return (
    <main className="page">
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h3>Post not found</h3>
        <p>The post you're looking for doesn't exist.</p>
      </div>
    </main>
  );

  return (
    <main className="page">
      <div className="single-post-wrap">
        <button className="back-btn" onClick={() => navigate({ view: "list" })}>
          ← Back to all posts
        </button>

        <article>
          <header className="post-header">
            <div className="post-meta">
              <Badge category={post.category} />
              <span className="post-date">{post.date}</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
          </header>

          <div className="post-divider" />

          <div className="post-body">
            <p>{post.content}</p>
            <p>
              Whether you are approaching this topic for the first time or looking
              to deepen an existing practice, the principles outlined here are
              designed to be immediately applicable. Small, consistent steps
              compound into meaningful change—begin with a single adjustment this
              week and build from there.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};

/* ─────────────────────────────────────────────
   CATEGORY PAGE  (route: "/category/:name")
───────────────────────────────────────────── */
const CategoryPage = ({ name, navigate }) => {
  const [page, setPage] = useState(1);

  const filtered = POSTS.filter((p) => p.category === name);
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = filtered.slice(start, start + POSTS_PER_PAGE);

  return (
    <main className="page">
      <header className="page-header">
        <span className="cat-page-label">Category</span>
        <h1>{name}</h1>
        <p>{filtered.length} {filtered.length === 1 ? "post" : "posts"} in this category.</p>
        <div className="accent-bar" />
      </header>

      <button className="back-btn" style={{ marginBottom: 24 }} onClick={() => navigate({ view: "list" })}>
        ← All categories
      </button>

      <div className="blog-list">
        {visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No posts found</h3>
            <p>This category doesn't have any posts yet.</p>
          </div>
        ) : (
          visible.map((post) => (
            <BlogCard key={post.id} post={post} navigate={navigate} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </main>
  );
};

/* ─────────────────────────────────────────────
   APP ROOT  (React Router v6 equivalent)
   Route map:
     "list"     → <BlogList />        → "/"
     "post"     → <SinglePost />      → "/post/:id"
     "category" → <CategoryPage />    → "/category/:name"
───────────────────────────────────────────── */
export default function App() {
  const { route, navigate } = useRouter();

  const renderRoute = () => {
    switch (route.view) {
      case "post":
        return <SinglePost id={route.id} navigate={navigate} />;
      case "category":
        return <CategoryPage name={route.name} navigate={navigate} />;
      default:
        return <BlogList navigate={navigate} />;
    }
  };

  return (
    <>
      {/* Equivalent to <BrowserRouter> wrapping <Routes> */}
      <Navbar navigate={navigate} />
      {renderRoute()}
    </>
  );
}
