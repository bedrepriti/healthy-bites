import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const [placedOrderCode, setPlacedOrderCode] = useState("");

  // form
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine: "",
    area: "",
    city: "Pune",
    pincode: "",
    instructions: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | ONLINE
  const [placing, setPlacing] = useState(false);

  const canPlaceOrder = useMemo(() => {
    if (items.length === 0) return false;
    return (
      form.fullName.trim() &&
      form.phone.trim() &&
      form.addressLine.trim() &&
      form.area.trim() &&
      form.city.trim() &&
      form.pincode.trim()
    );
  }, [form, items.length]);

  // simple phone/pincode cleanup (optional)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: (prev.phone || "").replace(/[^\d]/g, "").slice(0, 10),
      pincode: (prev.pincode || "").replace(/[^\d]/g, "").slice(0, 6),
    }));
    // eslint-disable-next-line
  }, [form.phone, form.pincode]);

  const placeOrder = async () => {
    if (!canPlaceOrder) {
      alert("Please fill all required details.");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        customer: form,
        items,
        totals,
        paymentMethod,
        paymentStatus: "PENDING",
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // ✅ FIXED
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Order failed");
        return;
      }

      clearCart();
      setPlacedOrderCode(data.orderCode);
    } catch (err) {
      console.error(err);
      alert("Server not reachable. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar />

      {placedOrderCode ? (
        <div className="container">
          <div className="card section" style={{ padding: 16 }}>
            <h2 style={{ marginTop: 0 }}>Your Healthy Bites Order is Confirmed 🥗</h2>

            <p style={{ margin: "10px 0", fontWeight: 900 }}>
              Your Order ID:
              <span style={{ marginLeft: 8, color: "#2ECC71" }}>
                {placedOrderCode}
              </span>
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                className="btn"
                onClick={() => {
                  navigator.clipboard.writeText(placedOrderCode);
                  alert("Order ID copied ✅");
                }}
              >
                Copy Order ID 📋
              </button>

              <button
                className="btn"
                style={{ background: "#111" }}
                onClick={() => (window.location.href = `/track?order=${placedOrderCode}`)}
              >
                Track Order 🚚
              </button>
            </div>

            <p style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
              Keep this Order ID safe. You can track your order anytime from Track Order page.
            </p>
          </div>
        </div>
      ) : null}

      <div className="container">
        <h2 style={{ margin: 0 }}>Checkout</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Confirm address & payment method.
        </p>

        {items.length === 0 ? (
          <div className="card section" style={{ padding: 16 }}>
            <p style={{ margin: 0 }}>
              Your cart is empty. Add items from Menu 🥗
            </p>
          </div>
        ) : (
          <div className="grid section">
            {/* LEFT: Address + Payment */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Delivery Details</h3>

              <div style={formGrid}>
                <Input
                  label="Full Name *"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                  placeholder="Your name"
                />

                <Input
                  label="Phone *"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                />

                <Input
                  label="Email (optional)"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="example@gmail.com"
                />

                <Input
                  label="Full Address *"
                  value={form.addressLine}
                  onChange={(v) => setForm({ ...form, addressLine: v })}
                  placeholder="House/Flat, Street, Building..."
                />

                <Input
                  label="Area *"
                  value={form.area}
                  onChange={(v) => setForm({ ...form, area: v })}
                  placeholder="Wagholi / Kharadi..."
                />

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <Input
                    label="City *"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    placeholder="Pune"
                  />
                  <Input
                    label="Pincode *"
                    value={form.pincode}
                    onChange={(v) => setForm({ ...form, pincode: v })}
                    placeholder="6-digit"
                    inputMode="numeric"
                  />
                </div>

                <Textarea
                  label="Delivery Instructions (optional)"
                  value={form.instructions}
                  onChange={(v) => setForm({ ...form, instructions: v })}
                  placeholder="Call on arrival, leave at gate, etc."
                />
              </div>

              <h3 style={{ marginTop: 18 }}>Payment Method</h3>

              <div style={{ display: "grid", gap: 12 }}>
                <PaymentCard
                  active={paymentMethod === "COD"}
                  title="Cash on Delivery (COD)"
                  desc="Pay when your salad arrives."
                  onClick={() => setPaymentMethod("COD")}
                />

                <PaymentCard
                  active={paymentMethod === "ONLINE"}
                  title="Online Payment"
                  desc="UPI / Card / Netbanking (UI now, Razorpay next)."
                  onClick={() => setPaymentMethod("ONLINE")}
                />

                {paymentMethod === "ONLINE" && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px dashed #cbd5e1",
                      background: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Online payments will be added in the next update.
                    For now, please place order using COD.
                  </div>
                )}
              </div>

              <button
                className="btn"
                onClick={placeOrder}
                disabled={!canPlaceOrder || placing}
                style={{ marginTop: 16 }}
              >
                {placing
                  ? "Placing Order..."
                  : paymentMethod === "COD"
                    ? "Place Order (COD) 🥗"
                    : "Place Order (Online) 💳"}
              </button>

              {!canPlaceOrder && (
                <div style={{ marginTop: 10, color: "#777", fontSize: 13 }}>
                  Fill required fields (*) to place order.
                </div>
              )}
            </div>

            {/* RIGHT: Summary */}
            <div className="card" style={{ padding: 16, height: "fit-content" }}>
              <h3 style={{ marginTop: 0 }}>Order Summary</h3>

              <div style={{ display: "grid", gap: 10 }}>
                {items.map((x) => (
                  <div
                    key={x.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                      border: "1px solid #eee",
                      borderRadius: 14,
                      padding: 10,
                    }}
                  >
                    <img
                      src={x.image}
                      alt={x.name}
                      style={{
                        width: 56,
                        height: 48,
                        borderRadius: 12,
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/salad1.png";
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{x.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        ₹{x.price} × {x.qty}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900 }}>₹{x.price * x.qty}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#eee", margin: "14px 0" }} />

              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
              <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />
              <Row label="Total" value={`₹${totals.total}`} bold />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Small Components ---------- */

function Input({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "#374151" }}>
        {label}
      </span>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "#374151" }}>
        {label}
      </span>
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function PaymentCard({ active, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 14,
        padding: 14,
        border: active ? "2px solid #2ECC71" : "1px solid #e5e7eb",
        background: active ? "#eafff2" : "#fff",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 4, color: "#666", fontSize: 13, fontWeight: 700 }}>
        {desc}
      </div>
    </button>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 900 : 800 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const formGrid = {
  display: "grid",
  gap: 12,
};
