import Navbar from "../components/common/Navbar";
import "../styles/main.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <section
        style={{
          height: "90vh",
          backgroundImage: "url('/assets/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: "40px",
            borderRadius: "12px",
            maxWidth: "520px",
          }}
        >
          <h1>Healthy Bites</h1>

          <p style={{ fontSize: "18px", margin: "12px 0" }}>
            Fresh Bites, Healthy Delights
          </p>

          <p style={{ fontSize: "14px", color: "#555", marginBottom: "16px" }}>
            Serving fresh and healthy salads in Palashi, TQ Umarkhed,
            Dist Yavatmal, Maharashtra.
          </p>

          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "12px 20px",
              background: "#2ECC71",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Order Now 🥗
          </button>
        </div>
      </section>
    </>
  );
}