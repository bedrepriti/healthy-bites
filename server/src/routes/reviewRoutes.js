const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ADD REVIEW
router.post("/", (req, res) => {
  const { orderCode, customerName, rating, comment } = req.body;

  if (!orderCode || !customerName || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO reviews (order_code, customer_name, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [orderCode, customerName, rating, comment || null], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Review save failed" });
    }

    res.json({ message: "Review submitted successfully" });
  });
});

// GET ALL REVIEWS
router.get("/", (req, res) => {
  const sql = `
    SELECT customer_name, rating, comment, created_at
    FROM reviews
    ORDER BY created_at DESC
    LIMIT 20
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
    res.json(rows);
  });
});
// GET AVERAGE RATING (overall)
router.get("/stats/average", (req, res) => {
  const sql = `
    SELECT 
      ROUND(AVG(rating), 1) AS avgRating,
      COUNT(*) AS totalReviews
    FROM reviews
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to get rating stats" });
    }

    res.json({
      avgRating: rows[0].avgRating || 0,
      totalReviews: rows[0].totalReviews || 0,
    });
  });
});

module.exports = router;
