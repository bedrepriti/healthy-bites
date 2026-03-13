const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ PUBLIC products for Menu
router.get("/", (req, res) => {
  db.query(
    `SELECT * FROM products
     WHERE is_active=1
     ORDER BY id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });

      const out = (rows || []).map((r) => ({
        ...r,
        image_url: r.image || null, // ✅ cloudinary full url
        sold_out: Number(r.stock_qty || 0) <= 0,
      }));

      res.json(out);
    }
  );
});

module.exports = router;
