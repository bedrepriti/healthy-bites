require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const orderRoutes = require("./src/routes/orderRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const adminOrderRoutes = require("./src/routes/adminOrderRoutes");
const adminProductRoutes = require("./src/routes/adminProductRoutes");
const productRoutes = require("./src/routes/productRoutes");

const db = require("./src/config/db");
const { notifyTelegram } = require("./src/utils/telegram");


const app = express();

/* ======================================================
   ✅ CORS CONFIG — MULTIPLE ORIGINS (Vercel + Local)
====================================================== */

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,     // https://healthy-bites-lac.vercel.app
  process.env.CLIENT_ORIGIN_2,   // https://healthy-bites-git-main-....vercel.app
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

// preflight support
app.options("*", cors());

/* ======================================================
   MIDDLEWARE
====================================================== */

app.use(express.json());

/* ======================================================
   HEALTH & DB CHECK
====================================================== */

app.get("/", (req, res) => {
  res.send("Healthy Bites API running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
app.get("/api/test-telegram", async (req, res) => {
  try {
    await notifyTelegram("✅ Telegram test from backend working!");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});


app.get("/api/db-ping", (req, res) => {
  db.getConnection((err, conn) => {
    if (err)
      return res
        .status(500)
        .json({ ok: false, error: err.message, code: err.code });

    conn.ping((pingErr) => {
      conn.release();
      if (pingErr)
        return res
          .status(500)
          .json({ ok: false, error: pingErr.message, code: pingErr.code });

      res.json({ ok: true });
    });
  });
});

/* ======================================================
   STATIC UPLOADS (still safe if unused)
====================================================== */

const UPLOAD_DIR = path.join(__dirname, "uploads");
const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_DIR, "products");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PRODUCT_UPLOAD_DIR))
  fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

// app.use("/uploads", express.static(UPLOAD_DIR));

/* ======================================================
   ROUTES
====================================================== */

// public
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);

// admin
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminProductRoutes);

/* ======================================================
   SOCKET.IO
====================================================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 socket connected:", socket.id);

  socket.on("joinOrder", (orderCode) => {
    socket.join(orderCode);
  });

  socket.on("disconnect", () => {
    console.log("🔴 socket disconnected:", socket.id);
  });
});

app.set("io", io);

/* ======================================================
   START SERVER
====================================================== */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
