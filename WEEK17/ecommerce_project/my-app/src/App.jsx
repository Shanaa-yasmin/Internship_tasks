import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

// ─── API HELPER ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("access_token") || "";

const api = {
  get: async (path, params = {}) => {
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) url.searchParams.set(k, v);
    });
    const headers = {};
    if (getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  post: async (path, body = {}, auth = false) => {
    const headers = { "Content-Type": "application/json" };
    if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
    const res = await fetch(API_BASE + path, {
      method: "POST", headers, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  delete: async (path) => {
    const headers = {};
    if (getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
    const res = await fetch(API_BASE + path, { method: "DELETE", headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.status === 204 ? null : res.json();
  },
};

// ─── DEBOUNCE HOOK ───────────────────────────────────────────────────────────
function useDebounce(value, delay = 450) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────
function Spinner({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.75s linear infinite", display: "block" }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      background: bg, color: "#fff", padding: "12px 20px",
      borderRadius: 12, fontSize: 14, fontWeight: 500,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp 0.3s ease",
    }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {message}
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text" placeholder="Search products…" value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "11px 16px 11px 42px",
          background: "#fff", border: "1.5px solid #e5e7eb",
          borderRadius: 12, fontSize: 14, outline: "none",
          color: "#111827", boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
        onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ─── FILTER PANEL ────────────────────────────────────────────────────────────
function FilterPanel({ categories, filters, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const active = filters.category || filters.min_price || filters.max_price || filters.in_stock;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 18px",
        background: active ? "#6366f1" : "#fff",
        color: active ? "#fff" : "#374151",
        border: `1.5px solid ${active ? "#6366f1" : "#e5e7eb"}`,
        borderRadius: 12, fontSize: 14, cursor: "pointer",
        fontWeight: 500, transition: "all 0.2s", whiteSpace: "nowrap",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters {active ? "●" : ""}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            background: "#fff", border: "1.5px solid #e5e7eb",
            borderRadius: 16, padding: "22px 24px", width: 290,
            boxShadow: "0 16px 48px rgba(0,0,0,0.12)", zIndex: 50,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Filter products</span>
              <button onClick={() => { onReset(); setOpen(false); }}
                style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Reset all
              </button>
            </div>

            <p style={filterLabel}>Category</p>
            <select value={filters.category} onChange={e => onChange("category", e.target.value)} style={filterSelect}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <p style={{ ...filterLabel, marginTop: 18 }}>Price range</p>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="number" placeholder="Min $" value={filters.min_price}
                onChange={e => onChange("min_price", e.target.value)}
                style={{ ...filterInput, flex: 1 }} min={0} />
              <input type="number" placeholder="Max $" value={filters.max_price}
                onChange={e => onChange("max_price", e.target.value)}
                style={{ ...filterInput, flex: 1 }} min={0} />
            </div>

            <p style={{ ...filterLabel, marginTop: 18 }}>Availability</p>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={filters.in_stock === "true"}
                onChange={e => onChange("in_stock", e.target.checked ? "true" : "")}
                style={{ accentColor: "#6366f1", width: 16, height: 16 }} />
              <span style={{ fontSize: 14, color: "#374151" }}>In stock only</span>
            </label>

            <button onClick={() => setOpen(false)} style={{
              marginTop: 22, width: "100%", padding: "11px",
              background: "#6366f1", color: "#fff", border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Apply</button>
          </div>
        </>
      )}
    </div>
  );
}

const filterLabel = { margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" };
const filterSelect = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, color: "#374151", background: "#f9fafb", outline: "none", boxSizing: "border-box" };
const filterInput = { padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, color: "#374151", background: "#f9fafb", outline: "none", boxSizing: "border-box", width: "100%" };

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, isLoggedIn }) {
  const [imgErr, setImgErr] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const fallback = `https://placehold.co/400x260/f3f4f6/9ca3af?text=${encodeURIComponent(product.name.slice(0, 14))}`;
  const primaryImage =
    product.image_url ||
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    product.images?.[0]?.thumbnail_url ||
    null;
  const imageSrc = primaryImage || fallback;

  const handleAdd = async () => {
    if (!product.is_in_stock) return;
    setAdding(true);
    await onAddToCart(product);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const categoryColors = {
    bg: "#ede9fe", text: "#7c3aed",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        border: "1.5px solid #f3f4f6",
        display: "flex", flexDirection: "column",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 20px 48px rgba(99,102,241,0.14)" : "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f9fafb" }}>
        <img
          src={imgErr ? fallback : imageSrc}
          alt={product.name}
          onError={() => setImgErr(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        {/* Stock badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: product.is_in_stock ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 20,
          backdropFilter: "blur(4px)",
        }}>
          {product.is_in_stock ? "In Stock" : "Out of Stock"}
        </div>
        {/* Category badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.92)", color: "#6366f1",
          fontSize: 11, fontWeight: 700, padding: "4px 10px",
          borderRadius: 20, backdropFilter: "blur(4px)",
        }}>
          {product.category_name}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{
          margin: "0 0 6px", fontSize: 15, fontWeight: 700,
          color: "#111827", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.name}
        </h3>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Price</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.is_in_stock || adding}
            style={{
              padding: "10px 16px",
              background: !product.is_in_stock ? "#f3f4f6"
                : added ? "#10b981"
                : "#6366f1",
              color: !product.is_in_stock ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              cursor: product.is_in_stock ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 7,
              minWidth: 120, justifyContent: "center",
            }}
          >
            {adding ? <Spinner size={16} color="#fff" /> :
              added ? "✓ Added!" :
                !product.is_in_stock ? "Unavailable" : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to Cart
                  </>
                )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT LIST ─────────────────────────────────────────────────────────────
function ProductList({ products, loading, error, onAddToCart, isLoggedIn }) {
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 340, gap: 16 }}>
      <Spinner size={44} color="#6366f1" />
      <p style={{ color: "#9ca3af", fontSize: 15, margin: 0 }}>Loading products…</p>
    </div>
  );

  if (error) return (
    <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
      <p style={{ fontSize: 36, margin: "0 0 12px" }}>⚠️</p>
      <p style={{ color: "#dc2626", fontWeight: 700, margin: "0 0 6px", fontSize: 16 }}>Failed to load products</p>
      <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
    </div>
  );

  if (!products.length) return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 56, margin: "0 0 16px" }}>🔍</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>No products found</p>
      <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Try adjusting your search or filters</p>
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 24,
    }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.total_pages <= 1) return null;
  const { current_page, total_pages, total_items, page_size } = pagination;

  const range = [];
  for (let i = Math.max(1, current_page - 2); i <= Math.min(total_pages, current_page + 2); i++) range.push(i);

  const btnStyle = (active, disabled) => ({
    width: 38, height: 38, border: active ? "none" : "1.5px solid #e5e7eb",
    borderRadius: 10, background: active ? "#6366f1" : "#fff",
    color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
    fontSize: 14, fontWeight: active ? 700 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  });

  return (
    <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
        Showing {Math.min((current_page - 1) * page_size + 1, total_items)}–{Math.min(current_page * page_size, total_items)} of {total_items} products
        &nbsp;·&nbsp; Page {current_page} of {total_pages}
      </p>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button style={btnStyle(false, current_page === 1)} disabled={current_page === 1} onClick={() => onPage(1)}>«</button>
        <button style={btnStyle(false, current_page === 1)} disabled={current_page === 1} onClick={() => onPage(current_page - 1)}>‹</button>
        {range[0] > 1 && <span style={{ color: "#d1d5db", padding: "0 2px" }}>…</span>}
        {range.map(p => (
          <button key={p} style={btnStyle(p === current_page, false)} onClick={() => onPage(p)}>{p}</button>
        ))}
        {range[range.length - 1] < total_pages && <span style={{ color: "#d1d5db", padding: "0 2px" }}>…</span>}
        <button style={btnStyle(false, current_page === total_pages)} disabled={current_page === total_pages} onClick={() => onPage(current_page + 1)}>›</button>
        <button style={btnStyle(false, current_page === total_pages)} disabled={current_page === total_pages} onClick={() => onPage(total_pages)}>»</button>
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, open, onClose, onRemove, onUpdateQty }) {
  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(17,24,39,0.5)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition: "opacity 0.3s ease",
        zIndex: 200, backdropFilter: "blur(2px)",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 0, height: "100vh",
        width: 400, background: "#fff", zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 48px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 24px", borderBottom: "1.5px solid #f3f4f6",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#fafafa",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>
              Shopping Cart
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>
              {count} item{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb",
            background: "#fff", cursor: "pointer", fontSize: 18, color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: 52, margin: "0 0 16px" }}>🛒</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Your cart is empty</p>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Add some products to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                display: "flex", gap: 14, padding: "16px 0",
                borderBottom: "1px solid #f9fafb", alignItems: "flex-start",
              }}>
                <img
                  src={item.image || `https://placehold.co/70x70/f3f4f6/9ca3af?text=${encodeURIComponent(item.name.slice(0, 6))}`}
                  alt={item.name}
                  onError={e => { e.target.src = `https://placehold.co/70x70/f3f4f6/9ca3af?text=IMG`; }}
                  style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover", background: "#f3f4f6", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#111827", lineHeight: 1.3 }}>
                    {item.name}
                  </p>
                  <p style={{ margin: "0 0 10px", color: "#6366f1", fontWeight: 700, fontSize: 15 }}>
                    ${parseFloat(item.price).toFixed(2)}
                  </p>
                  {/* Quantity controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      style={qtyBtn}> − </button>
                    <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#111827" }}>
                      {item.qty}
                    </span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      style={qtyBtn}> + </button>
                    <button onClick={() => onRemove(item.id)}
                      style={{ marginLeft: 12, background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 0" }}>
                      Remove
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#111827", whiteSpace: "nowrap" }}>
                  ${(parseFloat(item.price) * item.qty).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1.5px solid #f3f4f6", background: "#fafafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#6b7280", fontSize: 14 }}>Subtotal</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>${total.toFixed(2)}</span>
            </div>
            <p style={{ margin: "0 0 16px", color: "#9ca3af", fontSize: 12 }}>Shipping calculated at checkout</p>
            <button style={{
              width: "100%", padding: "14px", background: "#6366f1",
              color: "#fff", border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.target.style.background = "#4f46e5"}
              onMouseLeave={e => e.target.style.background = "#6366f1"}
            >
              Checkout → ${total.toFixed(2)}
            </button>
            <button onClick={() => { if (window.confirm("Clear all items?")) onRemove("all"); }}
              style={{ width: "100%", marginTop: 10, padding: "10px", background: "none", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, color: "#6b7280", cursor: "pointer" }}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtn = {
  width: 28, height: 28, border: "1.5px solid #e5e7eb", borderRadius: 8,
  background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#374151",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 700,
};

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ open, onClose, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.username || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await onLogin(form.username, form.password);
      setForm({ username: "", password: "" });
      onClose();
    } catch {
      setError("Invalid username or password.");
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 40px 36px", width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "#ede9fe", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>Welcome back</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: 14 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 18, textAlign: "center" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <p style={filterLabel}>Username</p>
          <input type="text" placeholder="Enter username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            style={{ ...filterInput, display: "block", fontSize: 15, padding: "12px 14px" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <p style={filterLabel}>Password</p>
          <input type="password" placeholder="Enter password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handle()}
            style={{ ...filterInput, display: "block", fontSize: 15, padding: "12px 14px" }} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "#f9fafb", border: "1.5px solid #e5e7eb",
            borderRadius: 12, fontSize: 15, cursor: "pointer", color: "#374151", fontWeight: 500,
          }}>Cancel</button>
          <button onClick={handle} disabled={loading} style={{
            flex: 2, padding: "12px", background: "#6366f1", color: "#fff",
            border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? <><Spinner size={18} color="#fff" /> Signing in…</> : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVE FILTER CHIPS ──────────────────────────────────────────────────────
function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#ede9fe", color: "#6366f1",
      padding: "5px 10px 5px 12px", borderRadius: 20,
      fontSize: 13, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "rgba(99,102,241,0.15)", border: "none", color: "#6366f1",
        cursor: "pointer", borderRadius: "50%", width: 18, height: 18,
        fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
      }}>×</button>
    </span>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [loginOpen, setLoginOpen] = useState(false);

  // Products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("-created_at");
  const [filters, setFilters] = useState({ category: "", min_price: "", max_price: "", in_stock: "" });
  const debouncedSearch = useDebounce(search);

  // Cart — stored in localStorage so it persists
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch categories
  useEffect(() => {
    api.get("/categories/")
      .then(data => setCategories(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.get("/products/", { search: debouncedSearch, page, ordering: sortBy, ...filters })
      .then(data => {
        if (cancelled) return;
        if (data.results !== undefined) {
          setProducts(data.results);
          setPagination(
            data.pagination || {
              total_items: data.count,
              total_pages: Math.ceil(data.count / 10),
              current_page: page,
              page_size: 10,
            }
          );
        } else {
          setProducts(Array.isArray(data) ? data : []);
          setPagination(null);
        }
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, page, sortBy, filters]);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [debouncedSearch, filters, sortBy]);

  // Auth handlers
  const handleLogin = async (username, password) => {
    const data = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setToken(data.access);
    setIsLoggedIn(true);
    showToast(`Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken("");
    setIsLoggedIn(false);
    showToast("Signed out successfully.", "info");
  };

  // Cart handlers
  const handleAddToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        showToast(`${product.name} quantity updated!`);
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      showToast(`${product.name} added to cart!`);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const handleRemove = useCallback((id) => {
    if (id === "all") { setCart([]); return; }
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleUpdateQty = useCallback((id, newQty) => {
    if (newQty < 1) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const handleFilterReset = () => setFilters({ category: "", min_price: "", max_price: "", in_stock: "" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; color: #111827; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: "#fff", borderBottom: "1.5px solid #f3f4f6",
        padding: "0 32px", height: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
            Shoppy
          </span>
        </div>

        {/* Nav right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, background: "#ede9fe", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <button onClick={handleLogout} style={{
                padding: "8px 16px", background: "#f9fafb", border: "1.5px solid #e5e7eb",
                borderRadius: 10, fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500,
              }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setLoginOpen(true)} style={{
              padding: "9px 20px", background: "#fff", border: "1.5px solid #e5e7eb",
              borderRadius: 10, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 600,
            }}>Sign in</button>
          )}

          {/* Cart button */}
          <button onClick={() => setCartOpen(true)} style={{
            position: "relative", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", background: "#6366f1", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
            onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -8,
                background: "#ef4444", color: "#fff",
                width: 22, height: 22, borderRadius: "50%",
                fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
              }}>{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
        padding: "52px 32px 48px", textAlign: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
          🛍 New arrivals every week
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
          Shop the Latest Products
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, margin: "0 0 28px" }}>
          {pagination?.total_items ? `${pagination.total_items} products` : "Browse our full collection"} · Free shipping on orders over $50
        </p>
        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {[
            { label: "Products", value: pagination?.total_items || "—" },
            { label: "Categories", value: categories.length || "—" },
            { label: "In Stock", value: products.filter(p => p.is_in_stock).length || "—" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <main style={{ width: "100%", padding: "32px 40px 72px" }}>

        {/* Controls bar */}
        <div style={{
          background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 16,
          padding: "16px 20px", marginBottom: 20,
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <SearchBar value={search} onChange={setSearch} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            ...filterSelect, width: "auto", minWidth: 170, padding: "10px 14px",
          }}>
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="name">Name A → Z</option>
            <option value="-name">Name Z → A</option>
          </select>
          <FilterPanel categories={categories} filters={filters} onChange={handleFilterChange} onReset={handleFilterReset} />
        </div>

        {/* Active filter chips */}
        {(filters.category || filters.min_price || filters.max_price || filters.in_stock) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center" }}>Active filters:</span>
            {filters.category && (
              <Chip
                label={`Category: ${categories.find(c => String(c.id) === String(filters.category))?.name || filters.category}`}
                onRemove={() => handleFilterChange("category", "")}
              />
            )}
            {filters.min_price && <Chip label={`Min $${filters.min_price}`} onRemove={() => handleFilterChange("min_price", "")} />}
            {filters.max_price && <Chip label={`Max $${filters.max_price}`} onRemove={() => handleFilterChange("max_price", "")} />}
            {filters.in_stock && <Chip label="In stock only" onRemove={() => handleFilterChange("in_stock", "")} />}
          </div>
        )}

        {/* Category quick filters */}
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, overflowX: "auto" }}>
            <button
              onClick={() => handleFilterChange("category", "")}
              style={{
                padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
                borderColor: !filters.category ? "#6366f1" : "#e5e7eb",
                background: !filters.category ? "#ede9fe" : "#fff",
                color: !filters.category ? "#6366f1" : "#6b7280",
                fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}>
              All
            </button>
            {categories.map(c => (
              <button key={c.id}
                onClick={() => handleFilterChange("category", String(c.id) === String(filters.category) ? "" : c.id)}
                style={{
                  padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
                  borderColor: String(filters.category) === String(c.id) ? "#6366f1" : "#e5e7eb",
                  background: String(filters.category) === String(c.id) ? "#ede9fe" : "#fff",
                  color: String(filters.category) === String(c.id) ? "#6366f1" : "#6b7280",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        <ProductList
          products={products}
          loading={loading}
          error={error}
          onAddToCart={handleAddToCart}
          isLoggedIn={isLoggedIn}
        />

        <Pagination pagination={pagination} onPage={setPage} />
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111827", color: "#9ca3af", textAlign: "center", padding: "28px 24px", fontSize: 13 }}>
        <p style={{ margin: 0 }}>© 2026 Shoppy. Built with Django REST + React.</p>
      </footer>

      {/* ── OVERLAYS ── */}
      <CartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemove}
        onUpdateQty={handleUpdateQty}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}