import { useState, useRef, useCallback } from "react";

const NAV_ITEMS = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "products", icon: "📦", label: "Products" },
  { id: "orders", icon: "🛒", label: "Orders" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Wireless Headphones", price: 129.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop", status: "Active" },
  { id: 2, name: "Mechanical Keyboard", price: 89.5, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=80&h=80&fit=crop", status: "Active" },
  { id: 3, name: "USB-C Hub", price: 45.0, image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=80&h=80&fit=crop", status: "Draft" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');

  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#f0f2f7}

  .app{display:flex;min-height:100vh}

  /* Sidebar */
  .sidebar{width:240px;background:#0f172a;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh}
  .sidebar-logo{padding:28px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.07)}
  .logo-mark{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px}
  .logo-mark span{color:#67e8f9}
  .sidebar-nav{padding:16px 12px;flex:1}
  .nav-label{font-size:10px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1.5px;padding:4px 12px 8px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,0.5);font-size:13.5px;font-weight:400;transition:all 0.15s;margin-bottom:2px}
  .nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85)}
  .nav-item.active{background:linear-gradient(135deg,rgba(99,179,237,0.15),rgba(103,232,249,0.1));color:#fff;font-weight:500}
  .nav-item.active .nav-icon{filter:brightness(1.5)}
  .nav-icon{font-size:16px;width:20px;text-align:center}
  .sidebar-footer{padding:16px;border-top:1px solid rgba(255,255,255,0.07)}
  .avatar-row{display:flex;align-items:center;gap:10px}
  .avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#67e8f9);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#fff;flex-shrink:0}
  .avatar-info p{font-size:12.5px;color:#fff;font-weight:500}
  .avatar-info span{font-size:11px;color:rgba(255,255,255,0.4)}

  /* Main */
  .main{flex:1;display:flex;flex-direction:column;min-width:0}
  .topbar{background:#fff;border-bottom:1px solid #e8eaf0;padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .topbar-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#0f172a}
  .topbar-right{display:flex;align-items:center;gap:12px}
  .icon-btn{width:36px;height:36px;border-radius:8px;border:1px solid #e8eaf0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:background 0.15s}
  .icon-btn:hover{background:#f8f9fc}
  .badge{background:#ef4444;color:#fff;border-radius:20px;font-size:10px;font-weight:600;padding:1px 5px;margin-left:-8px;margin-top:-8px}
  .search-box{display:flex;align-items:center;gap:8px;background:#f8f9fc;border:1px solid #e8eaf0;border-radius:8px;padding:6px 12px;font-size:13px;color:#94a3b8;width:200px}

  /* Content */
  .content{padding:28px 32px;flex:1}
  .page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}
  .page-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:#0f172a}
  .page-sub{font-size:13px;color:#94a3b8;margin-top:2px}

  /* Stats */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .stat-card{background:#fff;border-radius:14px;padding:20px;border:1px solid #e8eaf0;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;right:0;width:80px;height:80px;border-radius:0 14px 0 80px;opacity:0.06}
  .stat-card.blue::before{background:#6366f1}
  .stat-card.cyan::before{background:#06b6d4}
  .stat-card.green::before{background:#10b981}
  .stat-card.amber::before{background:#f59e0b}
  .stat-label{font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}
  .stat-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:700;color:#0f172a}
  .stat-chip{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;margin-top:8px}
  .chip-green{background:#dcfce7;color:#16a34a}
  .chip-red{background:#fee2e2;color:#dc2626}
  .stat-icon{font-size:22px;margin-bottom:10px}

  /* Table Section */
  .section-card{background:#fff;border-radius:16px;border:1px solid #e8eaf0;overflow:hidden}
  .section-header{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f3f7}
  .section-title{font-weight:600;font-size:14.5px;color:#0f172a}
  .section-count{background:#f1f3f7;border-radius:20px;font-size:11px;font-weight:600;color:#64748b;padding:2px 8px;margin-left:8px}

  /* Table */
  table{width:100%;border-collapse:collapse}
  thead{background:#fafafa}
  th{text-align:left;padding:12px 20px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid #f1f3f7}
  td{padding:14px 20px;font-size:13.5px;color:#334155;border-bottom:1px solid #f8f9fc;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fafbff}
  .prod-img{width:40px;height:40px;border-radius:8px;object-fit:cover;border:1px solid #e8eaf0;background:#f1f3f7}
  .prod-name{font-weight:500;color:#0f172a}
  .prod-id{font-size:11px;color:#94a3b8;font-family:monospace}
  .price{font-weight:600;color:#0f172a}
  .status-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:600}
  .status-active{background:#dcfce7;color:#16a34a}
  .status-draft{background:#f1f5f9;color:#64748b}
  .action-btn{padding:6px 14px;border-radius:7px;border:1px solid;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.15s}
  .btn-edit{background:#fff;border-color:#e0e7ff;color:#6366f1}
  .btn-edit:hover{background:#e0e7ff}
  .btn-delete{background:#fff;border-color:#fee2e2;color:#ef4444;margin-left:6px}
  .btn-delete:hover{background:#fee2e2}
  .action-gap{display:flex;align-items:center}

  /* Primary Button */
  .btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13.5px;font-weight:500;cursor:pointer;transition:all 0.15s;font-family:inherit}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.3)}
  .btn-secondary{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#64748b;border:1px solid #e8eaf0;border-radius:10px;padding:10px 18px;font-size:13.5px;font-weight:500;cursor:pointer;transition:all 0.15s;font-family:inherit}
  .btn-secondary:hover{background:#f8f9fc}

  /* Modal */
  .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;animation:fadeIn 0.15s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:#fff;border-radius:20px;width:480px;max-width:95vw;box-shadow:0 25px 60px rgba(0,0,0,0.2);animation:slideUp 0.2s ease}
  @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
  .modal-header{padding:24px 28px 0;display:flex;align-items:center;justify-content:space-between}
  .modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#0f172a}
  .modal-close{width:32px;height:32px;border-radius:8px;border:1px solid #e8eaf0;background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.15s}
  .modal-close:hover{background:#f1f3f7}
  .modal-body{padding:24px 28px}
  .modal-footer{padding:0 28px 24px;display:flex;gap:10px;justify-content:flex-end}

  /* Form */
  .form-group{margin-bottom:18px}
  .form-label{display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px}
  .form-input{width:100%;padding:10px 14px;border:1.5px solid #e8eaf0;border-radius:9px;font-size:14px;color:#0f172a;font-family:inherit;outline:none;transition:border-color 0.15s}
  .form-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.1)}
  .input-prefix{position:relative}
  .input-prefix .form-input{padding-left:28px}
  .prefix-symbol{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:14px;pointer-events:none}

  /* Upload Zone */
  .upload-zone{border:2px dashed #c7d2fe;border-radius:12px;padding:28px;text-align:center;cursor:pointer;transition:all 0.15s;background:#fafbff}
  .upload-zone:hover{border-color:#6366f1;background:#f0f1ff}
  .upload-zone.dragging{border-color:#6366f1;background:#ede9fe}
  .upload-preview{width:100%;max-height:160px;object-fit:contain;border-radius:8px;margin-bottom:12px}
  .upload-icon{font-size:32px;margin-bottom:8px}
  .upload-text{font-size:13px;color:#64748b}
  .upload-sub{font-size:11px;color:#94a3b8;margin-top:4px}
  .file-input{display:none}

  /* Progress bar */
  .progress-wrap{margin-top:12px}
  .progress-label{display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:6px}
  .progress-track{background:#e8eaf0;border-radius:20px;height:6px;overflow:hidden}
  .progress-bar{height:100%;border-radius:20px;background:linear-gradient(90deg,#6366f1,#67e8f9);transition:width 0.3s ease}

  /* Empty state */
  .empty-state{text-align:center;padding:60px 20px;color:#94a3b8}
  .empty-icon{font-size:48px;margin-bottom:12px}
  .empty-text{font-size:14px}

  /* Toast */
  .toast{position:fixed;bottom:24px;right:24px;background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;font-size:13.5px;font-weight:500;z-index:200;animation:slideToast 0.3s ease;display:flex;align-items:center;gap:8px}
  @keyframes slideToast{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}

  @media(max-width:900px){
    .sidebar{width:64px}
    .nav-item span,.logo-mark,.avatar-info,.sidebar-footer .avatar-row span:not(.avatar),.nav-label{display:none}
    .stats-grid{grid-template-columns:repeat(2,1fr)}
  }
  @media(max-width:600px){
    .content{padding:16px}
    .stats-grid{grid-template-columns:1fr 1fr}
    .topbar{padding:0 16px}
  }
`;

function Toast({ msg, onDone }) {
  return (
    <div className="toast" onAnimationEnd={() => setTimeout(onDone, 1800)}>
      <span>✅</span> {msg}
    </div>
  );
}

function StatCard({ icon, label, value, chip, chipType, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {chip && <div className={`stat-chip ${chipType === "up" ? "chip-green" : "chip-red"}`}>
        {chipType === "up" ? "↑" : "↓"} {chip}
      </div>}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [preview, setPreview] = useState(product?.image || null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const simulateUpload = () => new Promise((resolve) => {
    setUploading(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setUploading(false); resolve(); }
      setProgress(Math.min(100, Math.round(p)));
    }, 120);
  });

  const handleSubmit = async () => {
    if (!name.trim() || !price) return;
    if (file) await simulateUpload();
    onSave({
      id: product?.id || Date.now(),
      name: name.trim(),
      price: parseFloat(price),
      image: preview || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop`,
      status: product?.status || "Active",
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{product ? "Edit Product" : "Add Product"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" placeholder="e.g. Wireless Headphones" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <div className="input-prefix">
              <span className="prefix-symbol">$</span>
              <input className="form-input" type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {preview
                ? <img src={preview} className="upload-preview" alt="Preview" />
                : <><div className="upload-icon">🖼️</div></>
              }
              <div className="upload-text">{preview ? "Click or drop to replace" : "Click or drag image here"}</div>
              <div className="upload-sub">PNG, JPG, WEBP up to 5MB</div>
              <input ref={fileRef} type="file" className="file-input" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
            </div>
            {(uploading || progress > 0) && (
              <div className="progress-wrap">
                <div className="progress-label"><span>Uploading...</span><span>{progress}%</span></div>
                <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? "⏳ Uploading..." : product ? "💾 Save Changes" : "➕ Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDashboard() {
  const [active, setActive] = useState("products");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [modal, setModal] = useState(null); // null | "add" | {product}
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSave = (p) => {
    setProducts(prev => {
      const exists = prev.find(x => x.id === p.id);
      return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
    });
    setModal(null);
    showToast(modal === "add" ? "Product added!" : "Product updated!");
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    showToast("Product deleted.");
  };

  const totalValue = products.reduce((s, p) => s + p.price, 0).toFixed(2);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">Shelf<span>.</span></div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="avatar-row">
              <div className="avatar">AJ</div>
              <div className="avatar-info">
                <p>Alex Johnson</p>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <div className="topbar-title">Product Management</div>
            <div className="topbar-right">
              <div className="search-box">🔍 Search...</div>
              <button className="icon-btn">🔔<sup className="badge">3</sup></button>
              <button className="icon-btn">⚙️</button>
            </div>
          </header>

          <div className="content">
            <div className="page-header">
              <div>
                <div className="page-title">Products</div>
                <div className="page-sub">Manage your product catalog</div>
              </div>
              <button className="btn-primary" onClick={() => setModal("add")}>
                ➕ Add Product
              </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <StatCard icon="📦" label="Total Products" value={products.length} chip="12% this month" chipType="up" color="blue" />
              <StatCard icon="💰" label="Catalog Value" value={`$${totalValue}`} chip="8.2%" chipType="up" color="cyan" />
              <StatCard icon="✅" label="Active Listings" value={products.filter(p => p.status === "Active").length} chip="" color="green" />
              <StatCard icon="📝" label="Drafts" value={products.filter(p => p.status === "Draft").length} chipType="down" color="amber" />
            </div>

            {/* Product Table */}
            <div className="section-card">
              <div className="section-header">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="section-title">All Products</span>
                  <span className="section-count">{products.length}</span>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>Export ↗</button>
              </div>
              {products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">No products yet. Add your first one!</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img className="prod-img" src={p.image} alt={p.name} onError={e => { e.target.src = "https://via.placeholder.com/40"; }} />
                            <div>
                              <div className="prod-name">{p.name}</div>
                              <div className="prod-id">#{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="price">${p.price.toFixed(2)}</span></td>
                        <td>
                          <span className={`status-badge ${p.status === "Active" ? "status-active" : "status-draft"}`}>
                            {p.status === "Active" ? "● Active" : "○ Draft"}
                          </span>
                        </td>
                        <td>
                          <div className="action-gap">
                            <button className="action-btn btn-edit" onClick={() => setModal(p)}>✏️ Edit</button>
                            <button className="action-btn btn-delete" onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}