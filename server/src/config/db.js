const mysql = require("mysql2");

const isProd = process.env.NODE_ENV === "production";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: isProd
    ? {
        rejectUnauthorized: false, // OK for Aiven + Render
      }
    : undefined,
});

module.exports = pool;
