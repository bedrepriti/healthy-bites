const express = require("express");
const router = express.Router();

const multer = require("multer");
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { requireAdmin } = require("../middlewares/adminMiddleware");

// ✅ Multer memory storage (no /uploads folder needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      file.mimetype
    );
    cb(ok ? null : new Error("Only png/jpg/jpeg/webp allowed"), ok);
  },
});

// ✅ helper: upload buffer to cloudinary
function uploadToCloudinary(buffer, folder = "healthy-bites/products") {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: false,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      )
      .end(buffer);
  });
}

// ✅ helper: delete old cloudinary image (safe)
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    // ignore best-effort
  }
}

/**
 * Mounted at: /api/admin
 * GET    /api/admin/products
 * POST   /api/admin/products (multipart)
 * PUT    /api/admin/products/:id (multipart)
 * PATCH  /api/admin/products/:id/stock
 * PATCH  /api/admin/products/:id/toggle
 * DELETE /api/admin/products/:id
 */

// ✅ GET all products (admin)
router.get("/products", requireAdmin, (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    // image already full url now
    const out = (rows || []).map((r) => ({
      ...r,
      image_url: r.image || null,
      sold_out: Number(r.stock_qty || 0) <= 0,
    }));
    res.json(out);
  });
});

// ✅ ADD product (Cloudinary)
router.post("/products", requireAdmin, upload.single("image"), async (req, res) => {
  const { name, price, category, tags, stock_qty, is_active } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields: name, price, category" });
  }

  let imageUrl = null;
  let publicId = null;

  try {
    if (req.file?.buffer) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;   // ✅ HTTPS
      publicId = result.public_id;    // ✅ for delete later
    }

    db.query(
      `INSERT INTO products (name, price, category, tags, image, image_public_id, stock_qty, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        Number(price),
        category,
        tags || null,
        imageUrl,
        publicId,
        Number(stock_qty || 0),
        Number(is_active ?? 1),
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err.message });

        res.json({
          message: "Product added ✅",
          id: result.insertId,
          image: imageUrl,
          image_public_id: publicId,
        });
      }
    );
  } catch (e) {
    return res.status(500).json({ message: "Cloudinary upload failed", error: e.message });
  }
});

// ✅ UPDATE product (replace image optionally)
router.put("/products/:id", requireAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, category, tags, stock_qty, is_active } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields: name, price, category" });
  }

  try {
    // get old cloudinary public id
    const [oldRow] = await new Promise((resolve, reject) => {
      db.query("SELECT image_public_id FROM products WHERE id=?", [id], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    let newImageUrl = null;
    let newPublicId = null;

    // if new image selected -> upload + delete old
    if (req.file?.buffer) {
      const result = await uploadToCloudinary(req.file.buffer);
      newImageUrl = result.secure_url;
      newPublicId = result.public_id;

      // delete old best-effort
      await deleteFromCloudinary(oldRow?.image_public_id);
    }

    db.query(
      `UPDATE products
       SET name=?, price=?, category=?, tags=?,
           image=COALESCE(?, image),
           image_public_id=COALESCE(?, image_public_id),
           stock_qty=?, is_active=?
       WHERE id=?`,
      [
        name,
        Number(price),
        category,
        tags || null,
        newImageUrl,
        newPublicId,
        Number(stock_qty || 0),
        Number(is_active ?? 1),
        id,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Product not found" });

        res.json({
          message: "Product updated ✅",
          image: newImageUrl || undefined,
          image_public_id: newPublicId || undefined,
        });
      }
    );
  } catch (e) {
    return res.status(500).json({ message: "Update failed", error: e.message });
  }
});

// ✅ PATCH stock
router.patch("/products/:id/stock", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { stock_qty } = req.body;

  db.query(
    "UPDATE products SET stock_qty=? WHERE id=?",
    [Number(stock_qty || 0), id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Stock updated ✅" });
    }
  );
});

// ✅ PATCH toggle active
router.patch("/products/:id/toggle", requireAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE products SET is_active = IF(is_active=1,0,1) WHERE id=?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Toggled ✅" });
    }
  );
});

// ✅ DELETE product (delete cloudinary image too)
router.delete("/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [row] = await new Promise((resolve, reject) => {
      db.query("SELECT image_public_id FROM products WHERE id=?", [id], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    db.query("DELETE FROM products WHERE id=?", [id], async (err2, result) => {
      if (err2) return res.status(500).json({ message: "DB error", error: err2.message });
      if (!result.affectedRows) return res.status(404).json({ message: "Product not found" });

      await deleteFromCloudinary(row?.image_public_id);
      res.json({ message: "Deleted ✅" });
    });
  } catch (e) {
    return res.status(500).json({ message: "Delete failed", error: e.message });
  }
});

module.exports = router;
