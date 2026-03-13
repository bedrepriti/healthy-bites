import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav
      style={{
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          gap: 12,
          flexWrap: "wrap", // ✅ mobile wrap
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
  <img
    src="/assets/logo/healthy-bites-logo.png"
    alt="Healthy Bites"
    style={{ height: 56, width: "auto", display: "block" }}
  />
  <span style={{marginLeft:"10px",fontWeight:"bold",fontSize:"18px"}}>
    Healthy Bites
  </span>
</Link>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            gap: 14,
            fontWeight: 700,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {!isAdmin ? (
            <>
              <Link style={linkStyle} to="/menu">Menu</Link>
              <Link style={linkStyle} to="/contact">Contact</Link>
              <Link style={linkStyle} to="/cart">Cart</Link>
              <Link style={linkStyle} to="/track">Track</Link>

              {/* ✅ Admin link */}
              <Link style={adminStyle} to="/admin">Admin</Link>
            </>
          ) : (
            <>
              {/* ✅ Admin quick nav */}
              <Link style={linkStyle} to="/admin/orders">Orders</Link>
              <Link style={linkStyle} to="/admin/products">Products</Link>

              <button
                onClick={() => {
                  localStorage.removeItem("HB_ADMIN_KEY");
                  window.location.href = "/admin";
                }}
                style={logoutBtn}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#222",
  padding: "8px 10px",
  borderRadius: 10,
};

const adminStyle = {
  ...linkStyle,
  border: "1px solid #eee",
  background: "#f7f7f7",
  fontWeight: 900,
};

const logoutBtn = {
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
