const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { notifyTelegram } = require("../utils/telegram"); // ✅ ADDED

console.log("✅ Order routes loaded");

// ================= TRACK ORDER =================
router.get("/track/:orderCode", (req, res) => {
  const { orderCode } = req.params;

  db.query(
    `SELECT
        order_code,
        customer_name,
        status AS order_status,
        payment_method,
        payment_status,
        created_at
     FROM orders
     WHERE order_code = ?
     LIMIT 1`,
    [orderCode],
    (err, rows) => {
      if (err) {
        console.error("TRACK ORDER DB ERROR:", err);
        return res.status(500).json({ message: err.message, code: err.code });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(rows[0]);
    }
  );
});

// ================= CREATE ORDER =================
function generateOrderCode() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `HB${ymd}-${Math.floor(100 + Math.random() * 900)}`;
}

router.post("/", (req, res) => {
  const { customer, items, totals, paymentMethod, paymentStatus } = req.body;

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderCode = generateOrderCode();

  // ✅ Build address string for your DB column "address"
  const addressText = [
    customer.addressLine,
    customer.area,
    customer.city ? `City: ${customer.city}` : null,
    customer.pincode ? `Pincode: ${customer.pincode}` : null,
    customer.instructions ? `Note: ${customer.instructions}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const totalAmount =
    Number(totals?.total ?? totals?.grandTotal ?? totals?.amount ?? 0) || 0;

  const city = customer.city || null;
  const pincode = customer.pincode || null;

  // ✅ Insert order using YOUR real columns
  db.query(
    `INSERT INTO orders
      (order_code, customer_name, phone, address, city, pincode,
       payment_method, payment_status, status, total_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?)`,
    [
      orderCode,
      customer.fullName,
      customer.phone,
      addressText,
      city,
      pincode,
      paymentMethod || "COD",
      paymentStatus || "PENDING",
      totalAmount,
    ],
    (err) => {
      if (err) {
        console.error("ORDER INSERT DB ERROR:", err);
        return res.status(500).json({
          message: "Order save failed",
          error: err.message,
          code: err.code,
        });
      }

      // ✅ Store items by order_code (NO order_id needed)
      const values = items.map((i) => [
        orderCode,
        i.name,
        Number(i.price || 0),
        Number(i.qty || 1),
        i.image || null,
      ]);

      db.query(
        `INSERT INTO order_items (order_code, name, price, qty, image)
         VALUES ?`,
        [values],
        async (err2) => {
          if (err2) {
            console.error("ORDER ITEMS DB ERROR:", err2);
            return res.status(500).json({
              message: "Order items failed",
              error: err2.message,
              code: err2.code,
            });
          }

          // 🔻 reduce stock (best-effort)
          items.forEach((i) => {
            if (!i?.id) return;
            db.query(
              "UPDATE products SET stock_qty = GREATEST(stock_qty - ?, 0) WHERE id = ?",
              [Number(i.qty || 1), i.id],
              () => {}
            );
          });

          // ✅ TELEGRAM NOTIFICATION (best-effort, won't block response)
          try {
            const itemLines = items
              .map((i) => `• ${i.name} x${Number(i.qty || 1)} (₹${Number(i.price || 0)})`)
              .join("\n");

            await notifyTelegram(
              `🥗 <b>New Order Received</b>\n` +
                `Order: <b>${orderCode}</b>\n` +
                `Name: ${customer.fullName}\n` +
                `Phone: ${customer.phone}\n` +
                `Payment: ${paymentMethod || "COD"} (${paymentStatus || "PENDING"})\n` +
                `Total: <b>₹${totalAmount}</b>\n\n` +
                `${itemLines}\n\n` +
                `Address: ${addressText || "-"}`
            );
          } catch (e) {
            console.log("Telegram notify error:", e?.message || e);
          }

          return res.json({
            message: "Order placed successfully ✅",
            orderCode,
          });
        }
      );
    }
  );
});

module.exports = router;
