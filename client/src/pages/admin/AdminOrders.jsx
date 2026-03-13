import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "../../utils/adminFetch";
import Navbar from "../../components/common/Navbar";
import { API_BASE } from "../../utils/apiBase";

const STATUSES = ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"];

function resolveImg(raw) {
  if (!raw) return "/assets/images/salad1.png";
  if (typeof raw !== "string") return "/assets/images/salad1.png";

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  if (raw.startsWith("/uploads")) return `${API_BASE}${raw}`;

  return raw;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [openOrder, setOpenOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const requireAdmin = () => {
    const k = localStorage.getItem("PRITI_ADMIN_KEY");
    if (!k) {
      navigate("/admin");
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/orders");
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Unauthorized");
        if (res.status === 401) navigate("/admin");
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch {
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (orderCode) => {
    setItemsLoading(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderCode}/items`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) return alert(data.message || "Failed to load items");

      setOrderItems(data.items || []);
      setOpenOrder(orderCode);
    } catch {
      alert("Server not reachable");
    } finally {
      setItemsLoading(false);
    }
  };

  const updateStatus = async (orderCode, status) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Update failed");

      setOrders((prev) =>
        prev.map((o) => (o.order_code === orderCode ? { ...o, status } : o))
      );
    } catch {
      alert("Update failed (server issue)");
    }
  };

  useEffect(() => {
    if (requireAdmin()) fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0 }}>Admin Orders</h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={fetchOrders} style={btn}>
              Refresh 🔄
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("PRITI_ADMIN_KEY");
                navigate("/admin");
              }}
              style={{ ...btn, background: "#111" }}
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: 14 }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ marginTop: 14 }}>No orders yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {orders.map((o) => (
              <div key={o.order_code} style={card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>
                      Order: {o.order_code} • ₹{o.total_amount}
                    </div>

                    <div style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
                      {o.customer_name} • {o.phone}
                    </div>

                    <div style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
                      <b>Address:</b> {o.address ? o.address : "-"}
                      {o.city ? `, ${o.city}` : ""}
                      {o.pincode ? ` - ${o.pincode}` : ""}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      <b>Payment:</b> {o.payment_method} ({o.payment_status})
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#2ECC71" }}>
                      {o.status}
                    </div>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (openOrder === o.order_code) {
                      setOpenOrder(null);
                      setOrderItems([]);
                    } else {
                      fetchItems(o.order_code);
                    }
                  }}
                  style={viewBtn}
                >
                  {openOrder === o.order_code ? "Hide Items" : "View Items 🍽️"}
                </button>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.order_code, s)}
                      style={{
                        ...statusBtn,
                        borderColor: o.status === s ? "#2ECC71" : "#ddd",
                        background: o.status === s ? "#eafff2" : "#fff",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* styles */

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#2ECC71",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const viewBtn = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const statusBtn = {
  padding: "10px 10px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 12,
};