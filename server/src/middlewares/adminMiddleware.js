function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ message: "ADMIN_KEY not set in server .env" });
  }

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized admin" });
  }

  next();
}

module.exports = { requireAdmin };
