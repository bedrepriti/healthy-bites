import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminKeyInput, setAdminKeyInput] = useState("");

  const login = (e) => {
    e.preventDefault();

    if (!adminKeyInput.trim()) {
      alert("Enter Admin Key");
      return;
    }

    // save key
   localStorage.setItem("PRITI_ADMIN_KEY", adminKeyInput.trim());

    navigate("/admin/orders");
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 520 }}>
        <h2 style={{ margin: 0 }}>Healthy Bites Admin Login</h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Enter your Admin Key to continue
        </p>

        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <form onSubmit={login} style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              placeholder="Admin Key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
            />

            <button className="btn" type="submit">
              Login ✅
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
  Tip: The admin key must match the system key to access the admin dashboard.
</div>
<p style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>
  Developed by Priti Bedre
</p>
        </div>
      </div>
    </>
  );
}
