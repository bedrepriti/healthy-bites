import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../utils/apiBase";
import Navbar from "../components/common/Navbar";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async () => {
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/orders/track/${orderId.trim()}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Order not found");
        setOrder(null);
        return;
      }

      setOrder({
        orderCode: data.order_code,
        currentStatus: data.order_status,
        customerName: data.customer_name,
        lastUpdated: data.updated_at || data.created_at,
      });
    } catch {
      setError("Server not reachable");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.orderCode) return;

    const socket = io(API_BASE, { transports: ["websocket"] });

    socket.emit("joinOrder", order.orderCode);

    socket.on("order:status_updated", (payload) => {
      if (payload.orderCode === order.orderCode) {
        setOrder((prev) => ({
          ...prev,
          currentStatus: payload.currentStatus,
          lastUpdated: payload.lastUpdated,
        }));
      }
    });

    return () => socket.disconnect();
  }, [order?.orderCode]);

  return (
    <>
      <Navbar />

      <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
        <h2>Track Your Healthy Bites Order</h2>

        <p style={{ color: "#555" }}>
          Enter your Order ID to see the live delivery status.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. HB20260124-123)"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={trackOrder}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: "#2ECC71",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Track
          </button>
        </div>

        {loading && <p style={{ marginTop: 12 }}>Loading...</p>}

        {error && <p style={{ marginTop: 12, color: "#d11" }}>{error}</p>}

        {order && (
          <div
            style={{
              marginTop: 20,
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 16,
              background: "#fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontWeight: 900 }}>Order: {order.orderCode}</div>

            <div style={{ marginTop: 6 }}>
              <b>Status:</b>{" "}
              <span style={{ color: "#2ECC71", fontWeight: 900 }}>
                {order.currentStatus}
              </span>
            </div>

            <div style={{ marginTop: 6, fontSize: 13, color: "#777" }}>
              Last updated:{" "}
              {order.lastUpdated
                ? new Date(order.lastUpdated).toLocaleString()
                : "Just now"}
            </div>
          </div>
        )}

        {/* Developer Credit */}
        <p
          style={{
            textAlign: "center",
            marginTop: 40,
            fontSize: 12,
            color: "#888",
          }}
        >
          Developed by Priti Bedre
        </p>
      </div>
    </>
  );
}