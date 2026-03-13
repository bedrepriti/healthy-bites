import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { adminFetch } from "../../utils/adminFetch";
import { API_BASE } from "../../utils/apiBase";

const CATEGORIES = ["Veg", "Non-Veg", "Vegan", "Lactose-Free"];

function resolveImg(raw) {
  if (!raw) return "/assets/images/salad1.png";
  if (raw.startsWith("/uploads")) return `${API_BASE}${raw}`;
  return raw; // full URL
}

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Veg",
    tags: "",
    stock_qty: 0,
    is_active: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const requireAdmin = () => {
    const k = localStorage.getItem("PRITI_ADMIN_KEY");
    if (!k) {
      navigate("/admin");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (requireAdmin()) fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/products");
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to load products");
        if (res.status === 401) navigate("/admin");
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      category: "Veg",
      tags: "",
      stock_qty: 0,
      is_active: 1,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const submit = async () => {
    if (!requireAdmin()) return;
    if (!form.name || !form.price) return alert("Name + Price required");

    const path = editing ? `/api/admin/products/${editing}` : `/api/admin/products`;
    const method = editing ? "PUT" : "POST";

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", String(form.price));
    fd.append("category", form.category);
    fd.append("tags", form.tags || "");
    fd.append("stock_qty", String(form.stock_qty || 0));
    fd.append("is_active", String(form.is_active ?? 1));
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await adminFetch(path, { method, body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Save failed");
        if (res.status === 401) navigate("/admin");
        return;
      }

      resetForm();
      fetchProducts();
    } catch {
      alert("Server not reachable");
    }
  };

  const toggle = async (id) => {
    if (!requireAdmin()) return;

    try {
      const res = await adminFetch(`/api/admin/products/${id}/toggle`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Toggle failed");
      fetchProducts();
    } catch {
      alert("Server not reachable");
    }
  };

  const updateStock = async (id, stock_qty) => {
    if (!requireAdmin()) return;

    try {
      const res = await adminFetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_qty }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Stock update failed");
      fetchProducts();
    } catch {
      alert("Server not reachable");
    }
  };

  const del = async (id) => {
    if (!requireAdmin()) return;
    if (!confirm("Delete product?")) return;

    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Delete failed");
      fetchProducts();
    } catch {
      alert("Server not reachable");
    }
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name || "",
      price: p.price || "",
      category: p.category || "Veg",
      tags: p.tags || "",
      stock_qty: p.stock_qty || 0,
      is_active: p.is_active ?? 1,
    });

    setImageFile(null);

    // ✅ FIX: always resolve correct URL for preview (backend prefix if /uploads)
    const raw = p.image_url || p.image || "";
    setImagePreview(resolveImg(raw) + `?v=${Date.now()}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPickImage = (file) => {
    setImageFile(file || null);
    if (!file) return setImagePreview("");

    if (file.size > 20 * 1024 * 1024) {
      alert("Image is too large. Max 20MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 900 }}>
        <h2 style={{ margin: 0 }}>Admin Products</h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Add / Edit products + Image Upload + Stock + Sold Out
        </p>

        {/* Form */}
        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            {editing ? "Edit Product" : "Add Product"}
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="input"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Tags (comma or single)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            <input
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />

            <input
              className="input"
              placeholder="Stock Qty"
              value={form.stock_qty}
              onChange={(e) =>
                setForm({ ...form, stock_qty: Number(e.target.value || 0) })
              }
            />
          </div>

          {imagePreview ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Preview</div>
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: 220, height: 140, borderRadius: 14, objectFit: "cover" }}
                onError={(e) => (e.currentTarget.src = "/assets/images/salad1.png")}
              />
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                {editing
                  ? "Upload new image only if you want to replace the old one."
                  : "This image will be stored on the server (no URL)."}
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn" onClick={submit}>
              {editing ? "Save Changes ✅" : "Add Product ✅"}
            </button>

            {editing && (
              <button className="btn" style={{ background: "#777" }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Products {loading ? "(loading...)" : `(${products.length})`}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {products.map((p) => {
              const soldOut = (p.stock_qty ?? 0) <= 0 || (p.is_active ?? 1) === 0;

              const raw = p.image_url || p.image || "";
              const imgSrc = resolveImg(raw) + `?v=${p.updated_at || Date.now()}`;

              return (
                <div key={p.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={imgSrc}
                      alt={p.name}
                      style={{ width: 70, height: 55, borderRadius: 12, objectFit: "cover" }}
                      onError={(e) => (e.currentTarget.src = "/assets/images/salad1.png")}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>
                          {p.name} {soldOut ? "❌" : "✅"}
                        </div>
                        <div style={{ fontWeight: 900 }}>₹{p.price}</div>
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="chip">{p.category}</span>
                        <span className="chip">Stock: {p.stock_qty}</span>
                        {p.tags ? <span className="chip">{p.tags}</span> : null}
                        {soldOut ? <span className="chip danger">Sold Out</span> : null}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => startEdit(p)}>
                      Edit ✏️
                    </button>

                    <button className="btn" style={{ background: "#111" }} onClick={() => toggle(p.id)}>
                      Toggle Active
                    </button>

                    <button className="btn" style={{ background: "#E74C3C" }} onClick={() => del(p.id)}>
                      Delete 🗑️
                    </button>

                    <button
                      className="btn"
                      style={{ background: "#555" }}
                      onClick={() => {
                        const val = prompt("Enter stock qty:", String(p.stock_qty ?? 0));
                        if (val === null) return;
                        updateStock(p.id, Number(val || 0));
                      }}
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
