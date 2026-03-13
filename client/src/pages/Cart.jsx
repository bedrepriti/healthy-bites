import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Cart() {
  // ✅ use ONLY these from context
  const { items, totals, addToCart, updateQty, removeFromCart } = useCart();

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [removingIds, setRemovingIds] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const removeWithAnim = (id) => {
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      removeFromCart(id); // ✅ fixed
      setRemovingIds((prev) => prev.filter((x) => x !== id));
    }, 200);
  };

  const incQty = (item) => addToCart(item); // ✅ fixed (addToCart increases qty)
  const decQty = (item) => {
    const next = Number(item.qty || 0) - 1;
    if (next <= 0) return removeWithAnim(item.id);
    updateQty(item.id, next); // ✅ fixed
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: isMobile ? "16px" : "28px 40px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
       <h2 style={{ margin: 0 }}>Healthy Bites Cart</h2>

        {/* Free delivery banner */}
        {items.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "#f3fffa",
              fontWeight: 800,
            }}
          >
            {totals.subtotal >= 99
  ? "✅ Free delivery unlocked!"
  : `🚚 Delivery fee ₹25 — Add ₹${99 - totals.subtotal} more to get FREE delivery`}

          </div>
        )}

        {items.length === 0 ? (
          <div style={{ marginTop: 16 }}>
            <p>Cart is empty. Add some salads 🥗</p>
            <Link
              to="/menu"
              className="btn"
              style={{ marginTop: 10, display: "inline-block" }}
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
              gap: 16,
              marginTop: 16,
              alignItems: "start",
            }}
          >
            {/* LEFT: Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((x) => (
                <div
                  key={x.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 14,
                    border: "1px solid #eee",
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    alignItems: "center",
                    transition: "opacity 0.2s, transform 0.2s",
                    opacity: removingIds.includes(x.id) ? 0 : 1,
                    transform: removingIds.includes(x.id)
                      ? "translateX(10px)"
                      : "translateX(0)",
                  }}
                >
                  <img
                    src={x.image || "/assets/images/salad1.png"}
                    alt={x.name}
                    style={{
                      width: isMobile ? 64 : 80,
                      height: isMobile ? 56 : 70,
                      borderRadius: 10,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                    onError={(e) =>
                      (e.currentTarget.src = "/assets/images/salad1.png")
                    }
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>{x.name}</strong>
                      <strong style={{ fontSize: 14 }}>
                        ₹{Number(x.price || 0) * Number(x.qty || 0)}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button onClick={() => decQty(x)} style={qtyBtn}>
                        −
                      </button>

                      <span
                        style={{
                          minWidth: 20,
                          textAlign: "center",
                          fontWeight: 700,
                        }}
                      >
                        {x.qty}
                      </span>

                      <button onClick={() => incQty(x)} style={qtyBtn}>
                        +
                      </button>

                      <button
                        onClick={() => removeWithAnim(x.id)}
                        style={{
                          marginLeft: "auto",
                          border: "none",
                          background: "transparent",
                          color: "#d11",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Bill Summary</h3>

              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
              <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
              <Row label="Total" value={`₹${totals.total}`} bold />

              <button
                onClick={() => navigate("/checkout")}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: "#2ECC71",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "10px 0",
        fontWeight: bold ? 800 : 600,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const qtyBtn = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
