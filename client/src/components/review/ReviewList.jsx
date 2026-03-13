import { useEffect, useState } from "react";
import { API_BASE } from "../../utils/apiBase";

export default function ReviewList() {

  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {

    fetch(`${API_BASE}/api/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError("Unable to load reviews"));

  }, []);

  return (
    <div style={{ marginTop: 40 }}>

      <h2>Customer Reviews ⭐</h2>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: "#666" }}>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>

          {reviews.map((r, i) => (

            <div key={i} style={card}>

              <strong>{r.customer_name}</strong>

              <div style={{ color: "#f5b301", fontSize: 18 }}>
                {"★".repeat(r.rating)}
              </div>

              <p style={{ margin: "6px 0" }}>
                {r.comment || "Great food and service!"}
              </p>

            </div>

          ))}

        </div>
      )}

      {/* Developer Credit */}
      <p style={credit}>
        Developed by Priti Bedre
      </p>

    </div>
  );
}

const card = {
  background: "#fff",
  padding: 14,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.06)"
};

const credit = {
  textAlign: "center",
  marginTop: 20,
  fontSize: 12,
  color: "#888"
};