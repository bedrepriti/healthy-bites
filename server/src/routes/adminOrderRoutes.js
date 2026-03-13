const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool/connection with .query

// Basic admin auth using a key (for now)
function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res
      .status(500)
      .json({ message: "ADMIN_KEY not set in server env" });
  }

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

// ✅ GET all orders (latest first) — MATCHES YOUR DB
router.get("/orders", requireAdmin, (req, res) => {
  const sql = `
    SELECT
      id,
      order_code,
      customer_name,
      phone,
      address,
      city,
      pincode,
      payment_method,
      payment_status,
      status AS order_status,
      total_amount AS total,
      created_at
    FROM orders
    ORDER BY id DESC
    LIMIT 200
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log("ADMIN DB ERROR (/orders):", err);
      return res.status(500).json({ message: err.message, code: err.code });
    }
    res.json(rows);
  });
});

// ✅ GET one order (optional)
router.get("/orders/:orderCode", requireAdmin, (req, res) => {
  const { orderCode } = req.params;

  const sql = `
    SELECT
      id,
      order_code,
      customer_name,
      phone,
      address,
      city,
      pincode,
      payment_method,
      payment_status,
      status AS order_status,
      total_amount AS total,
      created_at
    FROM orders
    WHERE order_code = ?
    LIMIT 1
  `;

  db.query(sql, [orderCode], (err, rows) => {
    if (err) {
      console.log("ADMIN DB ERROR (/orders/:orderCode):", err);
      return res.status(500).json({ message: err.message, code: err.code });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(rows[0]);
  });
});

// ✅ GET items for an order — USE order_code (NO order_id dependency)
router.get("/orders/:orderCode/items", requireAdmin, (req, res) => {
  const { orderCode } = req.params;

  const sql = `
    SELECT id, name, price, qty, image
    FROM order_items
    WHERE order_code = ?
    ORDER BY id ASC
  `;

  db.query(sql, [orderCode], (err, rows) => {
    if (err) {
      console.log("ADMIN DB ERROR (/items):", err);
      return res.status(500).json({ message: err.message, code: err.code });
    }

    res.json({ items: rows || [] });
  });
});

// ✅ PATCH update status — UPDATE orders.status (NOT order_status)
router.patch("/orders/:orderCode/status", requireAdmin, (req, res) => {
  const { orderCode } = req.params;
  const { status } = req.body;

  const allowed = ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE order_code = ?",
    [status, orderCode],
    (err, result) => {
      if (err) {
        console.log("ADMIN DB ERROR (PATCH status):", err);
        return res.status(500).json({ message: err.message, code: err.code });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ✅ realtime emit (safe)
      const io = req.app.get("io");
      if (io) {
        io.to(orderCode).emit("order:status_updated", {
          orderCode,
          currentStatus: status,
          lastUpdated: new Date().toISOString(),
        });
      }

      return res.json({ message: "Status updated ✅", orderCode, status });
    }
  );
});

module.exports = router;
