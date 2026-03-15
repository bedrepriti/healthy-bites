import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";
import salad1 from "../assets/salad1.png";
import salad2 from "../assets/salad2.png";
import salad3 from "../assets/salad3.png";
import salad4 from "../assets/salad4.png";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

function resolveImg(raw) {
  if (!raw) return salad1;

  if (raw.startsWith("http")) return raw;

  if (raw.includes("uploads")) return `${API_BASE}/${raw.replace(/^\/+/, "")}`;

  return salad1;
}

function MenuSkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton skeleton-img" />
      <div className="card-body">
        <div className="skeleton skeleton-text long" />
        <div className="skeleton skeleton-text short" />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <div className="skeleton skeleton-chip" />
          <div className="skeleton skeleton-chip" />
        </div>
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export default function Menu() {

  const { items, addToCart, updateQty, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__hb_toast_timer);
    window.__hb_toast_timer = window.setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const getQty = (productId) => {
    const found = (items || []).find((x) => Number(x.id) === Number(productId));
    return found ? Number(found.qty || 0) : 0;
  };

  const inc = (p) => {
    const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
    if (soldOut) return;

    const imgSrc = resolveImg(p.image_url ?? p.image);
    const qty = getQty(p.id);

    if (qty === 0) {
      addToCart({ id: p.id, name: p.name, price: p.price, image: imgSrc });
      showToast("Item added ✅");
      return;
    }

    updateQty(p.id, qty + 1);
    showToast("+1 ✅");
  };

  const dec = (p) => {
    const qty = getQty(p.id);
    if (qty <= 0) return;

    const next = qty - 1;

    if (next <= 0) {
      removeFromCart(p.id);
      showToast("Item removed ✅");
      return;
    }

    updateQty(p.id, next);
    showToast("-1 ✅");
  };

  return (
    <>
      <Navbar />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}

      <div className="container">
        <h2>Healthy Bites Menu</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Choose your bowl — fresh, clean, and delicious.
        </p>

        <div className="tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={active === c ? "tab active" : "tab"}
              disabled={loading}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <MenuSkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>
              No items found.
            </div>
          ) : (
            filtered.map((p) => {
              const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
              const imgSrc = resolveImg(p.image_url || p.image || "");
              const qty = getQty(p.id);

              return (
                <div key={p.id} className="card">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="card-img"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = salad1)}
                  />

                  <div className="card-body">
                    <div className="row">
                      <h3>{p.name}</h3>
                      <strong>₹{p.price}</strong>
                    </div>

                    <div className="chips">
                      <span className="chip">{p.category}</span>
                      {soldOut && <span className="chip danger">Sold Out</span>}
                    </div>

                    {soldOut ? (
                      <button className="btn disabled" disabled type="button">
                        Not Available
                      </button>
                    ) : qty > 0 ? (
                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button className="btn" onClick={() => dec(p)}>−</button>
                        <div style={{ fontWeight: 900 }}>{qty}</div>
                        <button className="btn" onClick={() => inc(p)}>+</button>
                      </div>
                    ) : (
                      <button className="btn" onClick={() => inc(p)}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "12px",
            color: "#888",
          }}
        >
          Developed by Priti Bedre
        </p>
      </div>
    </>
  );
}
