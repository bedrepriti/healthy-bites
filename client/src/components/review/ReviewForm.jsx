import { useState } from "react";
import { API_BASE } from "../../utils/apiBase";

export default function ReviewForm({ orderCode, customerName }) {

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async () => {

    if (!orderCode) {
      alert("Order code missing");
      return;
    }

    try {

      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          orderCode,
          customerName,
          rating,
          comment
        })

      });

      const data = await res.json();

      alert(data.message || "Thank you for your review ⭐");

      setComment("");
      setRating(5);

    } catch {
      alert("Unable to submit review. Please try again.");
    }

  };

  return (

    <div style={card}>

      <h3>Rate Your Healthy Bites Order ⭐</h3>

      {/* Star Rating */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>

        {[1,2,3,4,5].map((n) => (

          <span
            key={n}
            onClick={() => setRating(n)}
            style={{
              fontSize: 26,
              cursor: "pointer",
              color: n <= rating ? "#f5b301" : "#ccc"
            }}
          >
            ★
          </span>

        ))}

      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback about the food and service..."
        style={textarea}
      />

      <button onClick={submitReview} style={btn}>
        Submit Review
      </button>

      {/* Developer credit */}
      <p style={credit}>
        Developed by Priti Bedre
      </p>

    </div>

  );

}

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
};

const textarea = {
  width: "100%",
  minHeight: 80,
  marginTop: 10,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const btn = {
  marginTop: 10,
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  background: "#2ECC71",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const credit = {
  textAlign: "center",
  marginTop: 14,
  fontSize: 12,
  color: "#888"
};